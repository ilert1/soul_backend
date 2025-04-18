import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppLoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionCreateService } from '../transaction/transaction-create.service';
import { Prisma } from '@prisma/client';
import { REFERRAL_PERCENTAGE } from './invite.constant';
import { TransactionType } from '@prisma/client';
import {
  InviteeWalletsWithSumOfTx,
  InviterDataMap,
  InviterDataFromDB,
  InviteData,
} from './types/referal-point-schedule.type';

@Injectable()
export class SendReferralsPointsSchedulerService {
  private readonly loggerService: AppLoggerService;
  private readonly prismaService: PrismaService;
  private readonly transactionCreateService: TransactionCreateService;
  constructor(
    loggerService: AppLoggerService,
    prismaService: PrismaService,
    transactionCreateService: TransactionCreateService,
  ) {
    this.loggerService = loggerService;
    this.prismaService = prismaService;
    this.transactionCreateService = transactionCreateService;
  }

  @Cron('0 * * * *')
  async scheduleInit() {
    const startTime = Date.now();
    this.loggerService.log('SendReferralsPointsSchedulerService started');
    //получить кошельки рефералов, с которых за полседний час были переведены коины с суммами трат
    const inviteeWalletIdsWithSum = await this.getInviteeWalletsWithSum();

    // если не нашлось кошельков рефералов с которых за последний час были снятия - завершаем функцию
    if (!inviteeWalletIdsWithSum?.length) {
      this.loggerService.log(
        'No referral transactions for spending points. Abort scheduler service',
      );
      const endTime = Date.now();
      const durationInMinutes = (endTime - startTime) / (1000 * 60);
      this.loggerService.log(
        `SendReferralsPointsSchedulerService finished in ${durationInMinutes.toFixed(2)} minutes`,
      );

      return;
    }

    const mappedAllInvitersData = await this.getMappedInvitersData(
      inviteeWalletIdsWithSum,
    );
    await this.processReferralTransactions(
      inviteeWalletIdsWithSum,
      mappedAllInvitersData,
    );
    const endTime = Date.now();
    const durationInMinutes = (endTime - startTime) / (1000 * 60);
    this.loggerService.log(
      `SendReferralsPointsSchedulerService finished in ${durationInMinutes.toFixed(2)} minutes`,
    );
  }

  private async getInviteeWalletsWithSum(): Promise<
    InviteeWalletsWithSumOfTx | []
  > {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();

    return await this.prismaService.transaction.groupBy({
      by: ['fromWalletId'],
      where: {
        createdAt: {
          gte: oneHourAgo,
          lte: now,
        },
        fromWallet: {
          user: {
            inviteeUser: { isNot: null },
          },
        },
      },
      _sum: {
        amount: true,
      },
    });
  }

  private async getMappedInvitersData(
    inviteeWalletIdsWithSum: Exclude<InviteeWalletsWithSumOfTx, null>,
  ): Promise<InviterDataMap> {
    const allInvitersData: Array<InviterDataFromDB> =
      await this.prismaService.wallet.findMany({
        where: {
          id: {
            in: inviteeWalletIdsWithSum.map((wallet) => wallet.fromWalletId),
          },
        },
        select: {
          id: true,
          user: {
            select: {
              inviteeUser: {
                select: {
                  id: true,
                  inviterUser: {
                    select: { id: true, wallet: { select: { id: true } } },
                  },
                },
              },
            },
          },
        },
      });

    return new Map(
      allInvitersData.map((oneInviterData) => {
        if (
          !oneInviterData?.user?.inviteeUser?.id ||
          !oneInviterData?.user?.inviteeUser?.inviterUser?.id ||
          !oneInviterData?.user?.inviteeUser?.inviterUser?.wallet?.id
        ) {
          throw new InternalServerErrorException(
            'Insufficient inviter data for referral points transaction. Database is in an inconsistent state. Operation aborted.',
          );
        }

        return [
          oneInviterData.id,
          {
            inviteId: oneInviterData.user.inviteeUser.id,
            inviterUserId: oneInviterData.user.inviteeUser.inviterUser.id,
            inviterWalletId:
              oneInviterData.user.inviteeUser.inviterUser.wallet.id,
          },
        ];
      }),
    );
  }

  private async processReferralTransactions(
    inviteeWalletIdsWithSum: Exclude<InviteeWalletsWithSumOfTx, null>,
    mappedAllInvitersData: InviterDataMap,
  ) {
    //проходимся по данным рефералов и для каждого проводим транзакцию на кошелек пригласившего его юзера
    for (const inviteeWallet of inviteeWalletIdsWithSum) {
      const inviterData = mappedAllInvitersData.get(inviteeWallet.fromWalletId);

      if (!inviteeWallet._sum.amount || !inviteeWallet.fromWalletId) {
        throw new InternalServerErrorException(
          'Insufficient invitee data for referral points transaction. Database is in an inconsistent state. Operation aborted.',
        );
      }

      const referalPointsForInviter =
        inviteeWallet._sum.amount * REFERRAL_PERCENTAGE;

      if (
        !inviterData ||
        !inviterData.inviteId ||
        !inviterData.inviterUserId ||
        !inviterData.inviterWalletId
      ) {
        throw new InternalServerErrorException(
          'Insufficient inviter data for referral points transaction. Database is in an inconsistent state. Operation aborted.',
        );
      }

      await this.createReferralTransaction(
        inviterData,
        referalPointsForInviter,
      );
    }
  }

  private async createReferralTransaction(
    inviterData: InviteData,
    referalPointsForInviter: number,
  ): Promise<void> {
    try {
      await this.prismaService.$transaction(
        async (tx: Prisma.TransactionClient) => {
          await this.transactionCreateService.createTransactionFromSystemWallet(
            tx,
            inviterData.inviterWalletId,
            referalPointsForInviter,
            TransactionType.REFERRAL_REWARD,
          );
          //обновляем количество SP от конкретного реферала
          await tx.invite.update({
            where: { id: inviterData.inviteId },
            data: {
              referralPointsGiven: { increment: referalPointsForInviter },
            },
          });
          //обновляем количество SP за все время работы реферальной программы
          await tx.user.update({
            where: { id: inviterData.inviterUserId },
            data: {
              totalReferralPoints: { increment: referalPointsForInviter },
            },
          });
        },
      );
    } catch (error: unknown) {
      this.loggerService.error(
        'Error during transaction processing when transferring referral points to the inviting user.',
        error,
      );
      throw new InternalServerErrorException(
        'Error during transaction processing when transferring referral points to the inviting user.',
      );
    }
  }
}
