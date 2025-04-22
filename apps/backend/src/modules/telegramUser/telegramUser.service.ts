import { Injectable } from '@nestjs/common';
import { CreateTelegramUserDto } from './dto/create-telegramUser.dto';
import { UpdateTelegramUserDto } from './dto/update-telegramUser.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramUserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTelegramUserDto) {
    return await this.prisma.telegramUser.create({ data });
  }

  async findOne(telegramId: string) {
    return await this.prisma.telegramUser.findUnique({
      where: { telegramId },
    });
  }

  async update(telegramId: string, data: UpdateTelegramUserDto) {
    return await this.prisma.telegramUser.update({
      where: { telegramId },
      data,
    });
  }
}
