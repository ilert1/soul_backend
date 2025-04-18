import { Injectable, BadRequestException } from '@nestjs/common';
import { EntryCondition } from '@prisma/client';
import { PaginatedResult } from 'src/common/types/paginarted-result';
import { getDistance } from 'src/common/utils/geoposition';
import { searchPaginate } from 'src/common/utils/search-pagination.utils';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ResponseEventMapMarkerDto } from '../dto/event-markers.dto';
import { ResponseEventSearchDto } from '../dto/search-event.dto';

@Injectable()
export class EventSearchService {
  constructor(private prisma: PrismaService) {}

  async searchEvents(
    coordinates: { latitude: number; longitude: number },
    paginationDto: { limit: number; page: number },
    filterParams: {
      date: string;
      minDistance: number;
      maxDistance: number;
      entryCondition?: EntryCondition;
      minGuests?: number;
      maxGuests?: number;
      minDeposit?: number;
      maxDeposit?: number;
    },
  ): Promise<PaginatedResult<ResponseEventSearchDto>> {
    // Проверка координат
    if (!coordinates.latitude || !coordinates.longitude) {
      throw new BadRequestException('Координаты не найдены');
    }

    // Проверка дистанции
    if (filterParams.minDistance < 0 || filterParams.maxDistance < 0) {
      throw new BadRequestException('Дистанция не может быть меньше 0');
    }

    if (filterParams.maxDistance > 200) {
      throw new BadRequestException('Дистанция не может быть больше 200');
    }

    if (filterParams.minDistance > filterParams.maxDistance) {
      throw new BadRequestException(
        'Минимальная дистанция не может быть больше максимальной',
      );
    }

    // Проверка условий входа
    if (
      filterParams.entryCondition &&
      !Object.values(EntryCondition).includes(filterParams.entryCondition)
    ) {
      throw new BadRequestException('Неверное условие входа');
    }

    // Проверка количества гостей
    if (filterParams.minGuests && filterParams.minGuests < 0) {
      throw new BadRequestException(
        'Минимальное количество гостей не может быть меньше 0',
      );
    }

    if (filterParams.maxGuests && filterParams.maxGuests < 0) {
      throw new BadRequestException(
        'Максимальное количество гостей не может быть меньше 0',
      );
    }

    if (filterParams.minGuests && filterParams.maxGuests) {
      if (filterParams.minGuests > filterParams.maxGuests) {
        throw new BadRequestException(
          'Минимальное количество гостей не может быть больше максимального',
        );
      }
    }

    // Проверка депозита
    if (filterParams.minDeposit && filterParams.minDeposit < 0) {
      throw new BadRequestException(
        'Минимальный депозит не может быть меньше 0',
      );
    }

    if (filterParams.maxDeposit && filterParams.maxDeposit < 0) {
      throw new BadRequestException(
        'Максимальный депозит не может быть меньше 0',
      );
    }

    if (filterParams.minDeposit && filterParams.maxDeposit) {
      if (filterParams.minDeposit > filterParams.maxDeposit) {
        throw new BadRequestException(
          'Минимальный депозит не может быть больше максимального',
        );
      }
    }

    // Проверка страницы
    if (paginationDto.page < 1) {
      throw new BadRequestException('Номер страницы не может быть меньше 1');
    }

    // Проверка лимита
    if (paginationDto.limit < 1) {
      throw new BadRequestException('Лимит не может быть меньше 1');
    }

    // Проверка даты
    const date = new Date(filterParams.date);
    const isValidDate = date instanceof Date && !isNaN(date.getTime());

    if (!isValidDate) {
      throw new BadRequestException('Неверная дата');
    }

    const beforeThanNow = date < new Date();

    // Формирование запроса
    const where: Record<string, any> = {
      isArchived: false,
      startDate: { gt: beforeThanNow ? new Date() : date },
    };

    // Фильтры
    if (filterParams.entryCondition) {
      where.entryCondition = filterParams.entryCondition;
    }

    if (filterParams.minDeposit || filterParams.maxDeposit) {
      where.deposit = {
        ...(filterParams.minDeposit && { gte: filterParams.minDeposit }),
        ...(filterParams.maxDeposit && { lte: filterParams.maxDeposit }),
      };
    }

    // Получение событий
    const events = await this.prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        image: {
          select: {
            id: true,
            mimeType: true,
          },
        },
        startDate: true,
        deposit: true,
        guestLimit: true,
        place: { select: { latitude: true, longitude: true } },
        activities: { select: { id: true } },
      },
    });

    // Расчет расстояний и количества участников событий, фильтрация и сортировка
    const eventsWithDistanceAndGuests: ResponseEventSearchDto[] = events
      .map((event) => {
        const distance =
          getDistance(coordinates, {
            latitude: event.place.latitude,
            longitude: event.place.longitude,
          }) / 1000;

        const connectedGuests = event.activities.length;

        // убираем place и activities из финального объекта
        const { place: _place, activities: _activities, ...rest } = event;

        return {
          ...rest,
          distance: parseFloat(distance.toFixed(1)),
          connectedGuests,
          image: event.image ?? { id: '', mimeType: '' },
        };
      })
      .filter(
        ({ distance, connectedGuests }) =>
          (!filterParams.minDistance || distance >= filterParams.minDistance) &&
          (!filterParams.maxDistance || distance <= filterParams.maxDistance) &&
          (!filterParams.minGuests ||
            connectedGuests >= filterParams.minGuests) &&
          (!filterParams.maxGuests ||
            connectedGuests <= filterParams.maxGuests),
      )
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

    // Пагинация
    const paginatedEvents = searchPaginate<ResponseEventSearchDto>({
      items: eventsWithDistanceAndGuests,
      paginationDto,
    });

    return paginatedEvents;
  }

  async getEventMapMarkers(
    center: { latitude: number; longitude: number },
    radiusKm: number,
  ): Promise<ResponseEventMapMarkerDto[]> {
    // Проверка координат
    if (!center.latitude || !center.longitude) {
      throw new BadRequestException('Координаты не найдены');
    }

    // Проверка дистанции
    if (radiusKm < 0) {
      throw new BadRequestException('Радиус не может быть меньше 0');
    }

    if (radiusKm > 200) {
      throw new BadRequestException('Радиус не может быть больше 200');
    }

    const events = await this.prisma.event.findMany({
      where: {
        startDate: { gt: new Date() },
        isArchived: false,
      },
      select: {
        id: true,
        place: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    return events.filter((event) => {
      const distance =
        getDistance(center, {
          latitude: event.place.latitude,
          longitude: event.place.longitude,
        }) / 1000;

      return distance <= radiusKm;
    });
  }
}
