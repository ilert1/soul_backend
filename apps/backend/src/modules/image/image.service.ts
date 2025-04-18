import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './image.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async create(imageData: CreateImageDto) {
    return this.prisma.image.create({
      data: imageData,
    });
  }

  async findOne(id: string) {
    return this.prisma.image.findUniqueOrThrow({ where: { id } });
  }

  async delete(id: string) {
    // Проверяем, существует ли изображение
    await this.findOne(id);

    // Удаляем изображение из базы данных
    return this.prisma.image.delete({
      where: { id },
    });
  }
}
