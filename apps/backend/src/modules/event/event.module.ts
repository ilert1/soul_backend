import { Module } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WalletModule } from '../wallet/wallet.module';
import { LoggerModule } from '../logger/logger.module';
import { PlaceService } from '../place/place.service';
import { PlaceModule } from '../place/place.module';
import { TransactionModule } from '../transaction/transaction.module';
import { TransactionCreateService } from '../transaction/transaction-create.service';
import { EventRewardDistributionService } from './services/event-reward-schedule.service';
import { NotificationsService } from '../notification/notification.service';
import { WsService } from 'src/common/ws/ws.service';
import { EventCrudController } from './controllers/event-crud.controller';
import { EventParticipationController } from './controllers/event-participation.controller';
import { EventSearchController } from './controllers/event-search.controller';
import { EventUserController } from './controllers/event-user.controller';
import { EventQrController } from './controllers/event-qr.controller';
import { EventCrudService } from './services/event-crud.service';
import { EventQrService } from './services/event-qr.service';
import { EventParticipationService } from './services/event-participation.service';
import { EventSearchService } from './services/event-search.service';
import { EventUserService } from './services/event-user.service';
import { ExperienceService } from '../experience/experience.service';
import { TaskModule } from '../task/task.module';

@Module({
  controllers: [
    EventCrudController,
    EventSearchController,
    EventUserController,
    EventParticipationController,
    EventQrController,
  ],
  providers: [
    EventCrudService,
    EventSearchService,
    EventUserService,
    EventParticipationService,
    EventQrService,
    PrismaService,
    PlaceService,
    TransactionCreateService,
    EventRewardDistributionService,
    NotificationsService,
    WsService,
    ExperienceService,
  ],
  imports: [
    WalletModule,
    LoggerModule,
    PlaceModule,
    TransactionModule,
    TaskModule,
  ],
})
export class EventModule {}
