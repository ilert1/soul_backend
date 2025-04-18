import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionCreateService } from './transaction-create.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';
import { TransactionReadService } from './transaction-read.service';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionCreateAdminService } from './transaction-create-admin.service';

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionCreateService,
    TransactionReadService,
    TransactionCreateAdminService,
  ],
  imports: [PrismaModule, LoggerModule, WalletModule],
})
export class TransactionModule {}
