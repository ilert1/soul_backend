import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlaceService {
  constructor(private prisma: PrismaService) {}

  async getPlaceById(id: string) {
    const place = await this.prisma.place.findUniqueOrThrow({ where: { id } });

    return place;
  }

  async createPlace(data: CreatePlaceDto) {
    return await this.prisma.place.create({ data });
  }
}
