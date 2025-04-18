import { Controller, Post, Body } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notification.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notification | Test')
@ApiBearerAuth()
@Controller('notification/test')
export class TestNotificationController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Создать тестовое уведомление (только для разработки)',
  })
  @ApiResponse({
    status: 201,
    description: 'Тестовое уведомление создано',
  })
  async createTestNotification(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.createTestNotification(createDto);
  }
}
