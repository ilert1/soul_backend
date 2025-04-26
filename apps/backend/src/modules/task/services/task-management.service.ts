import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ExperienceType,
  TaskList,
  TaskStatus,
  TaskType,
  TransactionType,
} from '@prisma/client';
import { TransactionCreateService } from 'src/modules/transaction/transaction-create.service';
import { TaskProgressService } from './task-progress.service';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';
import { ExperienceService } from 'src/modules/experience/experience.service';
import { experiencePoints } from 'src/modules/experience/dto/constants';

@Injectable()
export class TaskManagementService {
  constructor(
    private prisma: PrismaService,
    private progressService: TaskProgressService,
    private readonly transactionCreateService: TransactionCreateService,
    private readonly experienceServise: ExperienceService,
  ) {}

  async confirmUserTask(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const task = await this.prisma.task.findUniqueOrThrow({
      where: {
        key: taskKey,
      },
    });

    return await this.prisma.$transaction(async (prisma) => {
      const existing = await this.progressService.getUserProgressUniqueTask(
        userId,
        taskKey,
      );

      if (!existing) {
        // если записи нет — создаём новую как COMPLETED
        return await prisma.userTaskProgress.create({
          data: {
            userId,
            taskKey,
            progress: task.goal,
            status: TaskStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      }

      if (existing.status !== TaskStatus.IN_PROGRESS) {
        // если статус не IN_PROGRESS — возвращаем как есть
        return existing;
      }

      // если статус IN_PROGRESS — обновляем на COMPLETED
      return await prisma.userTaskProgress.update({
        where: {
          userId_taskKey: { userId, taskKey },
        },
        data: {
          progress: task.goal,
          status: { set: TaskStatus.COMPLETED },
          completedAt: new Date(),
        },
      });
    });
  }

  async resetUserTask(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    return await this.prisma.userTaskProgress.upsert({
      where: {
        userId_taskKey: { userId, taskKey },
      },
      update: {
        progress: 0,
        status: { set: TaskStatus.IN_PROGRESS },
        completedAt: null,
      },
      create: {
        userId,
        taskKey,
      },
    });
  }

  async verifyTaskCompletion(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const userTaskProgress =
      await this.progressService.getUserProgressUniqueTask(userId, taskKey);

    let result: UserTaskProgressResponseDto | undefined;

    switch (taskKey) {
      // Проверка задания "Создана первая встреча"
      case TaskList.CREATED_FIRST_MEETING: {
        const count = await this.prisma.event.count({
          where: { creatorId: userId },
        });

        if (count === 1) {
          result = await this.confirmUserTask(userId, taskKey);
        }

        break;
      }

      // Проверка для задания "Проведенные встречи"
      case TaskList.HOLDED_MEETINGS:
      case TaskList.HOLDED_1_MEETINGS:
      case TaskList.HOLDED_5_MEETINGS:
      case TaskList.HOLDED_10_MEETINGS:
      case TaskList.HOLDED_20_MEETINGS:
      case TaskList.HOLDED_50_MEETINGS: {
        const eventCount = await this.prisma.event.count({
          where: {
            creatorId: userId,
            isArchived: false,
            finishDate: { lte: new Date() },
          },
        });

        result = await this.checkProgressForTasks(
          userId,
          eventCount,
          TaskType.SECTION_MEETINGS,
          TaskList.HOLDED_MEETINGS,
          [
            TaskList.HOLDED_1_MEETINGS,
            TaskList.HOLDED_5_MEETINGS,
            TaskList.HOLDED_10_MEETINGS,
            TaskList.HOLDED_20_MEETINGS,
            TaskList.HOLDED_50_MEETINGS,
          ],
        );

        break;
      }

      // Проверяем задание "Максимальное количество гостей на встрече"
      case TaskList.MAX_GUESTS_IN_MEETING:
      case TaskList.MAX_GUESTS_5_IN_MEETING:
      case TaskList.MAX_GUESTS_10_IN_MEETING:
      case TaskList.MAX_GUESTS_20_IN_MEETING:
      case TaskList.MAX_GUESTS_50_IN_MEETING: {
        const activityCounts = await this.prisma.activity.groupBy({
          by: ['eventId'],
          where: {
            isConfirmed: true,
            event: {
              creatorId: userId,
              isArchived: false,
              finishDate: { lte: new Date() },
            },
          },
          _count: { id: true },
        });

        const maxGuests = Math.max(
          0,
          ...activityCounts.map((a) => a._count.id),
        );

        result = await this.checkProgressForTasks(
          userId,
          maxGuests,
          TaskType.SECTION_MEETINGS,
          TaskList.MAX_GUESTS_IN_MEETING,
          [
            TaskList.MAX_GUESTS_5_IN_MEETING,
            TaskList.MAX_GUESTS_10_IN_MEETING,
            TaskList.MAX_GUESTS_20_IN_MEETING,
            TaskList.MAX_GUESTS_50_IN_MEETING,
          ],
        );

        break;
      }

      // Проверяем задание "Приглашенные друзья"
      case TaskList.INVITED_FRIENDS:
      case TaskList.INVITED_1_FRIENDS:
      case TaskList.INVITED_5_FRIENDS:
      case TaskList.INVITED_10_FRIENDS:
      case TaskList.INVITED_20_FRIENDS:
      case TaskList.INVITED_50_FRIENDS:
      case TaskList.INVITED_100_FRIENDS: {
        const invitedCount = await this.prisma.invite.count({
          where: {
            inviterId: userId,
            inviteeUser: {
              isActive: true,
            },
          },
        });

        result = await this.checkProgressForTasks(
          userId,
          invitedCount,
          TaskType.SECTION_FRIENDS,
          TaskList.INVITED_FRIENDS,
          [
            TaskList.INVITED_1_FRIENDS,
            TaskList.INVITED_5_FRIENDS,
            TaskList.INVITED_10_FRIENDS,
            TaskList.INVITED_20_FRIENDS,
            TaskList.INVITED_50_FRIENDS,
            TaskList.INVITED_100_FRIENDS,
          ],
        );

        break;
      }

      // Проверяем задание "Собрано SP"
      case TaskList.COLLECTED_SP:
      case TaskList.COLLECTED_10_SP:
      case TaskList.COLLECTED_50_SP:
      case TaskList.COLLECTED_100_SP:
      case TaskList.COLLECTED_250_SP:
      case TaskList.COLLECTED_500_SP:
      case TaskList.COLLECTED_1000_SP:
      case TaskList.COLLECTED_2500_SP:
      case TaskList.COLLECTED_5000_SP: {
        const collectedSP = await this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            toWallet: { userId },
            type: TransactionType.FARM_REWARD,
          },
        });

        const totalSP = collectedSP._sum.amount ?? 0;

        result = await this.checkProgressForTasks(
          userId,
          totalSP,
          TaskType.SECTION_FARMING,
          TaskList.COLLECTED_SP,
          [
            TaskList.COLLECTED_10_SP,
            TaskList.COLLECTED_50_SP,
            TaskList.COLLECTED_100_SP,
            TaskList.COLLECTED_250_SP,
            TaskList.COLLECTED_500_SP,
            TaskList.COLLECTED_1000_SP,
            TaskList.COLLECTED_2500_SP,
            TaskList.COLLECTED_5000_SP,
          ],
        );

        break;
      }

      default:
        throw new NotFoundException('Задание не найдено');
    }

    if (!result) {
      return userTaskProgress;
    }

    return result;
  }

