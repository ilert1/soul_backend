import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ActivityService } from './activity.service';
import {
  CreateActivityRequestDto,
  ActivityResponseDto,
} from './dto/create-activity.dto';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { RequestRatingDto } from './dto/request-rating.dto';
import { ResponseHashDto } from 'src/common/dto/response-hash.dto';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { EventsRatingtResponseDto } from './dto/response-rating.dto';

@ApiBearerAuth()
@ApiTags('Activities')
@Controller('activities')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly ratingService: RatingService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Создание новой активности = записаться на событие как гость',
  })
  @ApiBody({
    description: 'Данные для создания новой активности',
    type: CreateActivityRequestDto,
    examples: {
      example: {
        summary: 'Пример данных для создания активности',
        value: {
          eventId: 'dca02f7a-c93e-428a-9903-45b00c798174',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    type: ActivityResponseDto,
    description: 'Активность успешно создана',
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  async createActivity(
    @User() user: UserPayload,
    @Body() createActivityDto: CreateActivityRequestDto,
  ): Promise<ActivityResponseDto> {
    return await this.activityService.createActivity(
      createActivityDto,
      user.id,
    );
  }

  @Get('/:activityId')
  @ApiOperation({ summary: 'Получение активности по activityId' })
  @ApiParam({
    name: 'activityId',
    required: true,
    description: 'Данные для получения активности по activityId',
  })
  @ApiResponse({
    status: 200,
    description: 'Активность успешно найдена.',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Активность не найдена.' })
  async findActivityById(
    @Param('activityId') activityId: string,
  ): Promise<ActivityResponseDto> {
    return await this.activityService.findActivityById(activityId);
  }

  @Delete(':activityId')
  @ApiOperation({
    summary: 'Удаление активности по activityId = отменить запись на событие',
  })
  @ApiBody({
    description: 'Данные для удаления активности по activityId',
  })
  @ApiParam({
    name: 'activityId',
    required: true,
    description: 'Уникальный идентификатор активности',
  })
  @ApiResponse({ status: 200, description: 'Активность успешно удалена.' })
  @ApiResponse({ status: 404, description: 'Активность не найдена.' })
  async deleteActivityById(@Param('activityId') activityId: string) {
    return await this.activityService.deleteActivityById(activityId);
  }

  @Post('rate/:activityId')
  @ApiOperation({ summary: 'Оценить событие' })
  @ApiParam({
    name: 'activityId',
    required: true,
    description: 'ID активности, по которой нужно отменить оценку',
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
  })
  @ApiBody({
    description: 'Оценка события',
    type: RequestRatingDto,
    examples: {
      example: {
        summary: 'Пример оценки',
        value: {
          rating: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Оценка успешно добавлена',
    type: EventsRatingtResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Событие не найдено' })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации оценки',
  })
  async rateEvent(
    @Param('activityId') activityId: string,
    @User() user: UserPayload,
    @Body() body: RequestRatingDto,
  ): Promise<EventsRatingtResponseDto> {
    return await this.ratingService.rateEvent(activityId, user.id, body.rating);
  }

  @Get('/qr/:activityId')
  @ApiOperation({
    summary: 'Получение хэша активности для формирования QR ссылки',
  })
  @ApiParam({
    name: 'activityId',
    required: true,
    description: 'Уникальный идентификатор активности',
  })
  @ApiResponse({
    status: 200,
    description: 'Хэш активности получен',
    type: ResponseHashDto,
  })
  async getQR(
    @Param('activityId') activityId: string,
  ): Promise<ResponseHashDto> {
    return await this.activityService.getHash(activityId);
  }

  @Delete('rate/:activityId')
  @ApiOperation({ summary: 'ADMIN-API Отменить оценку события' })
  @ApiParam({
    name: 'activityId',
    required: true,
    description: 'ID активности, по которой нужно отменить оценку',
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
  })
  @ApiResponse({ status: 200, description: 'Оценка успешно отменена' })
  @ApiResponse({
    status: 404,
    description: 'Событие не найдено или оценка не существует',
  })
  async cancelRating(@Param('activityId') activityId: string): Promise<void> {
    return await this.ratingService.cancelRating(activityId);
  }

  @Get('by-user/:userId')
  @ApiOperation({
    summary: 'ADMIN-API Получение всех активностей пользователя по userId',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Уникальный идентификатор пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Список активностей пользователя',
    type: [ActivityResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Активности не найдены.' })
  async findAllActivitieslByUserId(
    @Param('userId') userId: string,
  ): Promise<ActivityResponseDto[]> {
    return await this.activityService.findAllActivitieslByUserId(userId);
  }

  @Get('by-event/:eventId')
  @ApiOperation({
    summary: 'ADMIN-API Получение всех активностей события по eventId',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Данные для получения активностей по eventId ',
  })
  @ApiResponse({
    status: 200,
    description: 'Список активностей события',
    type: [ActivityResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Активности не найдены.' })
  async findAllByEventId(
    @Param('eventId') eventId: string,
  ): Promise<ActivityResponseDto[]> {
    return await this.activityService.findAllByEventId(eventId);
  }

  // @Get()
  // @ApiOperation({ summary: 'Получение всех активностей' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Список всех активностей',
  //   type: [ActivityResponseDto],
  // })
  // async findAllActivities(): Promise<ActivityResponseDto[]> {
  //   return await this.activityService.findAllActivities();
  // }
}
