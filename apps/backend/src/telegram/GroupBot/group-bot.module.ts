import { Module } from '@nestjs/common';
// import { TelegramService } from './telegram.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TelegramUserModule } from 'src/modules/telegramUser/telegramUser.module';
import { TelegramUserService } from 'src/modules/telegramUser/telegramUser.service';
import { TgUserLanguageService } from '../common/tg-user-language.service';
import { LoggerModule } from 'src/modules/logger/logger.module';
import { ExperienceService } from 'src/modules/experience/experience.service';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { TransactionCreateService } from 'src/modules/transaction/transaction-create.service';
import { GratitudeDetectorService } from './gratitude/gratitude-detector.service';
import { GroupBotService } from './group-bot.service';
import { WalletModule } from 'src/modules/wallet/wallet.module';
import { GroupBotScheduleService } from './group-bot-schedule.service';
// import { TgUserLanguageService } from './tg-user-language.service';
// import { TranslationService } from './translation.service';

@Module({
  imports: [PrismaModule, TelegramUserModule, LoggerModule, WalletModule],
  providers: [
    PrismaService,
    TelegramUserService,
    TgUserLanguageService,
    GroupBotService,
    // TranslationService,
    ExperienceService,
    AppLoggerService,
    GroupBotScheduleService,
    GratitudeDetectorService,
    TransactionCreateService,
  ],
  exports: [GroupBotService],
})
export class GroupBotModule {}
