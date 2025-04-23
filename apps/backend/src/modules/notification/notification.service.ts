import { Injectable } from '@nestjs/common';
import { WsService } from '../../common/ws/ws.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/utils/pagination.utils';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wsService: WsService,
  ) {}

  async createNotification(
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        title: createNotificationDto.title,
        data: createNotificationDto.data || {},
        userId,
        isRead: createNotificationDto.isRead ?? false,
      },
    });

    // Отправляем уведомление через WebSocket
    this.wsService.emitToUser(userId, 'notification.new', {
      id: notification.id,
      title: notification.title,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async getUserNotifications({
    userId,
    paginationDto,
  }: {
    userId: string;
    paginationDto: PaginationDto;
  }) {
    return await paginate<NotificationResponseDto>({
      prisma: this.prisma,
      model: 'notification',
      paginationDto,
      options: {
        where: { userId },
        order: { createdAt: 'desc' },
      },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async markAsRead(notificationId: string) {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAsUnread(notificationId: string) {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: false },
    });
  }

  // Создает тестовое уведомление (только для разработки)
  async createTestNotification(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        title: createNotificationDto.title,
        data: createNotificationDto.data || {},
        userId: createNotificationDto.userId,
        isRead: false,
      },
    });

    // Отправляем уведомление через WebSocket
    this.wsService.emitToUser(
      createNotificationDto.userId,
      'notification.new',
      {
        id: notification.id,
        title: notification.title,
        data: notification.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
    );

    return notification;
  }
}
