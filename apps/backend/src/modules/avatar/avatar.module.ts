import { Module } from '@nestjs/common';

import { AvatarService } from './avatar.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [PrismaService, AvatarService],
})
export class AvatarModule {}
