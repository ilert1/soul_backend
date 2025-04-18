import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RatingService } from './rating.service';
import { LoggerModule } from '../logger/logger.module';
import { ExperienceService } from '../experience/experience.service';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, RatingService, PrismaService, ExperienceService],
  imports: [LoggerModule],
})
export class ActivityModule {}
