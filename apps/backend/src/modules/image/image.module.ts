import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  controllers: [ImageController],
  providers: [ImageService],
  imports: [PrismaModule],
})
export class ImageModule {}
