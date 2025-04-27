import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, TaskList, TransactionType, User } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { getObjectFromHash } from 'src/common/utils/hash.utils';
import { AvatarService } from '../avatar/avatar.service';
import { CreateImageDto } from '../image/image.controller';
import { ImageService } from '../image/image.service';
import { InviteService } from '../invite/invite.service';
import { AppLoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTelegramUserDto } from '../telegramUser/dto/create-telegramUser.dto';
import { TelegramUserService } from '../telegramUser/telegramUser.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';
import refreshJwtConfig from './config/refresh-jwt.config';
import { Action, ActionType } from './types/action';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { CurrentUser } from './types/current-user';
import { Invitation } from './types/invitation';
import { TransactionCreateService } from '../transaction/transaction-create.service';
import {
  POINTS_FOR_ONE_YEAR_TG,
  POINTS_FOR_PREMIUM,
  POINTS_FOR_REGISTRATION,
} from './auth.consts';
import { ExperienceService } from '../experience/experience.service';
import { TaskManagementService } from '../task/services/task-management.service';
import { TelegramDataDto } from './dto/telegram-data.dto';
import { TelegramUserDataAnalyze } from './types/telegram-data';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
    private avatarService: AvatarService,
    private imageService: ImageService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    private walletService: WalletService,
    private loggerService: AppLoggerService,
    private telegramUserService: TelegramUserService,
    private inviteService: InviteService,
    private readonly transactionCreateService: TransactionCreateService,
    private readonly experienceServise: ExperienceService,
    private readonly taskManagementService: TaskManagementService,
  ) {}

  async handleTelegramLogin(telegramData: TelegramDataDto) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN!;
    const initData = telegramData.initData;
    const userData = telegramData.initDataUnsafe.user;
    const invitationHash = telegramData.invitationHash;

    let invitation: Invitation | null = null;
    let action: Action | null = null;
    let analyzedProfile: TelegramUserDataAnalyze | null = null;

    if (invitationHash) {
      try {
        //invitationHash гарантировано строка, если ошибка декодирования - возвращаем 400
        invitation = getObjectFromHash(invitationHash);
      } catch (error: unknown) {
        this.loggerService.error('Ошибка декодирования хэша', error);
        throw new BadRequestException('Неверная ссылка приглашения');
      }
    }

    // Проверка подлинности данных Telegram
    const isValid = this.validateTelegramData(initData, botToken);

    if (!isValid) {
      throw new BadRequestException('Неверные данные Telegram');
    }

    // Поиск или создание TelegramUser
    let telegramUser = await this.prisma.telegramUser.findUnique({
      where: { telegramId: userData.id.toString() },
    });

    if (!telegramUser) {
      const createTelegramUserDto: CreateTelegramUserDto = {
        telegramId: userData.id.toString(),
        fullName: `${userData.firstName} ${userData.lastName}`,
        username: userData.username,
        isBot: userData.isBot || false,
        languageCode: userData.languageCode,
      };

      telegramUser = await this.telegramUserService.create(
        createTelegramUserDto,
      );
    }

    // Поиск или создание User
    let user = await this.prisma.user.findFirst({
      where: { telegramUser: { telegramId: telegramUser.telegramId } },
    });

    if (!user) {
      const avatar = this.avatarService.generateAvatar(
        userData.username ?? 'username',
      );

      const createImageDto: CreateImageDto = {
        data: avatar,
        mimeType: 'image/svg+xml',
        size: avatar?.length ?? 0,
        name: `avatar_${userData.username ?? 'username'}.svg`,
      };

      const avatarImage = await this.imageService.create(createImageDto);

      const userDataCreate: CreateUserDto = {
        fullName: `${userData.firstName} ${userData.lastName}`,
        username: userData.username ?? 'username',
        languageCode: userData.languageCode ?? 'en',
        description: '',
      };

      user = await this.createUserWithWalletTx(
        userDataCreate,
        telegramUser.telegramId,
        avatarImage?.id,
      );

      if (invitation && invitation.inviterId) {
        if (
          !invitation.eventId &&
          (await this.checkIsInviteUnavailable(invitation.inviterId))
        ) {
          throw new BadRequestException('Приглашение недоступно');
        }

        action = { actionType: ActionType.redirectToMain };
        const inviterId: string = invitation.inviterId;

        // Уменьшение количества доступных приглашений у inviter
        await this.userService.decreaseAvailableInvites(inviterId);

        // Создаем запись о приглашении
        await this.inviteService.createInvite(inviterId, user.id);

        // Начисляем опыт за приглашение
        await this.experienceServise.addExperience({
          userId: inviterId,
          type: 'FRIENDS_PER_INVITE',
        });

        // Выполняем проверку задания
        await this.taskManagementService.verifyTaskCompletion(
          inviterId,
          TaskList.INVITED_FRIENDS,
        );
      }

      analyzedProfile = await this.getTelegramUserAnalyze(
        telegramData,
        user.id,
      );
    }

    if (invitation && invitation.eventId) {
      action = {
        actionType: ActionType.redirectToEvent,
        eventId: invitation.eventId,
      };
    }

    const response = await this.generateAndUpdateTokens(user.id);

    return {
      ...response,
      action,
      analyzeProfile: analyzedProfile,
    };
  }

  private async getTelegramUserAnalyze(
    telegramData: TelegramDataDto,
    userId: string,
  ) {
    let analyzeProfile: TelegramUserDataAnalyze | null = null;

    const wallet = await this.prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      throw new InternalServerErrorException('У пользователя нет кошелька');
    }

    const pointsForPremium = telegramData.initDataUnsafe.user.isPremium
      ? POINTS_FOR_PREMIUM
      : 0;

    const telegramId = Number(telegramData.initDataUnsafe.user.id);

    const registrationTimestamp =
      2.95e-21 * Math.pow(telegramId, 3) -
      4.19e-11 * Math.pow(telegramId, 2) +
      0.188 * telegramId +
      1.42e9;

    const registrationDate = new Date(registrationTimestamp * 1000);
    const now = new Date();

    let ageOfProfileYears = now.getFullYear() - registrationDate.getFullYear();
    const isBeforeBirthday =
      now.getMonth() < registrationDate.getMonth() ||
      (now.getMonth() === registrationDate.getMonth() &&
        now.getDate() < registrationDate.getDate());

    if (isBeforeBirthday) {
      ageOfProfileYears--;
    }

    const pointsForAgeOfProfile = ageOfProfileYears * POINTS_FOR_ONE_YEAR_TG;

    const totalPoints =
      pointsForPremium + pointsForAgeOfProfile + POINTS_FOR_REGISTRATION;

    await this.prisma.$transaction(async (tx) => {
      try {
        await this.transactionCreateService.createTransactionFromSystemWallet(
          tx,
          wallet.id,
          totalPoints,
          TransactionType.WELCOME_BONUS,
        );
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }

        throw new InternalServerErrorException('Ошибка при начислении награды');
      }
    });

    analyzeProfile = {
      pointsForPremium,
      ageOfProfileYears,
      pointsForAgeOfProfile,
      basePointsForRegistration: POINTS_FOR_REGISTRATION,
    };

    return analyzeProfile;
  }

  async refreshToken(userId: string) {
    return await this.generateAndUpdateTokens(userId);
  }

  async generateAndUpdateTokens(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });

    return { id: userId, accessToken, refreshToken };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };

    const accessTokenSecret = process.env.JWT_SECRET;
    const refreshTokenSecret = process.env.REFRESH_JWT_SECRET;

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new BadRequestException('JWT secrets are not properly configured');
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessTokenSecret,
      expiresIn: process.env.JWT_EXPIRED,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshTokenSecret,
      expiresIn: process.env.REFRESH_JWT_EXPIRED,
    });

    return { accessToken, refreshToken };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOne(userId);

    if (!user.hashedRefreshToken)
      throw new BadRequestException('Неверный refresh токен');

    const isRefreshTokenValid = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    if (!isRefreshTokenValid)
      throw new BadRequestException('Неверный refresh токен');

    return { id: user.id };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь заблокирован');
    }

    const currentUser: CurrentUser = { id: user.id };

    return currentUser;
  }

  private validateTelegramData(
    telegramInitData: string,
    botToken: string,
  ): boolean {
    if (process.env.NODE_ENV === 'development') return true;

    const initData = new URLSearchParams(telegramInitData);
    const hash = initData.get('hash');
    const dataToCheck: string[] = [];

    initData.sort();
    initData.forEach(
      (val, key) => key !== 'hash' && dataToCheck.push(`${key}=${val}`),
    );

    const secret = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const _hash = crypto
      .createHmac('sha256', secret)
      .update(dataToCheck.join('\n'))
      .digest('hex');

    return hash === _hash;
  }

  // не применен нигде
  // private getInviterIdFromHash(invitationHash: string): string {
  //   const invitation = getObjectFromHash(invitationHash);

  //   return invitation.inviterId;
  // }

  private async checkIsInviteUnavailable(inviterId: string): Promise<boolean> {
    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    return !inviter || (inviter && inviter.availableInvites === 0);
  }

  private async createUserWithWalletTx(
    userDataCreate: CreateUserDto,
    telegramId: string,
    avatarImageId: string,
  ): Promise<User> {
    try {
      const user: User = await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const wallet = await this.walletService.createWalletTx(tx);
          const createdUser = await this.userService.createUserTx(tx, {
            ...userDataCreate,
            avatarImage: {
              connect: { id: avatarImageId },
            },
            telegramUser: {
              connect: { telegramId },
            },
            wallet: {
              connect: { id: wallet?.id },
            },
          });

          if (!createdUser || !wallet) {
            throw new Error(
              `User or wallet is null after the transaction.` +
                `UserData: ${JSON.stringify(userDataCreate)}`,
            );
          }

          return createdUser;
        },
        {
          isolationLevel: 'Serializable',
        },
      );

      return user;
    } catch (error) {
      this.loggerService.error(
        'Error during the transaction of creating user and wallet',
        error,
      );
      throw error;
    }
  }
}
