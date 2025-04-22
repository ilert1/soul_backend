import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserPayload } from 'src/common/types/user-payload.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/common/utils/constants';
import {
  NotificationEventCancelExample,
  NotificationEventUpdateExample,
  NotificationResponseExample,
  PaginatedNotificationResponseExample,
} from './dto/examples/notification.example';
import { NotificationResponseDto } from './dto/notification-response.dto';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notification')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Получить уведомления текущего пользователя' })
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
  @ApiResponse({
    status: 200,
    type: NotificationResponseDto,
    isArray: true,
    description: 'Список уведомлений с пагинацией',
    examples: {
      systemNotification: {
        summary: 'Системное уведомление о новом сообщении',
        value: {
          items: [NotificationResponseExample],
        },
      },
      eventUpdateNotification: {
        summary: 'Уведомление об изменении события',
        value: {
          items: [NotificationEventUpdateExample],
        },
      },
      eventCancelNotification: {
        summary: 'Уведомление об отмене события',
        value: {
          items: [NotificationEventCancelExample],
        },
      },
      fullPaginationExample: {
        summary: 'Пример с несколькими уведомлениями',
        value: PaginatedNotificationResponseExample,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  async getUserNotifications(
    @User() user: UserPayload,
    @Query('limit') limit: number = DEFAULT_PAGE_SIZE,
    @Query('page') page: number = 1,
  ) {
    const paginationDto: PaginationDto = { limit, page };

    return this.notificationsService.getUserNotifications({
      userId: user.id,
      paginationDto,
    });
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Изменить статус всех уведомлений на прочитанное' })
  @ApiResponse({
    status: 200,
    description: 'Успешное изменение статуса уведомлений',
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  async markAllAsRead(@User() user: UserPayload) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch('read/:id')
  @ApiOperation({ summary: 'Изменить статус уведомления на прочитанное' })
  @ApiResponse({
    status: 200,
    description: 'Успешное изменение статуса уведомления',
  })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('unread/:id')
  @ApiOperation({ summary: 'Изменить статус уведомления на непрочитанное' })
  @ApiResponse({
    status: 200,
    description: 'Успешное изменение статуса уведомления',
  })
  async markAsUnread(@Param('id') id: string) {
    return this.notificationsService.markAsUnread(id);
  }
}
