import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserPayload } from '../../../common/types/user-payload.dto';
import { ResponseEventDto } from '../dto/response-event.dto';
import {
  CreateEventRequestDto,
  UpdateEventRequestDto,
} from '../dto/create-event.dto';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/common/decorators/current-user.decorator';
import { CreateEventExamples } from '../examples/create-event-examples';
import { EventCrudService } from '../services/event-crud.service';

@ApiBearerAuth()
@ApiTags('Event')
@Controller('event')
export class EventCrudController {
  constructor(private readonly eventCrudService: EventCrudService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новое событие' })
  @ApiBody({
    description: 'Данные для создания события',
    type: CreateEventRequestDto,
    examples: CreateEventExamples,
  })
  @ApiResponse({
    status: 201,
    description: 'Событие успешно создано',
    type: ResponseEventDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя серверная ошибка',
    example: {
      message: 'Event is null after transaction creating Event with Wallet',
      error: 'Internal Server Error',
      statusCode: 500,
    },
  })
  async createEvent(
    @User() user: UserPayload,
    @Body() createEventDto: CreateEventRequestDto,
  ): Promise<ResponseEventDto> {
    return await this.eventCrudService.createEvent(createEventDto, user.id);
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Получить событие по ID' })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Данные для поиска события по eventId',
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
  })
  @ApiQuery({
    name: 'latitude',
    required: false,
    type: Number,
    description: 'Широта текущего пользователя',
  })
  @ApiQuery({
    name: 'longitude',
    required: false,
    type: Number,
    description: 'Долгота текущего пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Событие найдено',
    type: ResponseEventDto,
  })
  @ApiResponse({ status: 404, description: 'Событие не найдено' })
  async getEventById(
    @Param('eventId') eventId: string,
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
  ): Promise<ResponseEventDto> {
    return await this.eventCrudService.getEventById(
      eventId,
      longitude,
      latitude,
    );
  }

  @Patch(':eventId')
  @ApiOperation({ summary: 'Обновить событие' })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Данные для редактирования события по eventId',
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
  })
  @ApiBody({
    description: 'Данные для обновления события',
    type: UpdateEventRequestDto,
    examples: {
      example: {
        summary: 'Пример данных для обновления события',
        value: {
          id: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
          title: 'Обновленный концерт классической музыки',
          description: 'Теперь с участием знаменитого дирижера',
          startDate: '2025-12-15T00:00:00Z',
          finishDate: '2025-12-15T00:01:00Z',
          currencyId: 11,
          entryDeposit: 350,
          guestLimit: 120,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Событие успешно обновлено',
    type: ResponseEventDto,
  })
  @ApiResponse({ status: 404, description: 'Событие не найдено' })
  @ApiResponse({
    status: 401,
    description: 'Нет прав для редактирования этого события',
  })
  async updateEventById(
    @Param('eventId') eventId: string,
    @User() user: UserPayload,
    @Body() updateEventDto: UpdateEventRequestDto,
  ): Promise<ResponseEventDto> {
    return await this.eventCrudService.updateEventById(
      eventId,
      updateEventDto,
      user.id,
    );
  }

  @Delete(':eventId')
  @ApiOperation({ summary: 'Удалить событие по ID' })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Данные для удаления события по eventId',
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
  })
  @ApiResponse({ status: 200, description: 'Событие успешно удалено' })
  @ApiResponse({ status: 404, description: 'Событие не найдено' })
  async deleteEventById(
    @User() user: UserPayload,
    @Param('eventId') eventId: string,
  ): Promise<void> {
    return await this.eventCrudService.arhiveEventById(eventId, user.id);
  }

  // deprecated
  // @Get()
  // @ApiOperation({ summary: 'Получить все события' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'События успешно получены',
  //   type: [ResponseEventDto],
  // })
  // async getAllEvents(): Promise<ResponseEventDto[]> {
  //   return await this.eventCrudService.getAllEvents();
  // }
}
