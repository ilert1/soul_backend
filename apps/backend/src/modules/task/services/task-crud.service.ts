import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskResponseDto } from '../dto/task-response.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TaskCrudService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(): Promise<TaskResponseDto[]> {
    return await this.prisma.task.findMany({
      select: {
        key: true,
        type: true,
        title: true,
        description: true,
        goal: true,
        rewardSp: true,
      },
    });
  }

  async initializeUserTasks(userId: string) {
    const allTasks = await this.prisma.task.findMany();

    const userTasks = await this.prisma.userTaskProgress.findMany({
      where: { userId },
      select: { taskKey: true },
    });

    const existingtaskKeys = new Set(userTasks.map((t) => t.taskKey));
    const tasksToCreate = allTasks.filter(
      (task) => !existingtaskKeys.has(task.key),
    );

    if (tasksToCreate.length > 0) {
      await this.prisma.userTaskProgress.createMany({
        data: tasksToCreate.map((task) => ({
          userId,
          taskKey: task.key,
          progress: 0,
          status: TaskStatus.IN_PROGRESS,
        })),
      });
    }
  }
}
