import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsService } from './ws.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/modules/auth/guards/ws-jwt-auth/ws-jwt.guard';
import { AppLoggerService } from 'src/modules/logger/logger.service';

@WebSocketGateway({
  namespace: '/ws',
  path: '/ws/',
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard) // Защита JWT для всех соединений
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private wsService: WsService,
    private loggerService: AppLoggerService,
  ) {}

  // Обработчик нового подключения
  handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth?.userId;

      if (!userId) {
        client.disconnect();

        return;
      }

      this.loggerService.log(
        `Клиент подключен: ${client.id} с userId: ${userId}`,
        { userId },
      );
      this.wsService.registerClient(client);
    } catch {
      const userId = client.handshake.auth?.userId;

      this.loggerService.log(
        `Клиент отключен из-за ошибки: ${client.id} с userId: ${userId}`,
        { userId },
      );
      client.disconnect();
    }
  }

  // Обработчик отключения клиента
  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth?.userId;

    this.loggerService.log(
      `Клиент отключен: ${client.id} с userId: ${userId}`,
      { userId },
    );
    this.wsService.removeClient(client);
  }
}
