import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsService {
  private readonly clients: Map<string, Socket> = new Map();

  //Регистрирует нового клиента
  registerClient(client: Socket): void {
    const userId = this.getValidatedUserId(client);

    if (userId) {
      this.clients.set(userId, client);
    }
  }

  // Удаляет клиента
  removeClient(client: Socket): void {
    const userId = this.getValidatedUserId(client);

    if (userId) {
      this.clients.delete(userId);
    }
  }

  // Получает клиента по ID пользователя
  getClient(userId: string): Socket | undefined {
    return this.clients.get(userId);
  }

  // Отправляет сообщение конкретному пользователю
  emitToUser(userId: string, event: string, data: unknown): boolean {
    const client = this.getClient(userId);

    if (client) {
      client.emit(event, data);

      return true;
    }

    return false;
  }

  // Валидация userId из сокета
  private getValidatedUserId(client: Socket): string | null {
    const userId = client.handshake.auth?.userId;

    return typeof userId === 'string' && userId.trim().length > 0
      ? userId
      : null;
  }
}
