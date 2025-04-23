import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { getObjectHash } from 'src/common/utils/hash.utils';
import { PrismaService } from '../prisma/prisma.service';
import {
  ResponseInviteDto,
  ResponseInvitesPurchaseDto,
} from './dto/response-invite.dto';
import { ResponseHashDto } from 'src/common/dto/response-hash.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/utils/pagination.utils';
import {
  AVERAGE_INVITES_COUNT,
  FIRST_INVITES_PURCHASE_COUNT,
  FIRST_INVITES_PURCHASE_PRICE,
  LAST_INVITES_PURCHASE_COUNT,
  LAST_INVITES_PURCHASE_PRICE,
  MAX_INVITES_COUNT,
  START_INVITES_COUNT,
} from './invite.constant';
import { AppLoggerService } from '../logger/logger.service';
import { TransactionCreateService } from '../transaction/transaction-create.service';
import { Prisma, TransactionType } from '@prisma/client';

@Injectable()
export class InviteService {
  constructor(
    private prisma: PrismaService,
    private readonly loggerService: AppLoggerService,
    private readonly transactionCreateService: TransactionCreateService,
  ) {}

  async createInvite(inviterId: string, inviteeId: string): Promise<string> {
    const newInvite = await this.prisma.invite.create({
      data: {
        inviterId,
        inviteeId,
      },
    });

    return newInvite.id;
  }

  async findInvitesByUserId(inviterId: string, paginationDto: PaginationDto) {
    return await paginate<ResponseInviteDto[]>({
      prisma: this.prisma,
      model: 'invite',
      paginationDto,
      options: {
        excludeFields: ['inviterId', 'inviteeId', 'createdAt', 'updatedAt'],
        where: { inviterId },
        include: {
          inviteeUser: {
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
        },
        order: [{ referralPointsGiven: 'desc' }, { createdAt: 'asc' }],
      },
    });
  }

  getHash(inviterId: string): ResponseHashDto {
    return { hash: getObjectHash({ inviterId }) };
  }

  async purchaseInvites(userId: string): Promise<ResponseInvitesPurchaseDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        totalInvites: true,
        availableInvites: true,
        wallet: { select: { id: true, balance: true } },
      },
    });

    if (user.totalInvites >= MAX_INVITES_COUNT) {
      throw new BadRequestException(
        'Максимальное число приглашений уже приобретено',
      );
    }

    // Транзакция на списание стоимости покупки инвайтов
    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          if (user?.wallet === null) {
            throw new InternalServerErrorException('Кошелек не найден');
          }

          try {
            await this.transactionCreateService.createTransactionToSystemWallet(
              tx,
              userId,
              user.wallet.id,
              user.totalInvites === START_INVITES_COUNT
                ? FIRST_INVITES_PURCHASE_PRICE
                : LAST_INVITES_PURCHASE_PRICE,
              TransactionType.BUST_FRIENDS_CHARGE,
            );
          } catch (error) {
            if (error instanceof HttpException) {
              throw error;
            }

            throw new InternalServerErrorException(
              'Ошибка при создании транзакции.',
            );
          }

          return await tx.user.update({
            where: { id: userId },
            data: {
              availableInvites:
                user.availableInvites +
                (user.totalInvites === START_INVITES_COUNT
                  ? FIRST_INVITES_PURCHASE_COUNT
                  : LAST_INVITES_PURCHASE_COUNT),
              totalInvites:
                user.totalInvites === START_INVITES_COUNT
                  ? AVERAGE_INVITES_COUNT
                  : MAX_INVITES_COUNT,
            },
            select: {
              availableInvites: true,
              totalInvites: true,
            },
          });
        },
      );
    } catch (error: unknown) {
      this.loggerService.error(
        'Error during transaction purchasind User invites',
        error,
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Ошибка во время проведения транзакции',
      );
    }
  }
}
