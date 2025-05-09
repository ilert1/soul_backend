import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TransactionType } from '@prisma/client';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TransactionCreateService } from 'src/modules/transaction/transaction-create.service';

@Injectable()
export class GroupBotScheduleService {
  constructor(
    private prisma: PrismaService,
    private readonly loggerService: AppLoggerService,
    private readonly transactionCreateService: TransactionCreateService,
  ) {}

  @Cron('0 0 * * *') // Каждый день в 00:00
  async cleanMonthlyMessages(): Promise<void> {
    this.loggerService.log('cleanMonthlyMessages started');

    try {
      await this.prisma.messages.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });
      this.loggerService.log('All messages have been successfully deleted');
    } catch (error) {
      this.loggerService.error('Failed to delete messages', error);
      throw error;
    }

    this.loggerService.log('cleanMonthlyMessages finished');
  }

  @Cron('0 * * * *') // Каждый час
  async creditForumReward(): Promise<void> {
    this.loggerService.log('creditForumReward started');

    try {
      const users = await this.prisma.telegramUser.findMany({
        where: {
          forumReward: {
            gt: 0,
          },
        },
        select: {
          telegramId: true,
          userId: true,
          forumReward: true,
        },
      });

      for (const user of users) {
        const wallet = await this.prisma.wallet.findFirst({
          where: { userId: user.userId },
        });

        if (!wallet) {
          this.loggerService.error(`User ${user.userId} has no wallet`);

          continue;
        }

        await this.prisma.$transaction(async (tx) => {
          try {
            await this.transactionCreateService.createTransactionFromSystemWallet(
              tx,
              wallet.id,
              user.forumReward,
              TransactionType.FORUM_REWARD,
            );

            await tx.telegramUser.update({
              where: { telegramId: user.telegramId },
              data: {
                forumReward: 0,
              },
            });
          } catch (error) {
            this.loggerService.error(
              `Failed to credit rewards for ${user.userId}`,
              error,
            );
          }
        });
      }
    } catch (error) {
      this.loggerService.error('Failed to credit rewards', error);
      throw error;
    }

    this.loggerService.log('creditForumReward finished');
  }
}
