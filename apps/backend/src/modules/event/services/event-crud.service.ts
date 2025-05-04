import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { Prisma, Wallet, TransactionType, TaskList } from '@prisma/client';
import { getDistance } from 'src/common/utils/geoposition';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { NotificationsService } from 'src/modules/notification/notification.service';
import { PlaceService } from 'src/modules/place/place.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TransactionCreateService } from 'src/modules/transaction/transaction-create.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import {
  CreateEventRequestDto,
  UpdateEventRequestDto,
} from '../dto/create-event.dto';
import { ResponseEventDto } from '../dto/response-event.dto';
import { EVENT_CREATE_COST } from '../event.constants';
import { TaskManagementService } from 'src/modules/task/services/task-management.service';

@Injectable()
export class EventCrudService {
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly loggerService: AppLoggerService,
    private readonly placeService: PlaceService,
    private readonly transactionCreateService: TransactionCreateService,
    private readonly notificationsService: NotificationsService,
    private readonly taskManagementService: TaskManagementService,
  ) {}

  async createEvent(
    createEventDto: CreateEventRequestDto,
    currentUserId: string,
  ): Promise<ResponseEventDto> {
    const currentDate = new Date();

    if (new Date(createEventDto.startDate) < currentDate) {
      throw new BadRequestException(
        'Дата начала события не может быть в прошлом',
      );
    }

    if (
      new Date(createEventDto.finishDate) < new Date(createEventDto.startDate)
    ) {
      throw new BadRequestException(
        'Дата окончания события не может быть раньше даты начала',
      );
    }

    const diffInMilliseconds =
      new Date(createEventDto.finishDate).getTime() -
      new Date(createEventDto.startDate).getTime();
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

    if (diffInHours > 24) {
      throw new BadRequestException(
        'Разница между началом и окончанием события не может превышать 24 часа',
      );
    }

    if (
      createEventDto.entryCondition === 'PAID' &&
      (!createEventDto.currencyId || !createEventDto.entryFee)
    ) {
      throw new BadRequestException(
        'При выборе платного участия поля currencyId и entryFee обязательны',
      );
    } else if (
      (createEventDto.entryCondition === 'FREE' ||
        createEventDto.entryCondition === 'DONATION') &&
      (createEventDto.currencyId || createEventDto.entryFee)
    ) {
      throw new BadRequestException(
        'При выборе бесплатного участия или участия за донат поля currencyId и entryFee не должны быть указаны.',
      );
    }

    if (createEventDto.imageId) {
      await this.prisma.image.findUniqueOrThrow({
        where: { id: createEventDto.imageId },
      });
    }

    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const eventWallet: Wallet | null =
            await this.walletService.createWalletTx(tx);

          if (!eventWallet) {
            throw new InternalServerErrorException(
              'Кошелек не был возвращен во время транзакции создания события с кошельком',
            );
          }

          const place = await this.placeService.createPlace(
            createEventDto.place,
          );

          if (!place) {
            throw new InternalServerErrorException('Ошибка при создании Place');
          }

          const rating = await tx.rating.create({ data: {} });

          if (!rating) {
            throw new InternalServerErrorException(
              'rating не был возвращен во время транзакции создания события с кошельком',
            );
          }

          const event = await tx.event.create({
            data: {
              title: createEventDto.title,
              description: createEventDto.description,
              imageId: createEventDto.imageId,
              startDate: createEventDto.startDate,
              finishDate: createEventDto.finishDate,
              entryCondition: createEventDto.entryCondition,
              currencyId: createEventDto.currencyId,
              entryFee: createEventDto.entryFee,
              guestLimit: createEventDto.guestLimit,
              deposit: createEventDto.deposit,
              creatorId: currentUserId,
              bonusDistributionType: createEventDto.bonusDistributionType,
              bonusDistributionN: createEventDto.bonusDistributionN ?? null,
              wallet: {
                connect: {
                  id: eventWallet.id,
                },
              },
              placeId: place.id,
              ratingDetails: { connect: { id: rating.id } },
            },
            include: {
              wallet: true,
              place: true,
              currency: { select: { code: true } },
            },
          });

          if (!event.wallet) {
            throw new InternalServerErrorException(
              'Проблема с подключением кошелька к событию',
            );
          }

          const creator = await this.prisma.user.findUniqueOrThrow({
            where: { id: currentUserId },
            select: { wallet: { select: { id: true, balance: true } } },
          });

          if (!creator.wallet) {
            throw new NotFoundException('Кошелек пользователя не найден');
          }

          // Транзакция на списание стоимости создания события
          try {
            await this.transactionCreateService.createTransactionToSystemWallet(
              tx,
              currentUserId,
              creator.wallet.id,
              EVENT_CREATE_COST,
              TransactionType.EVENT_CREATION_CHARGE,
            );
          } catch (error) {
            if (error instanceof HttpException) {
              throw error; // Проброс дальше
            }

            throw new InternalServerErrorException(
              'Ошибка при создании транзакции.',
            );
          }

          // Если есть "призовой" фонд, то делаем перевод
          if (event.deposit) {
            try {
              await this.transactionCreateService.createTransactionBetweenWallets(
                tx,
                currentUserId,
                {
                  fromWalletId: creator.wallet.id,
                  toWalletId: eventWallet.id,
                  amount: event.deposit,
                  type: TransactionType.EVENT_FUND_DEPOSIT,
                },
              );
            } catch (error) {
              if (error instanceof HttpException) {
                throw error; // Проброс дальше
              }

              throw new InternalServerErrorException(
                'Ошибка при пополнении призового фонда.',
              );
            }
          }

          return event;
        },
      );
    } catch (error: unknown) {
      this.loggerService.error(
        'Error during transaction creating Event with Wallet',
        error,
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Ошибка во время проведения транзакции',
      );
    } finally {
      // Проверяем задание "Создание первого мероприятия"
      await this.taskManagementService.verifyTaskCompletion(
        currentUserId,
        TaskList.CREATED_FIRST_MEETING,
      );
    }
  }

  async getEventById(
    id: string,
    longitude?: number,
    latitude?: number,
  ): Promise<ResponseEventDto> {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id, isArchived: false },
      select: {
        id: true,
        title: true,
        description: true,
        image: {
          select: {
            id: true,
            mimeType: true,
          },
        },
        startDate: true,
        finishDate: true,
        entryCondition: true,
        entryFee: true,
        creator: {
          select: {
            id: true,
            fullName: true,
            avatarImage: {
              select: {
                id: true,
                mimeType: true,
              },
            },
          },
        },
        guestLimit: true,
        deposit: true,
        bonusDistributionN: true,
        ratingDetails: {
          select: {
            votesForOne: true,
            votesForTwo: true,
            votesForThree: true,
            votesForFour: true,
            votesForFive: true,
          },
        },
        averageRating: true,
        isArchived: true,
        bonusDistributionType: true,
        currency: { select: { code: true } },
        wallet: { select: { balance: true } },
        place: {
          select: {
            id: true,
            longitude: true,
            latitude: true,
          },
        },
      },
    });

    let distance: number | null = null;

    if (longitude && latitude) {
      distance = parseFloat(
        (
          getDistance(
            {
              latitude: event.place.latitude,
              longitude: event.place.longitude,
            },
            { latitude, longitude },
          ) / 1000
        ).toFixed(1),
      );

      return {
        ...event,
        distance,
      };
    } else {
      return event;
    }
  }

  async updateEventById(
    eventId: string,
    updateEventDto: UpdateEventRequestDto,
    currentUserId: string,
  ): Promise<ResponseEventDto> {
    const now = new Date();

    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId, creatorId: currentUserId, isArchived: false },
      include: {
        activities: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (updateEventDto.startDate && new Date(updateEventDto.startDate) < now) {
      throw new BadRequestException(
        'Дата начала события не может быть в прошлом',
      );
    }

    if (updateEventDto.finishDate) {
      if (
        new Date(updateEventDto.finishDate) <
        new Date(updateEventDto.startDate ?? event.startDate)
      ) {
        throw new BadRequestException(
          'Дата окончания события не может быть раньше даты начала',
        );
      }
    }

    if (updateEventDto.startDate) {
      if (
        new Date(updateEventDto.startDate) >
        new Date(updateEventDto.finishDate ?? event.finishDate)
      ) {
        throw new BadRequestException(
          'Дата начала события не может быть позже даты окончания',
        );
      }
    }

    if (updateEventDto.startDate || updateEventDto.finishDate) {
      const diffInMilliseconds =
        new Date(updateEventDto.finishDate ?? event.finishDate).getTime() -
        new Date(updateEventDto.startDate ?? event.startDate).getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

      if (diffInHours > 24) {
        throw new BadRequestException(
          'Разница между началом и окончанием события не может превышать 24 часа',
        );
      }
    }

    if (now > new Date(event.finishDate)) {
      throw new BadRequestException(
        'Событие уже закончилось, его нельзя редактировать',
      );
    }

    if (now > new Date(event.startDate)) {
      throw new BadRequestException(
        'Событие уже началось, его нельзя редактировать',
      );
    }

    const threeHoursBeforeStart = new Date(event.startDate);
    threeHoursBeforeStart.setHours(threeHoursBeforeStart.getHours() - 3);

    if (now > threeHoursBeforeStart) {
      throw new BadRequestException(
        'До начала события осталось менее 3 часов, его нельзя редактировать',
      );
    }

    // Обновление
    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Основное обновление
          const { imageId, placeId, ...updateData } = updateEventDto;

          const updatedEvent = await tx.event.update({
            where: { id: eventId },
            data: {
              ...updateData,
              ...(imageId && { image: { connect: { id: imageId } } }),
              ...(placeId && { place: { connect: { id: placeId } } }),
            },
            select: {
              id: true,
              title: true,
              description: true,
              image: {
                select: {
                  id: true,
                  mimeType: true,
                },
              },
              startDate: true,
              finishDate: true,
              deposit: true,
              guestLimit: true,
              entryCondition: true,
              entryFee: true,
              bonusDistributionType: true,
              currency: { select: { code: true } },
              place: {
                select: {
                  id: true,
                  longitude: true,
                  latitude: true,
                },
              },
            },
          });

          // Обработка изображения
          if (
            updateEventDto.imageId &&
            updateEventDto.imageId !== event.imageId
          ) {
            // Удаляем старое изображение если оно было
            if (event.imageId) {
              await tx.image.delete({ where: { id: event.imageId } });
            }
          }

          // Обработка места
          if (
            updateEventDto.placeId &&
            updateEventDto.placeId !== event.placeId
          ) {
            // Удаляем старое место если оно было
            if (event.placeId) {
              await tx.place.delete({ where: { id: event.placeId } });
            }
          }

          // Отправка уведомлений об изменении
          const participants = event.activities.map(
            (activity) => activity.userId,
          );

          const changes = this.getEventChangesDescription(
            event,
            updateEventDto,
          );
          const notificationTitle = `Создатель изменил детали встречи «${event.title}»`;
          const eventDate = new Date().toLocaleDateString('ru-RU');

          for (const participantId of participants) {
            await this.notificationsService.createNotification(participantId, {
              title: notificationTitle,
              data: {
                id: event.id,
                title: event.title,
                date: eventDate,
                changes,
                type: 'event.update',
              },
              userId: participantId,
              isRead: false,
            });
          }

          return updatedEvent;
        },
      );
    } catch (error: unknown) {
      this.loggerService.error(
        `Error updating event ${eventId} by user ${currentUserId}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('Ошибка при обновлении события');
    }
  }

  async arhiveEventById(eventId: string, currentUserId: string): Promise<void> {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId, creatorId: currentUserId, isArchived: false },
      include: {
        wallet: true,
        activities: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (new Date(event.startDate) < new Date()) {
      throw new BadRequestException('Событие уже началось, его нельзя удалить');
    }

    const threeHoursBeforeStart = new Date(event.startDate);
    threeHoursBeforeStart.setHours(threeHoursBeforeStart.getHours() - 3);

    if (new Date() > threeHoursBeforeStart) {
      throw new BadRequestException(
        'До начала события менее 3 часов, его нельзя удалить',
      );
    }

    if (!event.wallet) {
      throw new InternalServerErrorException('У события не нашелся кошелек');
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const creator = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { wallet: { select: { id: true } } },
      });

      if (!creator?.wallet) {
        throw new InternalServerErrorException(
          'У пользователя не нашелся кошелек',
        );
      }

      if (event.wallet && event.wallet?.balance) {
        await this.transactionCreateService.createTransactionBetweenWallets(
          tx,
          currentUserId,
          {
            type: TransactionType.EVENT_FUND_REFUND,
            fromWalletId: event.wallet.id,
            toWalletId: creator.wallet.id,
            amount: event.wallet.balance,
          },
        );
      }

      await tx.event.update({
        where: { id: eventId },
        data: { isArchived: true },
      });

      const participants = event.activities.map((activity) => activity.userId);

      const notificationTitle = `Создатель отменил встречу «${event.title}»`;
      const eventDate = new Date().toLocaleDateString('ru-RU');

      for (const participantId of participants) {
        await this.notificationsService.createNotification(participantId, {
          title: notificationTitle,
          data: {
            id: event.id,
            title: event.title,
            date: eventDate,
            type: 'event.archive',
          },
          userId: participantId,
          isRead: false,
        });
      }
    });
  }

  // async getAllEvents(): Promise<ResponseEventDto>[]> {
  //  const events = await this.prisma.event.findMany({
  //    where: { isArchived: false },
  //    include: {
  //      currency: { select: { code: true } },
  //    },
  //  });

  //  return events;
  //}

  private getEventChangesDescription(
    event: UpdateEventRequestDto,
    updateDto: UpdateEventRequestDto,
  ): string {
    const changes: string[] = [];

    // Проверка изменения даты начала или окончания
    const oldStart = event.startDate ? new Date(event.startDate) : null;
    const newStart = updateDto.startDate ? new Date(updateDto.startDate) : null;
    const oldEnd = event.finishDate ? new Date(event.finishDate) : null;
    const newEnd = updateDto.finishDate ? new Date(updateDto.finishDate) : null;

    const isDateChanged =
      (oldStart &&
        newStart &&
        (oldStart.getFullYear() !== newStart.getFullYear() ||
          oldStart.getMonth() !== newStart.getMonth() ||
          oldStart.getDate() !== newStart.getDate())) ||
      (oldEnd &&
        newEnd &&
        (oldEnd.getFullYear() !== newEnd.getFullYear() ||
          oldEnd.getMonth() !== newEnd.getMonth() ||
          oldEnd.getDate() !== newEnd.getDate()));

    const isTimeChanged =
      (oldStart &&
        newStart &&
        (oldStart.getHours() !== newStart.getHours() ||
          oldStart.getMinutes() !== newStart.getMinutes())) ||
      (oldEnd &&
        newEnd &&
        (oldEnd.getHours() !== newEnd.getHours() ||
          oldEnd.getMinutes() !== newEnd.getMinutes()));

    if (isDateChanged) {
      changes.push('дата');
    }

    if (isTimeChanged) {
      changes.push('время');
    }

    // Проверка изменения локации
    if (updateDto.placeId && updateDto.placeId !== event.placeId) {
      changes.push('локация');
    }

    if (changes.length === 0) {
      return '';
    }

    const description =
      changes.join(', ').charAt(0).toUpperCase() +
      changes.join(', ').slice(1) +
      '.';

    return description;
  }
}
