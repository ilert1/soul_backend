import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppLoggerService } from '../../logger/logger.service';
import { TaskWeeklyService } from './task-weekly.service';

@Injectable()
export class WeeklyTaskResetService {
  constructor(
    private readonly taskWeeklyService: TaskWeeklyService,
    private readonly logger: AppLoggerService,
  ) {}

  @Cron('0 0 * * 1') // Каждый понедельник в 00:00
  async resetAllWeeklyTasks(): Promise<void> {
    this.logger.log('WeeklyTaskResetService started');

    try {
      await this.taskWeeklyService.resetAllWeeklyTask();
      this.logger.log('All weekly tasks have been successfully reset');
    } catch (error) {
      this.logger.error('Failed to reset weekly tasks', error);
      throw error;
    }

    this.logger.log('WeeklyTaskResetService finished');
  }
}
