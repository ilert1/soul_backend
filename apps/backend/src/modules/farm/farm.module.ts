import { Module } from '@nestjs/common';
import { FarmService } from './farm.service';
import { FarmController } from './farm.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionCreateService } from '../transaction/transaction-create.service';
import { TransactionModule } from '../transaction/transaction.module';
import { AppLoggerService } from '../logger/logger.service';
import { WalletService } from '../wallet/wallet.service';
import { WalletModule } from '../wallet/wallet.module';
import { ExperienceService } from '../experience/experience.service';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [PrismaModule, TransactionModule, WalletModule, TaskModule],
  controllers: [FarmController],
  providers: [
    FarmService,
    PrismaService,
    TransactionCreateService,
    AppLoggerService,
    WalletService,
    ExperienceService,
  ],
})
export class FarmModule {}
