import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TaskList, TransactionType } from '@prisma/client';
import { TransactionCreateService } from '../../transaction/transaction-create.service';
import { AppLoggerService } from '../../logger/logger.service';
import { TaskManagementService } from 'src/modules/task/services/task-management.service';

@Injectable()
export class EventRewardDistributionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionCreateService: TransactionCreateService,
    private readonly loggerService: AppLoggerService,
    private readonly taskManagementService: TaskManagementService,
  ) {}

  @Cron('0 * * * *') // Каждый час, в начале часа
  async distributeBonuses() {
    this.loggerService.log('EventRewardDistributionService started');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();

    const finishedEvents = await this.getAllFinishedEventsLastHour(
      now,
      oneHourAgo,
    );

    // Собираем уникальные userId
    const uniqueUserIds = [
      ...new Set(finishedEvents.map((event) => event.creatorId)),
    ];

    // Одним проходом для каждого пользователя выполняем проверку задач
    for (const userId of uniqueUserIds) {
      await this.taskManagementService.verifyTaskCompletion(
        userId,
        TaskList.HOLDED_MEETINGS,
      );
      await this.taskManagementService.verifyTaskCompletion(
        userId,
        TaskList.MAX_GUESTS_IN_MEETING,
      );
    }

    const eventsWithBalance = finishedEvents.filter(
      (el) => el.wallet && el.wallet.balance > 0,
    );

    if (!eventsWithBalance.length) {
      this.loggerService.log(
        'No finished events for distribute reward. Abort scheduler service',
      );

      return;
    }

    for (const event of eventsWithBalance) {
      if (!event.wallet?.id) {
        throw new InternalServerErrorException('Кошелек события не существует');
      }

      const deposit = event.wallet.balance;
      const eventWalletId = event.wallet.id;

      const activities = await this.prisma.activity.findMany({
        where: {
          eventId: event.id,
          isConfirmed: true,
        },
        select: {
          id: true,
          user: {
            select: {
              wallet: true,
            },
          },
        },

        orderBy: { joinedAt: 'asc' },
      });

      const creatorWallet = await this.prisma.wallet.findUnique({
        where: { userId: event.creatorId },
      });

      const participantsWalletsIds = activities.map((el) => {
        return {
          walletId: el.user.wallet?.id ?? '',
          activityId: el.id,
        };
      });

      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        try {
          // Никто не пришел
          if (participantsWalletsIds.length === 0) {
            if (!creatorWallet) {
              throw new InternalServerErrorException(
                'Кошелек создателя события не существует',
              );
            }

            await this.transactionCreateService.createTransactionBetweenWallets(
              tx,
              event.creatorId,
              {
                fromWalletId: eventWalletId, // Кошелек мероприятия
                toWalletId: creatorWallet.id, // Кошелек создателя
                amount: deposit,
                type: TransactionType.EVENT_FUND_REFUND,
              },
            );

            return;
          }

          let distribution: {
            walletId: string;
            amount: number;
            activityId: string;
          }[] = [];

          if (event.bonusDistributionType === 'ALL') {
            const amountPerUser = Number(
              (deposit / participantsWalletsIds.length).toFixed(2),
            );
            distribution = participantsWalletsIds.map((item) => ({
              walletId: item.walletId,
              amount: amountPerUser,
              activityId: item.activityId,
            }));
          } else if (event.bonusDistributionType === 'FIRST') {
            distribution = [
              {
                walletId: participantsWalletsIds[0].walletId,
                amount: deposit,
                activityId: participantsWalletsIds[0].activityId,
              },
            ];
          } else if (event.bonusDistributionType === 'FIRST_N') {
            const N = event.bonusDistributionN ?? 0;

            if (N <= 0 || participantsWalletsIds.length < N) {
              // Если N не задан или участников меньше, делим как ALL
              const amountPerUser = Number(
                (deposit / participantsWalletsIds.length).toFixed(2),
              );
              distribution = participantsWalletsIds.map((item) => ({
                walletId: item.walletId,
                amount: amountPerUser,
                activityId: item.activityId,
              }));
            } else {
              const selectedParticipants = participantsWalletsIds.slice(0, N);
              const amountPerUser = Number((deposit / N).toFixed(2));
              distribution = selectedParticipants.map((item) => ({
                walletId: item.walletId,
                amount: amountPerUser,
                activityId: item.activityId,
              }));
            }
          }

          // Тут рассылаю всем, кому положено

          for (const { walletId, amount, activityId } of distribution) {
            await this.transactionCreateService.createTransactionBetweenWallets(
              tx,
              event.creatorId,
              {
                fromWalletId: eventWalletId,
                toWalletId: walletId,
                amount,
                type: TransactionType.EVENT_FUND_DISTRIBUTION,
              },
            );

            await tx.activity.update({
              where: { id: activityId },
              data: { receivedPoints: amount },
            });
          }
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          }

          throw new InternalServerErrorException(
            'Ошибка при распределении призового фонда.',
          );
        }
      });
    }

    // система возврата остатков с кошелька события на системный кошелек
    const eventsWithCashback = await this.getAllFinishedEventsLastHour(
      now,
      oneHourAgo,
      true,
    );

    if (eventsWithCashback) {
      for (const event of eventsWithCashback) {
        await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          try {
            if (!event.wallet) {
              throw new InternalServerErrorException(
                'Кошелек события не существует',
              );
            }

            await this.transactionCreateService.createTransactionToSystemWallet(
              tx,
              event.creatorId,
              event.wallet.id,
              parseFloat(event.wallet.balance.toFixed(2)),
              TransactionType.EVENT_FUND_REFUND,
            );
            //во избежание остатков в кошельке - хардкодим 0
            await tx.wallet.update({
              where: { id: event.wallet.id },
              data: { balance: 0 },
            });
          } catch (error) {
            if (error instanceof HttpException) {
              throw error;
            }

            throw new InternalServerErrorException(
              'Ошибка при распределении призового фонда.',
            );
          }
        });
      }
    }

    this.loggerService.log('EventRewardDistributionService finished');
  }

  private async getAllFinishedEventsLastHour(
    now: Date,
    oneHourAgo: Date,
    hasBalance?: boolean,
  ) {
    return await this.prisma.event.findMany({
      where: {
        finishDate: {
          gte: oneHourAgo,
          lte: now,
        },
        wallet: hasBalance ? { balance: { gt: 0 } } : undefined,
        isArchived: false,
      },
      include: {
        creator: true,
        wallet: true,
      },
    });
  }
}
