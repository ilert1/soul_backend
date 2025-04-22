import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateExperienceDto } from './dto/experience.dto';
import { AppLoggerService } from '../logger/logger.service';
import { Prisma } from '@prisma/client';
import { experiencePoints } from './dto/constants';

@Injectable()
export class ExperienceService {
  constructor(
    private prisma: PrismaService,
    private readonly loggerService: AppLoggerService,
  ) {}

  async addExperience(createExperienceDto: CreateExperienceDto) {
    const { userId, type } = createExperienceDto;
    const value = experiencePoints[type];
    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Создаем запись в таблице опыта
          await tx.experience.create({
            data: {
              userId,
              value,
              type,
            },
          });

          // Увеличиваем значение user.experience
          await tx.user.update({
            where: { id: userId },
            data: {
              experience: { increment: value },
            },
          });
        },
      );
    } catch (error: unknown) {
      this.loggerService.error(
        'Error during transaction increasing User Experience',
        error,
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Ошибка во время проведения транзакции',
      );
    }
  }

  async deleteExperience(id: string) {
    const experience = await this.prisma.experience.findUniqueOrThrow({
      where: { id },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: experience.userId },
    });

    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const newExperienceValue = user.experience - experience.value;

          await tx.user.update({
            where: { id: experience.userId },
            data: {
              experience: newExperienceValue < 0 ? 0 : newExperienceValue,
            },
          });

          await tx.experience.delete({
            where: { id },
          });
        },
      );
    } catch (error: unknown) {
      this.loggerService.error(
        'Error during transaction deleting User Experience',
        error,
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Ошибка во время проведения транзакции',
      );
    }
  }
}
