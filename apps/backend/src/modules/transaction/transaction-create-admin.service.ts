import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionBetweenWalletsDto } from './dto/create-transaction.dto';
import { Prisma } from '@prisma/client';
import type { Transaction } from '@prisma/client';
import { AppLoggerService } from '../logger/logger.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class TransactionCreateAdminService {
  private readonly prismaService: PrismaService;
  private readonly walletService: WalletService;
  private readonly loggerService: AppLoggerService;

  constructor(
    prismaService: PrismaService,
    loggerService: AppLoggerService,
    walletService: WalletService,
  ) {
    this.prismaService = prismaService;
    this.loggerService = loggerService;
    this.walletService = walletService;
  }

  // метод createTransactionBetweenWallets предназначен для перевода между НЕ системными кошельками - возврат или распеределение бонусного фонда
  public async createTransactionBetweenWalletsAdmin(
    currentUserId: string,
    createTransactionDto: CreateTransactionBetweenWalletsDto,
  ): Promise<Transaction> {
    await this.checkTransactionAbility(
      currentUserId,
      createTransactionDto.fromWalletId,
      createTransactionDto.amount,
    );
    const pendingTransaction: Transaction =
      await this.createPendingTransaction(createTransactionDto);

    return await this.processTransaction(
      pendingTransaction.id,
      createTransactionDto.fromWalletId,
      createTransactionDto.toWalletId,
      createTransactionDto.amount,
    );
  }

  private async checkTransactionAbility(
    currentUserId: string,
    walletId: string,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException(
        'Сумма транзакции должна быть положительной',
      );
    }

    const fromWallet = await this.prismaService.wallet.findUniqueOrThrow({
      where: { id: walletId },
      select: {
        balance: true,
        user: { select: { id: true } },
        event: {
          select: {
            id: true,
            creator: { select: { id: true } },
          },
        },
      },
    });

    if (
      fromWallet.user?.id !== currentUserId &&
      fromWallet.event?.creator?.id !== currentUserId
    ) {
      throw new ForbiddenException(
        'Кошелек или связанное с ним событие не принадлежит текущему пользователю',
      );
    }

    if (amount > fromWallet.balance) {
      throw new BadRequestException(
        'Недостаточно баллов на счету для перевода',
      );
    }
  }

  private async createPendingTransaction(
    createTransactionDto: CreateTransactionBetweenWalletsDto,
  ): Promise<Transaction> {
    try {
      return await this.prismaService.transaction.create({
        data: { ...createTransactionDto },
      });
    } catch (error) {
      this.loggerService.error('Error creating pending transaction', error);
      throw new InternalServerErrorException('Ошибка создания транзакции');
    }
  }

  private async processTransaction(
    pendingTransactionId: string,
    fromWalletId: string,
    toWalletId: string,
    amount: number,
  ): Promise<Transaction> {
    try {
      return await this.prismaService.$transaction(
        async (tx: Prisma.TransactionClient): Promise<Transaction> => {
          await tx.wallet.update({
            where: { id: fromWalletId },
            data: { balance: { decrement: amount } },
          });

          await tx.wallet.update({
            where: { id: toWalletId },
            data: { balance: { increment: amount } },
          });

          const finishedTransaction: Transaction = await tx.transaction.update({
            where: { id: pendingTransactionId },
            data: { status: 'COMPLETED' },
          });

          if (finishedTransaction.status === 'COMPLETED') {
            return finishedTransaction;
          } else {
            throw new InternalServerErrorException(
              'Конечный статус транзакции - незавершенный',
            );
          }
        },
      );
    } catch (error) {
      await this.setTransactionFailedStatus(pendingTransactionId);
      this.loggerService.error('Error processing transaction', error);
      throw new InternalServerErrorException(
        'Ошибка во время проведения транзакции',
      );
    }
  }

  private async setTransactionFailedStatus(
    transactionId: string,
  ): Promise<Transaction> {
    try {
      return await this.prismaService.transaction.update({
        where: { id: transactionId },
        data: { status: 'FAILED' },
      });
    } catch (error) {
      this.loggerService.error(
        `Ошибка при установке статуса FAILED для транзакции ${transactionId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Не удалось установить статус FAILED для транзакции',
      );
    }
  }
}
