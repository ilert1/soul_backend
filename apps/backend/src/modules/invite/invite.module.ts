import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { PrismaService } from '../prisma/prisma.service';
import { SendReferralsPointsSchedulerService } from './referals-points-schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from '../logger/logger.module';
import { TransactionCreateService } from '../transaction/transaction-create.service';
import { WalletService } from '../wallet/wallet.service';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [ScheduleModule.forRoot(), LoggerModule, TransactionModule],
  controllers: [InviteController],
  providers: [
    InviteService,
    PrismaService,
    SendReferralsPointsSchedulerService,
    TransactionCreateService,
    WalletService,
  ],
})
export class InviteModule {}
