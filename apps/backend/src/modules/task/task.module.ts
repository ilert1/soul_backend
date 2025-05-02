import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';
import { TaskCheckinController } from './controllers/task-checkin.controller';
import { TaskCrudController } from './controllers/task-crud.controller';
import { TaskManagementController } from './controllers/task-management.controller';
import { TaskProgressController } from './controllers/task-progress.controller';
import { TaskCheckinService } from './services/task-checkin.service';
import { TaskCrudService } from './services/task-crud.service';
import { TaskManagementService } from './services/task-management.service';
import { TaskProgressService } from './services/task-progress.service';
import { TransactionCreateService } from '../transaction/transaction-create.service';
import { AppLoggerService } from '../logger/logger.service';
import { TaskWeeklyService } from './services/task-weekly.service';
import { TaskWeeklyController } from './controllers/task-weekly.controller';
import { WeeklyTaskResetService } from './services/task-weekly-reset-schedule.service';
import { ExperienceService } from '../experience/experience.service';
import { TelegramClientModule } from '../telegramClient/telegramClient.module';

@Module({
  imports: [PrismaModule, WalletModule, TelegramClientModule],
  controllers: [
    TaskCrudController,
    TaskProgressController,
    TaskCheckinController,
    TaskManagementController,
    TaskWeeklyController,
  ],
  providers: [
    TaskCrudService,
    TaskProgressService,
    TaskCheckinService,
    TaskManagementService,
    TaskWeeklyService,
    TransactionCreateService,
    AppLoggerService,
    WeeklyTaskResetService,
    ExperienceService,
  ],
  exports: [TaskManagementService],
})
export class TaskModule {}
