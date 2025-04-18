import { Controller, Get, Param } from '@nestjs/common';
import { UserPayload } from '../../../common/types/user-payload.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/common/decorators/current-user.decorator';
import { ResponseHashDto } from 'src/common/dto/response-hash.dto';
import { EventQrService } from '../services/event-qr.service';

@ApiBearerAuth()
@ApiTags('Event')
@Controller('event')
export class EventQrController {
  constructor(private readonly eventQrService: EventQrService) {}

  @Get('/qr/:eventId')
  @ApiOperation({
    summary: 'Получение хэша мероприятия для формирования QR ссылки',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Уникальный идентификатор мероприятия',
  })
  @ApiResponse({
    status: 200,
    description: 'Хэш приглашения на мероприятие получен',
    type: ResponseHashDto,
  })
  async getQR(
    @User() user: UserPayload,
    @Param('eventId') eventId: string,
  ): Promise<ResponseHashDto> {
    return await this.eventQrService.getHash(eventId, user.id);
  }
}
