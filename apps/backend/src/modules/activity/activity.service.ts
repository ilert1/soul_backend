import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  CreateActivityRequestDto,
  ActivityResponseDto,
} from './dto/create-activity.dto';
import { encrypt } from 'src/common/utils/hash.utils';
import { ResponseHashDto } from 'src/common/dto/response-hash.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async createActivity(
    createActivityDto: CreateActivityRequestDto,
    currentUserId: string,
  ): Promise<ActivityResponseDto> {
    // Проверка на существование события
    const eventExists = await this.prisma.event.findUniqueOrThrow({
      where: { id: createActivityDto.eventId, isArchived: false },
    });

    // Проверка что событие не принадлежит текущему пользователю
    if (eventExists.creatorId === currentUserId) {
      throw new BadRequestException(
        'Пользователь не может принять участие в своем собственном событии',
      );
    }

    // Проверка на существование активности
    const activityExists = await this.prisma.activity.findFirst({
      where: {
        userId: currentUserId,
        eventId: createActivityDto.eventId,
      },
    });

    if (activityExists) {
      throw new BadRequestException(
        'Пользователь уже записался на участие в данном событии',
      );
    }

    // Создание активности, если проверки пройдены
    return await this.prisma.activity.create({
      data: {
        userId: currentUserId,
        eventId: createActivityDto.eventId,
      },
    });
  }

  async findAllActivities(): Promise<ActivityResponseDto[]> {
    return await this.prisma.activity.findMany({
      where: { event: { isArchived: false } },
    });
  }

  async findActivityById(id: string): Promise<ActivityResponseDto> {
    const activity = await this.prisma.activity.findUniqueOrThrow({
      where: { id, event: { isArchived: false } },
    });

    return activity;
  }

  async findAllActivitieslByUserId(
    userId: string,
  ): Promise<ActivityResponseDto[]> {
    return await this.prisma.activity.findMany({
      where: { userId, event: { isArchived: false } },
    });
  }

  async findAllByEventId(eventId: string): Promise<ActivityResponseDto[]> {
    return await this.prisma.activity.findMany({
      where: { eventId, event: { isArchived: false } },
    });
  }

  async deleteActivityById(id: string, userId: string) {
    return await this.prisma.activity.delete({
      where: { id, userId: userId, event: { isArchived: false } },
    });
  }

  async getHash(activityId: string): Promise<ResponseHashDto> {
    await this.prisma.activity.findUniqueOrThrow({
      where: { id: activityId },
    });

    return { hash: encrypt(activityId) };
  }

  //----- методы удаления всех активностей для конкретного пользователя или события закоментированы, так как отсутствуют API или сервисы которые их реализуют
  //
  // // Удаляем все активности для события
  // async deleteAllActivitiesByEventId(eventId: string) {
  //   // Проверка на существование события
  //   const eventExists = await this.prisma.event.findUnique({
  //     where: { id: eventId },
  //   });
  //   if (!eventExists) {
  //     throw new NotFoundException('Событие не найдено');
  //   }
  //   // Проверяем, существуют ли активности для данного события
  //   const activities = await this.prisma.activity.findMany({
  //     where: { eventId: eventId },
  //   });
  //   if (activities.length === 0) {
  //     throw new NotFoundException('Нет активностей для указанного события');
  //   }
  //   await this.prisma.activity.deleteMany({
  //     where: { eventId: eventId },
  //   });
  //   return {
  //     message: `Все активности для указанного события были успешно удалены.`,
  //   };
  // }

  // // Удаляем все активности для пользователя
  // async deleteAllActivitiesByUserId(userId: string) {
  //   // Проверка на существование пользователя
  //   const userExists = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //   });
  //   if (!userExists) {
  //     throw new NotFoundException('Пользователь не найден');
  //   }
  //   // Проверяем, существуют ли активности для данного события
  //   const activities = await this.prisma.activity.findMany({
  //     where: { userId: userId },
  //   });
  //   if (activities.length === 0) {
  //     throw new NotFoundException(
  //       'Нет активностей для указанного пользователя',
  //     );
  //   }
  //   await this.prisma.activity.deleteMany({
  //     where: { userId: userId },
  //   });
  //   return {
  //     message: `Все активности для указанного пользователя были успешно удалены.`,
  //   };
  // }
}
