import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskList, TaskStatus } from '@prisma/client';
import {
  TaskProgressResponseDto,
  UserTaskProgressResponseDto,
} from '../dto/task-response.dto';

@Injectable()
export class TaskProgressService {
  constructor(private prisma: PrismaService) {}

  async getUserProgress(userId: string): Promise<TaskProgressResponseDto[]> {
    return await this.prisma.userTaskProgress.findMany({
      where: { userId },
      select: {
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

    const taskIsCompleted = await this.prisma.userTaskProgress.findUnique({
      where: {
        userId_taskKey: {
          userId,
          taskKey,
        },
        status: { not: TaskStatus.IN_PROGRESS },
      },
    });

    if (taskIsCompleted) {
      throw new BadRequestException('Задание уже выполнено');
    }

    const updatedProgress = await this.prisma.userTaskProgress.upsert({
      where: {
        userId_taskKey: {
          userId,
          taskKey,
        },
      },
      create: {
        userId,
        taskKey,
        progress: progressIncrement,
        status:
          progressIncrement >= task.goal
            ? TaskStatus.COMPLETED
            : TaskStatus.IN_PROGRESS,
        completedAt: progressIncrement >= task.goal ? new Date() : null,
      },
      update: {
        progress: {
          increment: progressIncrement,
        },
        status: {
          set:
            progressIncrement >= task.goal
              ? TaskStatus.COMPLETED
              : TaskStatus.IN_PROGRESS,
        },
        completedAt: progressIncrement >= task.goal ? new Date() : null,
      },
    });

    return updatedProgress;
  }
}
