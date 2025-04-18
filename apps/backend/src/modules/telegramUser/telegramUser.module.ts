import { Module } from '@nestjs/common';
import { TelegramUserService } from './telegramUser.service';
import { TelegramUserController } from './telegramUser.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TelegramUserController],
  providers: [TelegramUserService],
  exports: [TelegramUserService],
})
export class TelegramUserModule {}
