import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppLoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/utils/pagination.utils';

@Injectable()
export class TransactionReadService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: AppLoggerService,
    private readonly prisma: PrismaService,
  ) {}

  public async getTransactionById(
    transactionId: string,
    currentUserId: string,
  ): Promise<Transaction> {
    const transaction = await this.prismaService.transaction.findUniqueOrThrow({
      where: { id: transactionId },
      include: {
        fromWallet: {
          include: {
            user: true,
            event: {
              include: { creator: { select: { id: true } } },
            },
          },
        },
      },
    });

    if (
      transaction?.fromWallet?.user?.id !== currentUserId &&
      transaction?.fromWallet?.event?.creator?.id !== currentUserId
    ) {
      throw new ForbiddenException(
        'Транзакция не принадлежит текущему пользователю',
      );
    }

    const { fromWallet: _unused, ...transactionWithoutNested } = transaction;

    return transactionWithoutNested;
  }

  public async getUserTransactions(
    userId: string,
    paginationDto: PaginationDto,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet) {
      throw new InternalServerErrorException('Кошелек пользователя не найден');
    }

    return await paginate<Transaction[]>({
      prisma: this.prisma,
      model: 'transaction',
      paginationDto,
      options: {
        where: {
          OR: [{ fromWalletId: wallet.id }, { toWalletId: wallet.id }],
        },
        order: { createdAt: 'desc' },
        searchFields: [],
      },
    });
  }
}
