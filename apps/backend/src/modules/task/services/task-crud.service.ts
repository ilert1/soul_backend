import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskResponseDto } from '../dto/task-response.dto';
import { TaskType } from '@prisma/client';

@Injectable()
export class TaskCrudService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(type?: TaskType): Promise<TaskResponseDto[]> {
    const whereCondition = type
      ? { type, goal: { gt: 0 } }
      : { goal: { gt: 0 } };

    return this.prisma.task.findMany({
      where: whereCondition,
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
}
