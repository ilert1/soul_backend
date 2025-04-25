import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskList, TaskStatus, TaskType } from '@prisma/client';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';

@Injectable()
export class TaskProgressService {
  constructor(private prisma: PrismaService) {}

  async getUserProgress(
    userId: string,
  ): Promise<UserTaskProgressResponseDto[]> {
    return await this.prisma.userTaskProgress.findMany({
      where: { userId },
      select: {
        userId: true,
        taskKey: true,
        progress: true,
        status: true,
        updatedAt: true,
        completedAt: true,
      },
    });
  }

  async getUserTaskTypeProgress(
    userId: string,
    type: TaskType,
  ): Promise<UserTaskProgressResponseDto[]> {
    // Получаем список ключей задач с нужным типом
    const taskTypeKeys = await this.prisma.task.findMany({
      where: {
        type,
        goal: { gt: 0 },
      },
      select: { key: true },
    });

    const keys = taskTypeKeys.map((task) => task.key);

    if (!keys.length) {
      return [];
    }

    // Получаем прогресс по ключам задач
    return this.prisma.userTaskProgress.findMany({
      where: {
        userId,
        taskKey: { in: keys },
      },
      select: {
        userId: true,
        taskKey: true,
        progress: true,
        status: true,
        updatedAt: true,
        completedAt: true,
      },
    });
  }

  async getUserProgressUniqueTask(
    userId: string,
    taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    return await this.prisma.userTaskProgress.upsert({
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
      select: {
        id: true,
        userId: true,
        taskKey: true,
        progress: true,
        status: true,
        updatedAt: true,
        completedAt: true,
      },
    });
  }

  async updateTaskProgress(
    userId: string,
    taskKey: TaskList,
    progressIncrement: number,
  ): Promise<UserTaskProgressResponseDto> {
    const task = await this.prisma.task.findUniqueOrThrow({
      where: { key: taskKey },
    });

    const existingProgress = await this.prisma.userTaskProgress.findUnique({
      where: {
        userId_taskKey: {
          userId,
          taskKey,
        },
      },
    });

    // Если задача уже не в статусе IN_PROGRESS — больше апдейтить нельзя
    if (
      existingProgress?.status &&
      existingProgress.status !== TaskStatus.IN_PROGRESS
    ) {
      return existingProgress;
    }

    let newProgress: number =
      (existingProgress?.progress ?? 0) + progressIncrement;
    let status: TaskStatus = TaskStatus.IN_PROGRESS;
    let completedAt: Date | null = null;

    if (task.goal !== 0 && newProgress >= task.goal) {
      status = TaskStatus.COMPLETED;
      completedAt = new Date();
      newProgress = task.goal; // не больше чем goal
    }

    return await this.prisma.userTaskProgress.upsert({
      where: {
        userId_taskKey: {
          userId,
          taskKey,
        },
      },
      create: {
        userId,
        taskKey,
        progress: newProgress,
        status,
        completedAt,
      },
      update: {
        progress: newProgress,
        status: status,
        completedAt,
      },
    });
  }
}
