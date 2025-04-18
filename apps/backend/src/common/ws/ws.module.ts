import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { WsService } from './ws.service';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { WsJwtGuard } from 'src/modules/auth/guards/ws-jwt-auth/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [WsGateway, WsService, AppLoggerService, WsJwtGuard, JwtService],
  exports: [WsService],
})
export class WsModule {}
