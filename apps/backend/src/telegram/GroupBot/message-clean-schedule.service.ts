import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class MessageCleanScheduleService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  @Cron('0 0 * * *') // Каждый день в 00:00
  async cleanMonthlyMessages(): Promise<void> {
    this.logger.log('MessageCleanScheduleService started');

    try {
      await this.prisma.messages.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });
      this.logger.log('All messages have been successfully deleted');
    } catch (error) {
      this.logger.error('Failed to delete messages', error);
      throw error;
    }

    this.logger.log('MessageCleanScheduleService finished');
  }
}
