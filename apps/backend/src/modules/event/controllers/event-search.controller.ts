import { Controller, Get, Query } from '@nestjs/common';
import {
  PaginatedResponseEventSearchDto,
  ResponseEventSearchDto,
} from '../dto/search-event.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EntryCondition } from '@prisma/client';
import { DEFAULT_PAGE_SIZE } from 'src/common/utils/constants';
import { ResponseEventMapMarkerDto } from '../dto/event-markers.dto';
import { PaginatedResult } from 'src/common/types/paginarted-result';
import { EventSearchService } from '../services/event-search.service';

@ApiBearerAuth()
@ApiTags('Event')
@Controller('event')
export class EventSearchController {
  constructor(private readonly eventSearchService: EventSearchService) {}

  @Get('/search')
  @ApiOperation({
    summary: 'Поиск предстоящих событий с фильтрацией',
  })
  @ApiQuery({
    name: 'latitude',
    required: true,
    description: 'Широта (для расчета расстояния)',
    example: 55.7558,
  })
  @ApiQuery({
    name: 'longitude',
    required: true,
    description: 'Долгота (для расчета расстояния)',
    example: 37.6173,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество записей',
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 1,
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Дата события в формате ГГГГ-ММ-ДД',
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'minDistance',
    required: false,
    minimum: 0,
    description: 'Минимальное расстояние в км',
    example: 10,
  })
  @ApiQuery({
    name: 'maxDistance',
    required: false,
    maximum: 200,
    description: 'Максимальное расстояние в км (максимум 200)',
    example: 50,
  })
  @ApiQuery({
    name: 'entryCondition',
    required: false,
    description: 'Условие входа',
    example: 'FREE',
  })
  @ApiQuery({
    name: 'minGuests',
    required: false,
    minimum: 0,
    description: 'Минимальное количество участников',
    example: 5,
  })
  @ApiQuery({
    name: 'maxGuests',
    required: false,
    description: 'Максимальное количество участников',
    example: 100,
  })
  @ApiQuery({
    name: 'minDeposit',
    required: false,
    minimum: 0,
    description: 'Минимальная сумма депозита события',
    example: 100,
  })
  @ApiQuery({
    name: 'maxDeposit',
    required: false,
    description: 'Максимальная сумма депозита события',
    example: 1000,
  })
  @ApiResponse({
    status: 200,
    type: PaginatedResponseEventSearchDto,
  })
  @ApiResponse({ status: 404, description: 'События не найдены' })
  async searchEvents(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('limit') limit: number = DEFAULT_PAGE_SIZE,
    @Query('page') page: number = 1,
    @Query('date') date: string = new Date().toISOString(),
    @Query('minDistance') minDistance: number = 0,
    @Query('maxDistance') maxDistance: number = 200,
    @Query('entryCondition') entryCondition?: EntryCondition,
    @Query('minGuests') minGuests?: number,
    @Query('maxGuests') maxGuests?: number,
    @Query('minDeposit') minDeposit?: number,
    @Query('maxDeposit') maxDeposit?: number,
  ): Promise<PaginatedResult<ResponseEventSearchDto>> {
    return this.eventSearchService.searchEvents(
      { latitude, longitude },
      { limit, page },
      {
        date,
        minDistance,
        maxDistance,
        entryCondition,
        minGuests,
        maxGuests,
        minDeposit,
        maxDeposit,
      },
    );
  }

  @Get('/map-markers')
  @ApiOperation({
    summary: 'Получение координат мероприятий для отображения на карте',
  })
  @ApiQuery({
    name: 'latitude',
    required: true,
    description: 'Широта центра поиска',
    example: 55.7558,
  })
  @ApiQuery({
    name: 'longitude',
    required: true,
    description: 'Долгота центра поиска',
    example: 37.6173,
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    maximum: 200,
    description: 'Радиус поиска в км (максимум 200)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    isArray: true,
    type: ResponseEventMapMarkerDto,
  })
  async getEventMapMarkers(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 200,
  ): Promise<ResponseEventMapMarkerDto[]> {
    return this.eventSearchService.getEventMapMarkers(
      { latitude, longitude },
      radius,
    );
  }
}
