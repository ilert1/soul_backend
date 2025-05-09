import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskList, TaskStatus, TaskType } from '@prisma/client';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';
import { TaskProgressService } from './task-progress.service';
import { TelegramClientService } from 'src/modules/telegramClient/telegramClient.service';
import { GroupBotService } from 'src/telegram/groupBot/group-bot.service';

@Injectable()
export class TaskWeeklyService {
  constructor(
    private prisma: PrismaService,
    private progressService: TaskProgressService,
    private telegramClientService: TelegramClientService,
    private groupBotService: GroupBotService,
  ) {}

  async confirmWeeklyUserTask(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const subTask = await this.prisma.task.findUniqueOrThrow({
      where: { key: taskKey, type: TaskType.WEEKLY, parentKey: { not: null } },
      select: {
        key: true,
        parentKey: true,
        goal: true,
      },
    });

    const userProgress = await this.progressService.getUserProgressUniqueTask(
      userId,
      taskKey,
    );

    let result: UserTaskProgressResponseDto | undefined;

    // Завершаем задачу, если в процессе или ожидает подтверждения
    if (
      userProgress.status === TaskStatus.IN_PROGRESS ||
      userProgress.status === TaskStatus.PENDING_CHECK
    ) {
      result = await this.prisma.userTaskProgress.update({
        where: { userId_taskKey: { userId, taskKey } },
        data: {
          progress: subTask.goal,
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    } else {
      return userProgress;
    }

    // Проверим, завершены ли все подзадачи и при необходимости обновим главную
    const siblingSubTasks = await this.prisma.task.findMany({
      where: { parentKey: subTask.parentKey },
      select: { key: true },
    });

    const siblingProgress = await this.prisma.userTaskProgress.findMany({
      where: {
        userId,
        taskKey: { in: siblingSubTasks.map((s) => s.key) },
      },
      select: { taskKey: true, status: true },
    });

    const completedCount = siblingProgress.filter(
      (p) => p.status === TaskStatus.COMPLETED,
    ).length;

    const allSubTasksCompleted =
      siblingProgress.length === siblingSubTasks.length;

    await this.prisma.userTaskProgress.upsert({
      where: { userId_taskKey: { userId, taskKey: subTask.parentKey! } },
      update: {
        progress: completedCount,
        status: allSubTasksCompleted
          ? TaskStatus.COMPLETED
          : TaskStatus.IN_PROGRESS,
        completedAt: allSubTasksCompleted ? new Date() : null,
      },
      create: {
        userId,
        taskKey: subTask.parentKey!,
        progress: completedCount,
        status: allSubTasksCompleted
          ? TaskStatus.COMPLETED
          : TaskStatus.IN_PROGRESS,
        completedAt: allSubTasksCompleted ? new Date() : null,
      },
    });

    return result;
  }

  // Для заданий которые невозможно проверить на сервере
  async pendingCheckWeeklyTask(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const userTaskProgress = await this.validateAndGetUserWeeklyTaskProgress(
      userId,
      taskKey,
    );

    let result: UserTaskProgressResponseDto | undefined;

    if (userTaskProgress.status === TaskStatus.IN_PROGRESS) {
      switch (taskKey) {
        // Проверка задания посмотреть инстаграм
        case TaskList.SUBSCRIBED_INSTAGRAM: {
          result = await this.prisma.userTaskProgress.update({
            where: { userId_taskKey: { userId, taskKey } },
            data: { status: TaskStatus.PENDING_CHECK },
          });

          break;
        }

        default:
          throw new NotFoundException('Задание не найдено');
      }
    }

    if (!result) {
      return userTaskProgress;
    }

    return result;
  }

  async checkWeeklyTask(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const userTaskProgress = await this.validateAndGetUserWeeklyTaskProgress(
      userId,
      taskKey,
    );

    let result: UserTaskProgressResponseDto | undefined;

    const { weekStart, weekEnd } = this.getCurrentWeekRange();

    if (userTaskProgress.status === TaskStatus.PENDING_CHECK) {
      switch (taskKey) {
        // Проверка задания посмотреть инстаграм
        case TaskList.SUBSCRIBED_INSTAGRAM: {
          result = await this.confirmWeeklyUserTask(userId, taskKey);

          break;
        }

        default:
          throw new NotFoundException('Задание не найдено');
      }
    }

    if (userTaskProgress.status === TaskStatus.IN_PROGRESS) {
      switch (taskKey) {
        // Проверка задания подписаться на форум
        case TaskList.SUBSCRIBED_SOUL_FORUM: {
          const user = await this.prisma.telegramUser.findUnique({
            where: { userId },
            select: { telegramId: true },
          });

          if (!user || !user.telegramId) {
            throw new InternalServerErrorException(
              'Telegram профиль не привязан',
            );
          }

          const isMember = await this.groupBotService.userIsChatMember(
            parseInt(user.telegramId),
          );

          if (isMember) {
            result = await this.confirmWeeklyUserTask(userId, taskKey);
          }

          break;
        }
        // Проверка задания буста группы
        case TaskList.VOTED_SOUL_FORUM: {
          const user = await this.prisma.telegramUser.findUnique({
            where: { userId },
            select: { telegramId: true },
          });

          if (!user || !user.telegramId) {
            throw new InternalServerErrorException(
              'Telegram профиль не привязан',
            );
          }

          const isBoosted = await this.groupBotService.userIsBoosted(
            parseInt(user.telegramId),
          );

          if (isBoosted) {
            result = await this.confirmWeeklyUserTask(userId, taskKey);
          }

          break;
        }
        // Проверка задания поделиться с другом
        case TaskList.SHARED_WITH_FRIEND: {
          const count = await this.prisma.invite.count({
            where: {
              inviterId: userId,
              createdAt: {
                gte: weekStart,
                lte: weekEnd,
              },
            },
          });

          if (count >= 1) {
            result = await this.confirmWeeklyUserTask(userId, taskKey);
          }

          break;
        }
        // Проверка задания поделиться с другом
        case TaskList.ADDED_REFLINK_IN_TG_PROFILE: {
          const user = await this.prisma.telegramUser.findUnique({
            where: { userId },
            select: { telegramId: true },
          });

          if (!user || !user.telegramId) {
            throw new InternalServerErrorException(
              'Telegram профиль не привязан',
            );
          }

          const refLinkStart = process.env.REF_LINK_START;
          const referralLink = `${refLinkStart}`;

          const about = await this.telegramClientService.getTgUserAbout(
            user.telegramId,
          );
          const hasReferralLink = about.includes(referralLink);

          if (hasReferralLink) {
            result = await this.confirmWeeklyUserTask(userId, taskKey);
          }

          break;
        }

        default:
          throw new NotFoundException('Задание не найдено');
      }
    }

    if (!result) {
      return userTaskProgress;
    }

    return result;
  }

  async resetAllWeeklyTask(): Promise<void> {
    const weeklyTaskKeys = await this.getWeeklyTaskKeys();

    // удаляем прогресс по этим taskKey
    await this.prisma.userTaskProgress.deleteMany({
      where: {
        taskKey: {
          in: weeklyTaskKeys,
        },
      },
    });
  }

  private async getWeeklyTaskKeys(): Promise<TaskList[]> {
    // находим все taskKey, у которых type = WEEKLY
    const weeklyTasks = await this.prisma.task.findMany({
      where: {
        type: 'WEEKLY',
      },
      select: {
        key: true,
      },
    });

    // возвращаем массив ключей
    return weeklyTasks.map((task) => task.key);
  }

  private async validateAndGetUserWeeklyTaskProgress(
    userId: string,
    taskKey: TaskList,
  ) {
    const userTaskProgress =
      await this.progressService.getUserProgressUniqueTask(userId, taskKey);

    const weeklyTaskKeys = await this.getWeeklyTaskKeys();

    if (!weeklyTaskKeys.includes(taskKey)) {
      throw new NotFoundException('Задание не найдено в списке недельных');
    }

    return userTaskProgress;
  }

  private getCurrentWeekRange(): { weekStart: Date; weekEnd: Date } {
    const now = new Date();

    // День недели: 0 (вс) – 6 (сб)
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day; // если воскресенье — отнимаем 6

    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() + diffToMonday);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return {
      weekStart,
      weekEnd,
    };
  }
}
