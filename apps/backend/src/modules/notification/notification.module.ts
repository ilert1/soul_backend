import { Module } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { WsModule } from '../../common/ws/ws.module';
import { PrismaService } from '../prisma/prisma.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt-auth/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { AppLoggerService } from '../logger/logger.service';

@Module({
  imports: [WsModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    PrismaService,
    AppLoggerService,
    WsJwtGuard,
    JwtService,
  ],

  exports: [NotificationsService],
})
export class NotificationsModule {}
