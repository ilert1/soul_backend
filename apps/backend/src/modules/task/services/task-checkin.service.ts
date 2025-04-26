import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ExperienceType,
  TaskList,
  TaskStatus,
  TransactionType,
} from '@prisma/client';
import { TransactionCreateService } from 'src/modules/transaction/transaction-create.service';
import { checkinReward } from '../task.constants';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';
import { ExperienceService } from 'src/modules/experience/experience.service';

@Injectable()
export class TaskCheckinService {
  constructor(
    private prisma: PrismaService,
    private readonly transactionCreateService: TransactionCreateService,
    private readonly experienceServise: ExperienceService,
  ) {}

  async userCheckIn(userId: string): Promise<UserTaskProgressResponseDto> {
    const now = new Date();

    const lastCheckIn = await this.prisma.userTaskProgress.upsert({
      where: {
        userId_taskKey: {
          userId,
          taskKey: TaskList.CHECKIN,
        },
      },
      create: {
        userId,
        taskKey: TaskList.CHECKIN,
      },
      update: {},
    });

    let streak = 1;

    if (lastCheckIn?.completedAt) {
      const hoursSinceLastCheckIn =
        (now.getTime() - lastCheckIn.completedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastCheckIn < 24) {
        await this.prisma.userTaskProgress.update({
          where: {
            userId_taskKey: {
              userId,
              taskKey: TaskList.CHECKIN,
            },
          },
          data: {
            status: TaskStatus.IN_PROGRESS,
          },
        });
        throw new BadRequestException(
          'Можно выполнять чекин только раз в 24 часа',
        );
      }

      streak = hoursSinceLastCheckIn < 48 ? lastCheckIn.progress + 1 : 1;

      if (streak === 7) {
        // Добавляем опыт
        await this.experienceServise.addExperience({
          userId,
          type: ExperienceType.CHECKIN_7_DAYS,
        });
      }

      if (streak > 7) streak = 1;
    }

    const reward = checkinReward[streak];

    const userTaskProgress = await this.prisma.userTaskProgress.update({
      where: {
        userId_taskKey: {
          userId,
          taskKey: TaskList.CHECKIN,
        },
      },
      data: {
        progress: streak,
        status: TaskStatus.COMPLETED,
        completedAt: now,
      },
      select: {
        userId: true,
        taskKey: true,
        progress: true,
        status: true,
        completedAt: true,
      },
    });

    const wallet = await this.prisma.wallet.findFirst({ where: { userId } });

    if (!wallet) {
      throw new InternalServerErrorException('У пользователя нет кошелька');
    }

    await this.prisma.$transaction(async (tx) => {
      try {
        await this.transactionCreateService.createTransactionFromSystemWallet(
          tx,
          wallet.id,
          reward,
          TransactionType.TASK_REWARD,
        );
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }

        throw new InternalServerErrorException('Ошибка при начислении награды');
      }
    });

    return userTaskProgress;
  }
}
