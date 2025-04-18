import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PlaceService, PrismaService],
})
export class PlaceModule {}
