import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskList, TaskStatus } from '@prisma/client';
import { mainTaskToSubTasks, subTaskToMainTask } from '../task.constants';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';
import { TaskProgressService } from './task-progress.service';
import { TelegramClientService } from 'src/modules/telegramClient/telegramClient.service';

@Injectable()
export class TaskWeeklyService {
  constructor(
    private prisma: PrismaService,
    private progressService: TaskProgressService,
    private telegramClientService: TelegramClientService,
  ) {}

  async confirmWeeklyUserTask(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const mainTaskKey = subTaskToMainTask[taskKey];
    const subTasks = mainTaskToSubTasks[taskKey];

    // Если это подзадача
    if (mainTaskKey) {
      let subTaskProgress =
        await this.progressService.getUserProgressUniqueTask(userId, taskKey);

      // если статус IN_PROGRESS — завершаем подзадачу
      if (subTaskProgress.status === TaskStatus.IN_PROGRESS) {
        subTaskProgress = await this.prisma.userTaskProgress.update({
          where: { userId_taskKey: { userId, taskKey } },
          data: {
            progress: 1,
            status: TaskStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        // После этого проверяем все подзадачи
        const relatedTasks = await this.prisma.userTaskProgress.findMany({
          where: {
            userId,
            taskKey: { in: mainTaskToSubTasks[mainTaskKey] },
          },
          select: {
            taskKey: true,
            status: true,
          },
        });

        const allSubTasksCompleted =
          mainTaskToSubTasks[mainTaskKey]?.every(
            (subKey) =>
              relatedTasks.find(
                (task) =>
                  task.taskKey === subKey &&
                  task.status === TaskStatus.COMPLETED,
              ) !== undefined,
          ) ?? false;

        const parentTaskData = await this.prisma.task.findUnique({
          where: { key: mainTaskKey },
          select: { goal: true },
        });

        if (allSubTasksCompleted) {
          // Завершаем главную задачу
          await this.prisma.userTaskProgress.upsert({
            where: { userId_taskKey: { userId, taskKey: mainTaskKey } },
            update: {
              progress: parentTaskData?.goal ?? subTasks?.length ?? 2,
              status: TaskStatus.COMPLETED,
              completedAt: new Date(),
            },
            create: {
              userId,
              taskKey: mainTaskKey,
              progress: parentTaskData?.goal ?? subTasks?.length ?? 2,
              status: TaskStatus.COMPLETED,
              completedAt: new Date(),
            },
          });
        } else {
          // Подзадачи ещё не все сделаны, но главную нужно пометить как начатую
          await this.prisma.userTaskProgress.upsert({
            where: { userId_taskKey: { userId, taskKey: mainTaskKey } },
            update: {
              progress: 1,
              status: TaskStatus.IN_PROGRESS,
              completedAt: null,
            },
            create: {
              userId,
              taskKey: mainTaskKey,
              progress: 1,
              status: TaskStatus.IN_PROGRESS,
              completedAt: null,
            },
          });
        }
      }

      // Возвращаем результат подзадачи
      return subTaskProgress;
    }

    // Если это главная задача
    if (subTasks) {
      const relatedTasks = await this.prisma.userTaskProgress.findMany({
        where: {
          userId,
          taskKey: { in: subTasks },
        },
        select: {
          taskKey: true,
          status: true,
        },
      });

      const allSubTasksCompleted = subTasks.every(
        (subKey) =>
          relatedTasks.find(
            (task) =>
              task.taskKey === subKey && task.status === TaskStatus.COMPLETED,
          ) !== undefined,
      );

      const parentTask = await this.prisma.task.findUnique({
        where: { key: taskKey },
        select: { goal: true },
      });

      let mainTaskProgress =
        await this.progressService.getUserProgressUniqueTask(userId, taskKey);

      if (allSubTasksCompleted) {
        // если все подзадачи выполнены - завершаем главную
        mainTaskProgress = await this.prisma.userTaskProgress.upsert({
          where: { userId_taskKey: { userId, taskKey } },
          update: {
            progress: parentTask?.goal ?? subTasks.length,
            status: TaskStatus.COMPLETED,
            completedAt: new Date(),
          },
          create: {
            userId,
            taskKey,
            progress: parentTask?.goal ?? subTasks.length,
            status: TaskStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      } else {
        // если задача не найдена - создаём
        if (!mainTaskProgress) {
          const completedSubTasks = relatedTasks.filter(
            (task) => task.status === TaskStatus.COMPLETED,
          );

          mainTaskProgress = await this.prisma.userTaskProgress.create({
            data: {
              userId,
              taskKey,
              progress: completedSubTasks.length,
            },
          });
        }
      }

      return mainTaskProgress;
    }

    // если ни подзадача и ни главная - ошибка
    throw new BadRequestException('Задача не найдена');
  }

  async checkWeeklyTask(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const userTaskProgress =
      await this.progressService.getUserProgressUniqueTask(userId, taskKey);
    const weeklyTaskKeys = await this.getWeeklyTaskKeys();

    if (!weeklyTaskKeys.includes(taskKey)) {
      throw new NotFoundException('Задание не найдено');
    }

    if (userTaskProgress.status !== TaskStatus.IN_PROGRESS) {
      return userTaskProgress;
    }

    let result: UserTaskProgressResponseDto | undefined;

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

    switch (taskKey) {
      // Проверка задания посмотреть инстаграм
      case TaskList.SUBSCRIBED_INSTAGRAM: {
        result = await this.confirmWeeklyUserTask(userId, taskKey);

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

  async getWeeklyTaskKeys(): Promise<TaskList[]> {
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
}
