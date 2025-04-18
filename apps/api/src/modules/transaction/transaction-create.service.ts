import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionBetweenWalletsDto } from './dto/create-transaction.dto';
import { Prisma } from '@prisma/client';
import type { Transaction, TransactionType } from '@prisma/client';
import { AppLoggerService } from '../logger/logger.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class TransactionCreateService {
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
  public async createTransactionBetweenWallets(
    tx: Prisma.TransactionClient,
    currentUserId: string,
    createTransactionDto: CreateTransactionBetweenWalletsDto,
  ): Promise<Transaction> {
    await this.checkTransactionAbility(
      tx,
      currentUserId,
      createTransactionDto.fromWalletId,
      createTransactionDto.amount,
    );
    const pendingTransaction: Transaction = await this.createPendingTransaction(
      tx,
      createTransactionDto,
    );

    return await this.processTransaction(
      tx,
      pendingTransaction.id,
      createTransactionDto.fromWalletId,
      createTransactionDto.toWalletId,
      createTransactionDto.amount,
    );
  }

  //Метод createTransactionFromSystemWallet предназначен начисления пользователю баллов из системного кошелька.
  public async createTransactionFromSystemWallet(
    tx: Prisma.TransactionClient,
    toWalletId: string,
    amount: number,
    transactionType: TransactionType,
  ): Promise<Transaction> {
    if (amount <= 0) {
      throw new BadRequestException(
        'Сумма транзакции должна быть положительной',
      );
    }

    const systemWallet = this.walletService.getSystemWallet();

    if (systemWallet.balance < amount) {
      await this.addMissingBalanceForSystemWallet(systemWallet.id, amount);
    }

    const pendingTransaction: Transaction = await this.createPendingTransaction(
      tx,
      {
        fromWalletId: systemWallet.id,
        toWalletId,
        amount,
        type: transactionType,
      },
    );

    return await this.processTransaction(
      tx,
      pendingTransaction.id,
      systemWallet.id,
      toWalletId,
      amount,
    );
  }

  // метод createTransactionToSystemWallet предназначен для оплаты покупки новых инвайтов и создания мероприятий. Т.е. пользователь платит в системный кошелек
  public async createTransactionToSystemWallet(
    tx: Prisma.TransactionClient,
    currentUserId: string,
    fromWalletId: string,
    amount: number,
    transactionType: TransactionType,
  ): Promise<Transaction> {
    await this.checkTransactionAbility(tx, currentUserId, fromWalletId, amount);
    const systemWallet = this.walletService.getSystemWallet();
    const pendingTransaction: Transaction = await this.createPendingTransaction(
      tx,
      {
        fromWalletId,
        toWalletId: systemWallet.id,
        amount,
        type: transactionType,
      },
    );

    return await this.processTransaction(
      tx,
      pendingTransaction.id,
      fromWalletId,
      systemWallet.id,
      amount,
    );
  }

  private async checkTransactionAbility(
    tx: Prisma.TransactionClient,
    currentUserId: string,
    walletId: string,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException(
        'Сумма транзакции должна быть положительной',
      );
    }

    const fromWallet = await tx.wallet.findUniqueOrThrow({
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
    tx: Prisma.TransactionClient,
    createTransactionDto: CreateTransactionBetweenWalletsDto,
  ): Promise<Transaction> {
    try {
      return await tx.transaction.create({
        data: { ...createTransactionDto },
      });
    } catch (error) {
      this.loggerService.error('Error creating pending transaction', error);
      throw new InternalServerErrorException('Ошибка создания транзакции');
    }
  }

  private async processTransaction(
    tx: Prisma.TransactionClient,
    pendingTransactionId: string,
    fromWalletId: string,
    toWalletId: string,
    amount: number,
  ): Promise<Transaction> {
    try {
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
    } catch (error) {
      await this.setTransactionFailedStatus(tx, pendingTransactionId);
      this.loggerService.error('Error processing transaction', error);
      throw new InternalServerErrorException(
        'Ошибка во время проведения транзакции',
      );
    }
  }

  private async setTransactionFailedStatus(
    tx: Prisma.TransactionClient,
    transactionId: string,
  ): Promise<Transaction> {
    try {
      return await tx.transaction.update({
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

  //методa addMissingBalanceForSystemWallet является страховкой на критический случай, если администратор не заметил, что баллы закончились.
  //по логике MVP такого не может произойти, но метод для страховки нужен
  private async addMissingBalanceForSystemWallet(
    systemWalletId: string,
    amount: number,
  ): Promise<void> {
    await this.prismaService.wallet.update({
      where: { id: systemWalletId },
      data: { balance: { increment: amount } },
    });
  }
}
