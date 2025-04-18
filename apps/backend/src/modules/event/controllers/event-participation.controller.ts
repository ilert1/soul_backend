import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserPayload } from '../../../common/types/user-payload.dto';
import { ConfirmParticipationDto } from '../dto/confirm-participation.dto';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/common/decorators/current-user.decorator';
import { ResponseEventDto } from '../dto/response-event.dto';
import { EventParticipationService } from '../services/event-participation.service';

@ApiBearerAuth()
@ApiTags('Event')
@Controller('event')
export class EventParticipationController {
  constructor(
    private readonly eventParticipationService: EventParticipationService,
  ) {}

  @Post('/confirm-participation')
  @ApiOperation({ summary: 'Подтверждение участия' })
  @ApiBody({
    description: 'Данные для подтверждения участия в событие',
    type: ConfirmParticipationDto,
    examples: {
      example: {
        summary: 'Пример данных для подтверждения участия в событие',
        value: {
          eventId: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
          activityHash: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
          geoposition: { latitude: 55.7558, longitude: 37.6173 },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь-участник подтвержден',
  })
  @ApiResponse({
    status: 400,
    description: 'Подтвреждение не прошло.',
  })
  @ApiResponse({
    status: 404,
    description: 'ID события и hash активности не существуют',
  })
  @ApiResponse({
    status: 422,
    description:
      'Ошибка в параметрах, необходимо передавать ID события и hash активности',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmParticipationByActivityHash(
    @User() user: UserPayload,
    @Body() confirmParticipationDto: ConfirmParticipationDto,
  ): Promise<void> {
    await this.eventParticipationService.confirmParticipationByActivityHash(
      confirmParticipationDto,
      user.id,
    );
  }

  @Get('/by-activity/:activityId')
  @ApiOperation({ summary: 'ADMIN-API Получение события по id активности' })
  @ApiParam({
    name: 'activityId',
    required: true,
    description: 'Данные для получения события по id активности',
  })
  @ApiResponse({
    status: 200,
    description: 'Событие, связанное с активностью, найдено.',
    type: ResponseEventDto,
  })
  @ApiResponse({ status: 404, description: 'Событие не найдено.' })
  async getEventByActivityId(
    @Param('activityId') activityId: string,
  ): Promise<ResponseEventDto> {
    return await this.eventParticipationService.findEventByActivityId(
      activityId,
    );
  }
}
