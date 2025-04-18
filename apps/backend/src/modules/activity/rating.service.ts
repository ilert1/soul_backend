import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AppLoggerService } from '../logger/logger.service';
import { Rating } from '@prisma/client';
import { CombinedTypeCancelRating } from './dto/rating-data.dto';
import { EventsRatingtResponseDto } from './dto/response-rating.dto';
import { ExperienceService } from '../experience/experience.service';

@Injectable()
export class RatingService {
  constructor(
    private prisma: PrismaService,
    private readonly loggerService: AppLoggerService,
    private readonly experienceServise: ExperienceService,
  ) {}

  async rateEvent(
    activityId: string,
    userId: string,
    ratingValue: 1 | 2 | 3 | 4 | 5,
  ): Promise<EventsRatingtResponseDto> {
    const activity = await this.prisma.activity.findFirstOrThrow({
      where: {
        id: activityId,
        userId: userId,
        event: { isArchived: false },
      },
      select: {
        id: true,
        eventId: true,
        rating: true,
        isConfirmed: true,
        event: {
          select: {
            id: true,
            startDate: true,
            finishDate: true,
            averageRating: true,
            isArchived: true,
            ratingDetails: {
              select: {
                id: true,
                votesForOne: true,
                votesForTwo: true,
                votesForThree: true,
                votesForFour: true,
                votesForFive: true,
              },
            },
          },
        },
      },
    });

    if (!activity.isConfirmed) {
      throw new BadRequestException('Необходимо подтвердить активность(билет)');
    }

    if (activity.rating) {
      throw new BadRequestException('Событие уже оценено');
    }

    if (!activity.event) {
      throw new NotFoundException('Событие не найдено');
    }

    const ratingDetails = activity.event.ratingDetails;

    if (!ratingDetails) {
      throw new NotFoundException('Рейтинг события не найден');
    }

    const currentDate = new Date();
    const eventEndDate = activity.event.finishDate;

    if (currentDate < eventEndDate) {
      throw new BadRequestException(
        'Нельзя оценивать событие до его окончания',
      );
    }

    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const fieldMap: Record<
            number,
            keyof Omit<typeof ratingDetails, 'id'>
          > = {
            1: 'votesForOne',
            2: 'votesForTwo',
            3: 'votesForThree',
            4: 'votesForFour',
            5: 'votesForFive',
          };
          const field = fieldMap[ratingValue];

          const updatedRating: Rating = await tx.rating.update({
            where: { eventId: activity.event.id },
            data: {
              [field]: { increment: 1 },
            },
          });
          await tx.activity.update({
            where: { id: activityId },
            data: {
              rating: ratingValue,
            },
          });

          const {
            votesForOne,
            votesForTwo,
            votesForThree,
            votesForFour,
            votesForFive,
          } = updatedRating;
          const totalPoints =
            votesForOne +
            votesForTwo * 2 +
            votesForThree * 3 +
            votesForFour * 4 +
            votesForFive * 5;
          const totalVotes =
            votesForOne +
            votesForTwo +
            votesForThree +
            votesForFour +
            votesForFive;
          const averageRating =
            Math.round((totalPoints / totalVotes) * 10) / 10;
          const updatedEvent = await tx.event.update({
            where: { id: activity.eventId },
            select: {
              averageRating: true,
              creatorId: true,
              ratingDetails: {
                select: {
                  id: true,
                  votesForOne: true,
                  votesForTwo: true,
                  votesForThree: true,
                  votesForFour: true,
                  votesForFive: true,
                },
              },
              currency: { select: { code: true } },
            },
            data: { averageRating: averageRating },
          });

          await this.experienceServise.addExperience({
            userId: updatedEvent.creatorId,
            type: `OWN_MEETING_PER_RATING_${ratingValue}`,
          });

          await this.experienceServise.addExperience({
            userId: userId,
            type: 'MEETING_RATE',
          });

          return updatedEvent;
        },
      );
    } catch (error: unknown) {
      this.loggerService.error(
        'Error during transaction creating Rating for Event',
        error,
      );
      throw new InternalServerErrorException(
        'Ошибка во время проведения транзакции',
      );
    }
  }

  async cancelRating(activityId: string): Promise<void> {
    const activity: CombinedTypeCancelRating | null =
      await this.prisma.activity.findFirstOrThrow({
        where: {
          id: activityId,
          event: { isArchived: false },
        },
        select: {
          id: true,
          rating: true,
          userId: true,
          event: {
            select: {
              id: true,
              averageRating: true,
              ratingDetails: {
                select: {
                  id: true,
                  votesForOne: true,
                  votesForTwo: true,
                  votesForThree: true,
                  votesForFour: true,
                  votesForFive: true,
                },
              },
            },
          },
        },
      });

    if (!activity.event) {
      throw new NotFoundException('Запись события не найдена');
    }

    const rating = activity.rating;

    if (!rating) {
      throw new BadRequestException('Оценка еще не выставлена');
    }

    const ratingDetails = activity.event.ratingDetails;

    if (!ratingDetails) {
      throw new NotFoundException('Рейтинг события не найден');
    }

    const creatorExperience = await this.prisma.experience.findFirst({
      where: {
        userId: activity.event.creatorId,
        type: `OWN_MEETING_PER_RATING_${rating as 1 | 2 | 3 | 4 | 5}`,
      },
    });

    if (!creatorExperience) {
      throw new NotFoundException(
        'Запись начисления опыта за событие для создателя события не найдена',
      );
    }

    const userExperience = await this.prisma.experience.findFirst({
      where: {
        userId: activity.userId,
        type: 'MEETING_RATE',
      },
    });

    if (!userExperience) {
      throw new NotFoundException(
        'Запись начисления опыта за событие для гостя не найдена',
      );
    }

    try {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const fieldMap: Record<number, keyof Omit<typeof ratingDetails, 'id'>> =
          {
            1: 'votesForOne',
            2: 'votesForTwo',
            3: 'votesForThree',
            4: 'votesForFour',
            5: 'votesForFive',
          };
        const field = fieldMap[rating];
        const updateData = {
          [field]: Math.max(ratingDetails[field] - 1, 0),
        };
        const updatedRating = await tx.rating.update({
          where: { id: ratingDetails.id },
          data: updateData,
        });
        await tx.activity.update({
          where: { id: activity.id },
          data: {
            rating: null,
          },
        });
        const {
          votesForOne,
          votesForTwo,
          votesForThree,
          votesForFour,
          votesForFive,
        } = updatedRating;
        const totalPoints =
          votesForOne +
          votesForTwo * 2 +
          votesForThree * 3 +
          votesForFour * 4 +
          votesForFive * 5;
        const totalVotes =
          votesForOne +
          votesForTwo +
          votesForThree +
          votesForFour +
          votesForFive;
        const averageRating = Math.round((totalPoints / totalVotes) * 10) / 10;
        await tx.event.update({
          where: { id: activity.event.id },
          data: {
            averageRating,
          },
        });

        await this.experienceServise.deleteExperience(userExperience.id);
        await this.experienceServise.deleteExperience(creatorExperience.id);
      });
    } catch (error: unknown) {
      this.loggerService.error('Error during cancelled event rating', error);
      throw new InternalServerErrorException(
        'Ошибка во время проведения транзакции',
      );
    }
  }
}
