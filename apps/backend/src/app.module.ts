import { Module } from '@nestjs/common';
import { ImageController } from './modules/image/image.controller';
import { ImageService } from './modules/image/image.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ImageModule } from './modules/image/image.module';
import { LoggerModule } from './modules/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { TelegramUserModule } from './modules/telegramUser/telegramUser.module';
import { UserService } from './modules/user/user.service';
import { TelegramUserService } from './modules/telegramUser/telegramUser.service';
import { UserController } from './modules/user/user.controller';
import { TelegramUserController } from './modules/telegramUser/telegramUser.controller';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './modules/auth/config/jwt.config';
import refreshJwtConfig from './modules/auth/config/refresh-jwt.config';
import { StaticModule } from './modules/static/static.module';
import { CountryController } from './modules/static/country.controller';
import { CountryService } from './modules/static/country.service';
import { AvatarService } from './modules/avatar/avatar.service';
import { AvatarModule } from './modules/avatar/avatar.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ActivityController } from './modules/activity/activity.controller';
import { ActivityService } from './modules/activity/activity.service';
import { EventModule } from './modules/event/event.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { InviteModule } from './modules/invite/invite.module';
import { InviteController } from './modules/invite/invite.controller';
import { InviteService } from './modules/invite/invite.service';
import { RatingService } from './modules/activity/rating.service';
import { TransactionCreateService } from './modules/transaction/transaction-create.service';
import { PlaceModule } from './modules/place/place.module';
import { PlaceService } from './modules/place/place.service';
import { FarmModule } from './modules/farm/farm.module';
import { WsModule } from './common/ws/ws.module';
import { NotificationsService } from './modules/notification/notification.service';
import { NotificationsController } from './modules/notification/notification.controller';
import { NotificationsModule } from './modules/notification/notification.module';
import { CurrencyService } from './modules/static/currency.service';
import { CurrencyController } from './modules/static/currency.controller';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { TestNotificationController } from './modules/notification/test-notification.controller';
import { ExperienceModule } from './modules/experience/experience.module';
import { ExperienceService } from './modules/experience/experience.service';
import { ExperienceController } from './modules/experience/experience.controller';
import { EventCrudController } from './modules/event/controllers/event-crud.controller';
import { EventParticipationController } from './modules/event/controllers/event-participation.controller';
import { EventQrController } from './modules/event/controllers/event-qr.controller';
import { EventSearchController } from './modules/event/controllers/event-search.controller';
import { EventUserController } from './modules/event/controllers/event-user.controller';
import { EventSearchService } from './modules/event/services/event-search.service';
import { EventUserService } from './modules/event/services/event-user.service';
import { EventParticipationService } from './modules/event/services/event-participation.service';
import { EventQrService } from './modules/event/services/event-qr.service';
import { EventCrudService } from './modules/event/services/event-crud.service';
import { TaskCheckinController } from './modules/task/controllers/task-checkin.controller';
import { TaskCrudController } from './modules/task/controllers/task-crud.controller';
import { TaskManagementController } from './modules/task/controllers/task-management.controller';
import { TaskProgressController } from './modules/task/controllers/task-progress.controller';
import { TaskCheckinService } from './modules/task/services/task-checkin.service';
import { TaskCrudService } from './modules/task/services/task-crud.service';
import { TaskManagementService } from './modules/task/services/task-management.service';
import { TaskProgressService } from './modules/task/services/task-progress.service';
import { TaskWeeklyController } from './modules/task/controllers/task-weekly.controller';
import { TaskWeeklyService } from './modules/task/services/task-weekly.service';
import { TelegramModule } from './telegram/bot/telegram.module';
import { GroupBotModule } from './telegram/GroupBot/group-bot.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TelegramClientModule } from './modules/telegramClient/telegramClient.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, refreshJwtConfig],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'assets'),
      serveRoot: '/static',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    TelegramUserModule,
    ImageModule,
    LoggerModule,
    ActivityModule,
    EventModule,
    StaticModule,
    AvatarModule,
    WalletModule,
    TransactionModule,
    InviteModule,
    PlaceModule,
    FarmModule,
    WsModule,
    NotificationsModule,
    TelegramModule,
    TelegramClientModule,
    ExperienceModule,
    TelegramModule,
    GroupBotModule,
  ],
  controllers: [
    UserController,
    TelegramUserController,
    ImageController,
    AuthController,
    ActivityController,
    // EventControllers
    EventSearchController,
    EventUserController,
    EventParticipationController,
    EventQrController,
    EventCrudController, // crud controller всегда в конце
    // Task Controllers
    TaskCheckinController,
    TaskWeeklyController,
    TaskManagementController,
    TaskProgressController,
    TaskCrudController, // crud controller всегда в конце
    //
    CountryController,
    CurrencyController,
    InviteController,
    NotificationsController,
    TestNotificationController,
    ExperienceController,
  ],
  providers: [
    UserService,
    TelegramUserService,
    ImageService,
    AuthService,
    JwtService,
    ActivityService,
    // EventServices
    EventSearchService,
    EventUserService,
    EventParticipationService,
    EventQrService,
    EventCrudService,
    // Task Services
    TaskCheckinService,
    TaskWeeklyService,
    TaskManagementService,
    TaskProgressService,
    TaskCrudService,
    //
    RatingService,
    CountryService,
    CurrencyService,
    AvatarService,
    InviteService,
    TransactionCreateService,
    PlaceService,
    NotificationsService,
    ExperienceService,
  ],
})
export class AppModule {}
