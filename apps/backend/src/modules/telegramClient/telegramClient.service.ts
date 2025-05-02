import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { AppLoggerService } from '../logger/logger.service';

@Injectable()
export class TelegramClientService implements OnModuleInit, OnModuleDestroy {
  private client: TelegramClient;
  private isConnected = false;
  private stringSession: StringSession;

  constructor(private readonly loggerService: AppLoggerService) {}

  async onModuleInit() {
    if (process.env.TG_CLIENT_ACITVE !== 'false') {
      await this.initializeClient();
    }
  }

  async onModuleDestroy() {
    if (process.env.TG_CLIENT_ACITVE !== 'false') {
      await this.disconnect();
    }
  }

  private async initializeClient() {
    const apiId = parseInt(process.env.TELEGRAM_API_ID as string);
    const apiHash = process.env.TELEGRAM_API_HASH;
    const sessionString = process.env.TELEGRAM_SESSION_STRING;

    if (!apiId || !apiHash || !sessionString) {
      this.loggerService.error(
        'Недостаточно данных для инициализации Telegram клиента',
      );

      return;
    }

    try {
      this.stringSession = new StringSession(sessionString);

      this.client = new TelegramClient(this.stringSession, apiId, apiHash, {
        connectionRetries: 5,
      });

      await this.connectExistingSession();
    } catch (error) {
      this.isConnected = false;
      this.loggerService.error(
        'Telegram клиент не инициализирован',
        error.message,
      );
    }
  }

  private async connectExistingSession() {
    await this.client.connect();
    this.isConnected = true;
  }

  async disconnect() {
    if (this.isConnected && this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async getTgUserAbout(telegramId: string): Promise<string> {
    try {
      const result = await this.client.invoke(
        new Api.users.GetFullUser({
          id: telegramId,
        }),
      );

      return result.fullUser.about || '';
    } catch (error) {
      this.loggerService.error(
        'Произошла ошибка при получении описания пользователя',
        error.message,
      );

      return '';
    }
  }
}
