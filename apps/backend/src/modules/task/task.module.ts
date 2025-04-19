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

@Module({
  imports: [PrismaModule, WalletModule],
  controllers: [
    TaskCrudController,
    TaskProgressController,
    TaskCheckinController,
    TaskManagementController,
  ],
  providers: [
    TaskCrudService,
    TaskProgressService,
    TaskCheckinService,
    TaskManagementService,
  ],
})
export class TaskModule {}
