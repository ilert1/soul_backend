import { BadRequestException, Injectable } from '@nestjs/common';
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
    // Проверяем, что переданный параметр является допустимым значением из TaskType
    if (!Object.values(TaskType).includes(type)) {
      throw new BadRequestException('Невалидный тип заданий');
    }

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
    // Проверяем, что переданный параметр является допустимым значением из TaskList
    if (!Object.values(TaskList).includes(taskKey)) {
      throw new BadRequestException('Невалидный ключ задания');
    }

    // Проверяем, что пользователь существует
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new BadRequestException('Пользователь не найден');
    }

    const progress = await this.prisma.userTaskProgress.upsert({
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

    if (!progress) {
      throw new BadRequestException('Ошибка получения прогресса');
    }

    return progress;
  }

  async updateTaskProgress(
    userId: string,
    taskKey: TaskList,
    progressIncrement: number,
  ): Promise<UserTaskProgressResponseDto> {
    const task = await this.prisma.task.findUniqueOrThrow({
      where: { key: taskKey },
    });

    const existingProgress = await this.getUserProgressUniqueTask(
      userId,
      taskKey,
    );

    // Если задача уже не в статусе IN_PROGRESS — больше апдейтить нельзя
    if (existingProgress.status !== TaskStatus.IN_PROGRESS) {
      return existingProgress;
    }

    let newProgress: number = existingProgress.progress + progressIncrement;
    let newStatus: TaskStatus = TaskStatus.IN_PROGRESS;
    let completedAt: Date | null = null;

    if (task.goal !== 0 && newProgress >= task.goal) {
      newStatus = TaskStatus.COMPLETED;
      completedAt = new Date();
      newProgress = task.goal; // не больше чем goal
    }

    return await this.prisma.userTaskProgress.update({
      where: {
        userId_taskKey: {
          userId,
          taskKey,
        },
      },
      data: {
        progress: newProgress,
        status: newStatus,
        completedAt,
      },
    });
  }
}
