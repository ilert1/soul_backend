import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskList, TaskStatus } from '@prisma/client';
import { mainTaskToSubTasks, subTaskToMainTask } from '../task.constants';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';
import { TaskProgressService } from './task-progress.service';

@Injectable()
export class TaskWeeklyService {
  constructor(
    private prisma: PrismaService,
    private progressService: TaskProgressService,
  ) {}

  async confirmWeeklyUserTask(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    const mainTaskKey = subTaskToMainTask[taskKey];

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
              progress: parentTaskData?.goal ?? 2,
              status: TaskStatus.COMPLETED,
              completedAt: new Date(),
            },
            create: {
              userId,
              taskKey: mainTaskKey,
              progress: parentTaskData?.goal ?? 2,
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
    const subTasks = mainTaskToSubTasks[taskKey];

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

  async resetAllWeeklyTask(): Promise<void> {
    // находим все taskKey, у которых type = WEEKLY
    const weeklyTasks = await this.prisma.task.findMany({
      where: {
        type: 'WEEKLY',
      },
      select: {
        key: true,
      },
    });

    // формируем массив ключей
    const weeklyTaskKeys = weeklyTasks.map((task) => task.key);

    // удаляем прогресс по этим taskKey
    await this.prisma.userTaskProgress.deleteMany({
      where: {
        taskKey: {
          in: weeklyTaskKeys,
        },
      },
    });
  }
}
