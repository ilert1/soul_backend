import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Transaction, Wallet } from '@prisma/client';
import { GetWalletResponseDto } from './dto/get-wallet-response.dto';
import { AppLoggerService } from '../logger/logger.service';
import { INIT_SYSTEM_WALLET_BALANCE } from './wallet.constants';

@Injectable()
export class WalletService {
  private systemWallet: Wallet;

  private prismaService: PrismaService;

  private loggerService: AppLoggerService;

  constructor(prismaService: PrismaService, loggerService: AppLoggerService) {
    this.prismaService = prismaService;
    this.loggerService = loggerService;
  }

  //запускается при билде приложения
  async onModuleInit() {
    await this.initSystemWallet();
  }

  getSystemWallet(): Wallet {
    if (!this.systemWallet) {
      this.loggerService.error('System wallet was not found');
      throw new InternalServerErrorException(
        'Системный кошелек не был инициализирован',
      );
    }

    return this.systemWallet;
  }

  async createWalletTx(tx: Prisma.TransactionClient): Promise<Wallet | null> {
    return await tx.wallet.create({ data: {} });
  }

  async getWalletById(
    walletId: string,
    currentUserId: string,
  ): Promise<GetWalletResponseDto> {
    const wallet = await this.prismaService.wallet.findUniqueOrThrow({
      where: { id: walletId },
      include: {
        transactionsTo: true,
        transactionsFrom: true,
        user: true,
        event: {
          include: { creator: { select: { id: true } } },
        },
      },
    });

    if (
      wallet?.user?.id !== currentUserId &&
      wallet?.event?.creator?.id !== currentUserId
    ) {
      throw new ForbiddenException(
        'Кошелек или связанное с ним событие не принадлежит текущему пользователю',
      );
    }

    const transactions = [
      ...wallet.transactionsFrom,
      ...wallet.transactionsTo,
    ].sort(
      (a: Transaction, b: Transaction) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      id: wallet.id,
      balance: wallet.balance,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      transactions,
    };
  }

  //метод deleteWalletById нигде не применен. Предназначен для удаления кошелька в рамках Tx при удалении пользователя и события.
  async deleteWalletById(
    tx: Prisma.TransactionClient,
    walletId: string,
  ): Promise<Wallet | null> {
    return await tx.wallet.delete({
      where: { id: walletId },
    });
  }

  //создает системный кошелек, если его не было
  private async initSystemWallet() {
    let systemWallet = await this.prismaService.wallet.findFirst({
      where: { isSystem: true },
    });

    if (!systemWallet) {
      systemWallet = await this.prismaService.wallet.create({
        data: { isSystem: true, balance: INIT_SYSTEM_WALLET_BALANCE },
      });
      this.loggerService.log('System wallet was created');
    }

    this.systemWallet = systemWallet;
  }
}
