import { Module } from '@nestjs/common';
// import { TelegramService } from './telegram.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TelegramUserModule } from 'src/modules/telegramUser/telegramUser.module';
import { TelegramUserService } from 'src/modules/telegramUser/telegramUser.service';
import { TgUserLanguageService } from '../common/tg-user-language.service';
import { GroupBotService } from './group-bot.service';
import { LoggerModule } from 'src/modules/logger/logger.module';
import { ExperienceService } from 'src/modules/experience/experience.service';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { MessageCleanScheduleService } from './message-clean-schedule.service';
// import { TgUserLanguageService } from './tg-user-language.service';
// import { TranslationService } from './translation.service';

@Module({
  imports: [PrismaModule, TelegramUserModule, LoggerModule],
  providers: [
    PrismaService,
    TelegramUserService,
    TgUserLanguageService,
    GroupBotService,
    // TranslationService,
    ExperienceService,
    AppLoggerService,
    MessageCleanScheduleService,
  ],
  exports: [GroupBotService],
})
export class GroupBotModule {}
