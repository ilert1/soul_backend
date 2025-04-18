import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  providers: [WalletService],
  controllers: [WalletController],
  imports: [PrismaModule, LoggerModule],
  exports: [WalletService],
})
export class WalletModule {}
