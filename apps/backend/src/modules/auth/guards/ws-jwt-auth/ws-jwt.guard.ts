import { JwtService } from '@nestjs/jwt';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AppLoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private loggerService: AppLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth?.token;

    if (!token || typeof token !== 'string') {
      this.loggerService.warn('Попытка подключения без токена');
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256'],
      });

      // Сохраняем пользователя в сокете
      client.data.user = {
        id: payload.sub,
        roles: payload.roles || [],
      };

      return true;
    } catch (e) {
      this.loggerService.error('Ошибка валидации токена', e);
      throw new WsException(`Unauthorized: ${e.message}`);
    }
  }
}
