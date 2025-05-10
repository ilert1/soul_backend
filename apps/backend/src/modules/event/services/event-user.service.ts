import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PaginatedResult } from 'src/common/types/paginarted-result';
import { getDistance } from 'src/common/utils/geoposition';
import { paginate } from 'src/common/utils/pagination.utils';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ResponseUsersEventDto } from '../dto/response-users-events';

@Injectable()
export class EventUserService {
  constructor(private prisma: PrismaService) {}

  async findEventsByUserId(
    userId: string,
    sortByStartDate: 'asc' | 'desc',
    period: 'past' | 'future',
    onlyCreatedByUser: boolean,
    paginationDto: { page: number; limit: number },
    usersCoordinates?: {
      longitude: number;
      latitude: number;
    },
  ): Promise<PaginatedResult<ResponseUsersEventDto>> {
    const searchingUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    // Если у пользователя showActivityToOthers === false, кидаем ошибку Forbidden
    if (!searchingUser.showActivityToOthers) {
      throw new ForbiddenException(
        'Вы не можете просматривать активности этого пользователя.',
      );
    }

    let startDate: Record<string, unknown>;
    let finalSelectOptions: Record<string, unknown>;
    //общий селект для предстоящих И для прошедших event
    const commonSelectOptions = {
      id: true,
      title: true,
      startDate: true,
      image: {
        select: {
          id: true,
          mimeType: true,
        },
      },

      activities: { select: { userId: true } },
    };

    //определяем фильтры и доп селекторы для предстоящих ИЛИ для прошедших event
    if (period === 'past') {
      startDate = { lt: new Date() };
      finalSelectOptions = {
        ...commonSelectOptions,
        activities: { select: { userId: true }, where: { isConfirmed: true } },
        averageRating: true,
      };
    } else {
      startDate = { gt: new Date() };
      finalSelectOptions = {
        ...commonSelectOptions,
        finishDate: true,
        guestLimit: true,
        deposit: true,
        activities: { select: { userId: true } },
      };
    }

    //добавляем селект места события при указании координат и предстоящих событий
    if (usersCoordinates && period === 'future') {
      if (!usersCoordinates.latitude || !usersCoordinates.longitude)
        throw new BadRequestException(
          'В указанных координатах отсутствует долгода и/или широта',
        );

      finalSelectOptions.place = {
        select: { latitude: true, longitude: true },
      };
    }

    // определяем параметры поиска событий (создатель ИЛИ создатель и участник) + сортировка + фильтрация по дате + селекты
    const options = onlyCreatedByUser
      ? {
          where: { creatorId: userId, startDate, isArchived: false },
          order: { startDate: sortByStartDate },
          select: finalSelectOptions,
        }
      : {
          where: {
            OR: [{ creatorId: userId }, { activities: { some: { userId } } }],
            startDate,
            isArchived: false,
          },
          order: { startDate: sortByStartDate },
          select: finalSelectOptions,
        };

    //передаем параметры  в утилиту пагинации
    const eventsWithGuest = await paginate<
      ResponseUsersEventDto & {
        activities: Array<unknown>;
        place: { latitude: number; longitude: number };
      }
    >({
      prisma: this.prisma,
      model: 'event',
      paginationDto,
      options,
    });

    let result: PaginatedResult<ResponseUsersEventDto>;

    //Если фронт передал коорды пользователя и запрашивает предстоящие события - рассчитываем для каждого расстояние до него, также заменяет перечени гостей на их количество
    if (usersCoordinates && period === 'future') {
      result = {
        ...eventsWithGuest,
        items: eventsWithGuest.items.map(({ place, activities, ...rest }) => ({
          ...rest,
          distance: parseFloat(
            (getDistance(place, usersCoordinates) / 1000).toFixed(1),
          ),
          activitiesCount: activities.length,
        })),
      };
    } else {
      result = {
        ...eventsWithGuest,
        items: eventsWithGuest.items.map(({ activities, ...rest }) => ({
          ...rest,
          activitiesCount: activities.length,
        })),
      };
    }

    return result;
  }
}
