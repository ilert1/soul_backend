import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { extendedPrismaClient } from './prisma.extension';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    // Применяем расширение
    const extendedClient = extendedPrismaClient(this);

    for (const [key, value] of Object.entries(extendedClient)) {
      (this as any)[key] = value;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  cleanDb() {
    // Опционально: метод для очистки базы данных (например, для тестов)
    return this.$transaction([
      // Добавьте другие таблицы, если они есть
    ]);
  }
}
