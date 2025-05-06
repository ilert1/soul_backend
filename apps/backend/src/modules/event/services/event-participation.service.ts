import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { getDistance } from 'src/common/utils/geoposition';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ConfirmParticipationDto } from '../dto/confirm-participation.dto';
import { CONFIRM_TICKET_RADIUS } from '../event.constants';
import { decrypt } from 'src/common/utils/hash.utils';
import { ResponseEventDto } from '../dto/response-event.dto';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { ExperienceService } from 'src/modules/experience/experience.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventParticipationService {
  constructor(
    private prisma: PrismaService,
    private readonly experienceServise: ExperienceService,
    private readonly loggerService: AppLoggerService,
  ) {}

  async confirmParticipationByActivityHash(
    confirmParticipationDto: ConfirmParticipationDto,
    creatorId: string,
  ) {
    const activityId = decrypt(confirmParticipationDto.activityHash);
    console.log(activityId);

    const activity = await this.prisma.activity.findUniqueOrThrow({
      where: { id: activityId },
      include: { event: { include: { place: true } } },
    });

    if (!activity.event) {
      throw new NotFoundException('Событие не найдено');
    }

    if (activity.event.id !== confirmParticipationDto.eventId) {
      throw new BadRequestException(
        'Билет от другого события и не может быть подтвержден',
      );
    }

    if (activity.isConfirmed) {
      throw new BadRequestException('Билет уже подтвержден');
    }

    if (activity.event.creatorId !== creatorId) {
      throw new BadRequestException(
        'Пользователь не имеет права подтверждать участие в этом событии',
      );
    }

    const now = new Date();

    if (now > new Date(activity.event.finishDate)) {
      throw new BadRequestException(
        'Событие уже закончилось, билет нельзя подтвердить',
      );
    }

    const threeHoursBeforeStart = new Date(activity.event.startDate);
    threeHoursBeforeStart.setHours(threeHoursBeforeStart.getHours() - 3);

    if (now < threeHoursBeforeStart) {
      throw new BadRequestException(
        'До начала события более 3 часов, билет нельзя подтвердить',
      );
    }

    if (!activity.event.place) {
      throw new NotFoundException('Место не найдено');
    }

    if (!activity.event.place.latitude || !activity.event.place.longitude) {
      throw new NotFoundException('Гепозиция места не найдена');
    }

    // Проверяем, что гепозиция пользователя совпадает с гепозицией места, с точностью до 100 метров
    if (
      CONFIRM_TICKET_RADIUS <
      getDistance(confirmParticipationDto.geoposition, {
        latitude: activity.event.place.latitude,
        longitude: activity.event.place.longitude,
      })
    ) {
      throw new BadRequestException(
        'Гепозиция не совпадает с гепозицией места события',
      );
    }

    try {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.activity.update({
          where: { id: activityId },
          data: { isConfirmed: true, isConfirmedAt: new Date() },
        });

        await this.experienceServise.addExperience({
          userId: activity.userId,
          type: 'MEETING_VISIT',
        });

        await this.experienceServise.addExperience({
          userId: activity.event.creatorId,
          type: 'OWN_MEETING_PER_GUEST',
        });
      });
    } catch (error: unknown) {
      this.loggerService.error(
        'Error during transaction confirming participation',
        error,
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Ошибка во время проведения транзакции',
      );
    }
  }

  async findEventByActivityId(activityId: string): Promise<ResponseEventDto> {
    const activity = await this.prisma.activity.findUniqueOrThrow({
      where: { id: activityId, event: { isArchived: false } },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            imageId: true,
            startDate: true,
            finishDate: true,
            entryCondition: true,
            currencyId: true,
            entryFee: true,
            deposit: true,
            guestLimit: true,
            creatorId: true,
            ratingDetails: true,
            averageRating: true,
            isArchived: true,
            currency: { select: { code: true } },
            bonusDistributionType: true,
          },
        },
      },
    });

    if (!activity.event) {
      throw new NotFoundException('Событие не найдено.');
    }

    return activity.event;
  }
}
