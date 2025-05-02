import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TelegramClientService } from './telegramClient.service';
import { AppLoggerService } from '../logger/logger.service';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, TelegramClientService, AppLoggerService],
  exports: [TelegramClientService],
})
export class TelegramClientModule {}
