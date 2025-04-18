import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  PaginatedResponseUsersEventDto,
  ResponseUsersEventDto,
  ResponseUsersEventFutureExample,
  ResponseUsersEventPastExample,
} from '../dto/response-users-events';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DEFAULT_PAGE_SIZE } from 'src/common/utils/constants';
import { PaginatedResult } from 'src/common/types/paginarted-result';
import { EventUserService } from '../services/event-user.service';

@ApiBearerAuth()
@ApiTags('Event')
@Controller('event')
export class EventUserController {
  constructor(private readonly eventUserService: EventUserService) {}

  @Get('/by-user/:userId')
  @ApiOperation({
    summary: 'Получение всех событий (активностей) по id пользователя',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Данные для получения всех событий по id пользователя',
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
    name: 'sort',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Сортировка по дате начала мероприятия',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['future', 'past'],
    default: 'future',
    description: 'Фильтр: предшествующие или прошедшие',
  })
  @ApiQuery({
    name: 'only-created-by-user',
    required: false,
    type: Boolean,
    default: false,
    description: 'Фильтр: Cозданные пользователем или все ',
  })
  @ApiQuery({
    name: 'latitude',
    required: false,
    type: Number,
    description: 'Широта (для предстоящих событий)',
  })
  @ApiQuery({
    name: 'longitude',
    required: false,
    type: Number,
    description: 'Долгота (для предстоящих событий)',
  })
  @ApiResponse({
    status: 200,
    type: PaginatedResponseUsersEventDto,
    examples: {
      example1: {
        value: ResponseUsersEventFutureExample,
        summary: 'Список предстоящих событий',
      },
      example2: {
        value: ResponseUsersEventPastExample,
        summary: 'Список прошедших событий',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  async getEventsByUserId(
    @Param('userId') userId: string,
    @Query('limit') limit: number = DEFAULT_PAGE_SIZE,
    @Query('page') page: number = 1,
    @Query('sort') sortByStartDate: 'asc' | 'desc' = 'desc',
    @Query('period') period: 'past' | 'future' = 'future',
    @Query('only-created-by-user') onlyCreatedByUser: boolean = false,
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
  ): Promise<PaginatedResult<ResponseUsersEventDto>> {
    return await this.eventUserService.findEventsByUserId(
      userId,
      sortByStartDate,
      period,
      onlyCreatedByUser,
      { limit, page },
      { longitude, latitude },
    );
  }
}