  async collectReward(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const taskProgress = await this.prisma.userTaskProgress.upsert({
      where: {
        userId_taskKey: {
          userId,
          taskKey,
        },
      },
      create: {
        userId,
        taskKey,
      },
      update: {},
      include: { task: { select: { rewardSp: true } } },
    });

    if (taskProgress.status !== TaskStatus.COMPLETED) {
      throw new BadRequestException(
        'Задание не завершено или награда уже получена',
      );
    }

    const wallet = await this.prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      throw new InternalServerErrorException('У пользователя нет кошелька');
    }

    return await this.prisma.$transaction(async (tx) => {
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

      const result = await tx.userTaskProgress.update({
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
          userId: true,
          taskKey: true,
          progress: true,
          status: true,
          completedAt: true,
        },
      });

      // Добавляем опыт
      if (
        result &&
        Object.values(ExperienceType).includes(taskKey as ExperienceType)
      ) {
        await this.experienceServise.addExperience({
          userId,
          type: taskKey as ExperienceType,
        });
      }

      return result;
    });
  }

  async checkProgressForTasks(
    userId: string,
    actualValue: number,
    taskType: TaskType,
    infinityTaskKey: TaskList,
    keys: TaskList[],
  ) {
    const tasks = await this.prisma.task.findMany({
      where: {
        type: taskType,
        goal: { gt: 0 },
        key: { in: keys },
      },
    });

    // Параллельно проверяем все задачи
    await Promise.all(
      tasks.map(async (task) => {
        const userTaskProgress =
          await this.progressService.getUserProgressUniqueTask(
            userId,
            task.key,
          );

        if (actualValue >= task.goal) {
          // Если прогресс совпадает с goal — закрываем задачу
          await this.confirmUserTask(userId, task.key);
        } else {
          // Если прогресс не совпадает с фактическим количеством встреч — корректируем
          const diff = actualValue - userTaskProgress.progress;

          if (diff !== 0) {
            await this.progressService.updateTaskProgress(
              userId,
              task.key,
              diff,
            );
          }
        }
      }),
    );

    // Отдельно обрабатываем основную бесконечную задачу (можно её не обрабатывать)
    const infiniteTaskProgress =
      await this.progressService.getUserProgressUniqueTask(
        userId,
        infinityTaskKey,
      );

    const diff = actualValue - infiniteTaskProgress.progress;

    if (diff !== 0) {
      return this.progressService.updateTaskProgress(
        userId,
        infinityTaskKey,
        diff,
      );
    }
  }
}
