import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskList, TransactionType } from '@prisma/client';
import { TransactionCreateService } from '../transaction/transaction-create.service';
import { Farming } from '@prisma/client';
import { ExperienceService } from '../experience/experience.service';
import { TaskManagementService } from '../task/services/task-management.service';

@Injectable()
export class FarmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionCreateService: TransactionCreateService,
    private readonly experienceServise: ExperienceService,
    private readonly taskManagementService: TaskManagementService,
  ) {}

  async startFarming(userId: string): Promise<Omit<Farming, 'id'>> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { farmingSession: true },
    });

    if (user?.farmingSession) {
      throw new BadRequestException('Фарминг уже запущен');
    }

    const now = new Date();
    // Раскоментируй следующую строку чтобы уменьшить вермя фарма до 1 сек. Оставляю Для теста!!
    // const finishDate = new Date(now.getTime() + 1 * 1000); // +1 секунда
    const finishDate = new Date(now.getTime() + user.farmingTime); // +время которое заложено в профиле пользователя

    const data = await this.prisma.farming.create({
      data: {
        userId,
        startDate: now,
        finishDate,
      },
    });

    return data;
  }

  async finishFarming(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { farmingSession: true },
    });

    if (!user.farmingSession) {
      throw new BadRequestException('Фарминг не запущен');
    }

    const now = new Date();

    if (now < user.farmingSession.finishDate) {
      throw new BadRequestException('Фарминг ещё не завершён');
    }

    const wallet = await this.prisma.wallet.findFirst({ where: { userId } });

    if (!wallet) {
      throw new InternalServerErrorException('У пользователя нет кошелька');
    }

    const earnedPoints = (user.farmingTime / 3600000) * user.farmingRate;

    await this.prisma.$transaction(async (tx) => {
      try {
        await this.transactionCreateService.createTransactionFromSystemWallet(
          tx,
          wallet.id,
          earnedPoints,
          TransactionType.FARM_REWARD,
        );
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }

        throw new InternalServerErrorException('Ошибка при начислении награды');
      }

      await this.experienceServise.addExperience({
        userId,
        type: 'FARMING_PER_TIMER',
      });

      // Выполняем проверку задания
      await this.taskManagementService.verifyTaskCompletion(
        userId,
        TaskList.COLLECTED_SP,
      );

      await tx.farming.delete({ where: { id: user.farmingSession!.id } });
    });
  }

  async getFarmingStatus(userId: string) {
    const farming = await this.prisma.farming.findUnique({ where: { userId } });

    if (!farming) {
      return { active: false };
    }

    const now = new Date();

    return {
      active: true,
      timeLeft: Math.max(0, farming.finishDate.getTime() - now.getTime()),
    };
  }
}
