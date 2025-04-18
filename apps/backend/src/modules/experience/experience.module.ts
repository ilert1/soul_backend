import { Module } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { LoggerModule } from '../logger/logger.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  providers: [ExperienceService, PrismaService],
  imports: [LoggerModule, TransactionModule],
})
export class ExperienceModule {}
