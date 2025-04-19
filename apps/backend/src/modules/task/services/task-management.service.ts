import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskList, TaskStatus, TransactionType } from '@prisma/client';
import { TransactionCreateService } from 'src/modules/transaction/transaction-create.service';
import { TaskProgressService } from './task-progress.service';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';

@Injectable()
export class TaskManagementService {
  constructor(
    private prisma: PrismaService,
    private progressService: TaskProgressService,
    private readonly transactionCreateService: TransactionCreateService,
  ) {}

  async verifyTaskCompletion(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    // Логика проверки для разных типов заданий

    // Проверка для задания "Профиль завершен" (пример)
    if (taskKey === TaskList.PROFILE_COMPLETED) {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });

      const isCompleted = user.fullName && user.description;

      if (isCompleted) {
        const result = await this.progressService.updateTaskProgress(
          userId,
          taskKey,
          1,
        );

        return result;
      }

      throw new BadRequestException('Профиль не завершен');
    }

    throw new NotFoundException('Задание не найдено');
  }

  async collectReward(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const taskProgress = await this.prisma.userTaskProgress.findUniqueOrThrow({
      where: {
        userId_taskKey: {
          userId,
          taskKey,
        },
      },
      include: { task: { select: { rewardSp: true } } },
    });

    if (taskProgress.status !== TaskStatus.COMPLETED) {
      throw new BadRequestException(
        'Задание не завершено или награда уже получена',
      );
    }

    // Для ежедневного чекина награда выдается сразу
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      throw new InternalServerErrorException('У пользователя нет кошелька');
    }

    await this.prisma.$transaction(async (tx) => {
      try {
        await this.transactionCreateService.createTransactionFromSystemWallet(
          tx,
          wallet.id,
          taskProgress.task.rewardSp,
          TransactionType.TASK_REWARD,
        );
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }

        throw new InternalServerErrorException('Ошибка при начислении награды');
      }
    });

    const result = await this.prisma.userTaskProgress.update({
      where: {
        userId_taskKey: {
          userId,
          taskKey,
        },
      },
      data: {
        status: TaskStatus.REWARD_COLLECTED,
      },
      select: {
        id: true,
        progress: true,
        status: true,
        completedAt: true,
      },
    });

    return result;
  }
}
