import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LeaderboardType, Prisma, TaskList, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/utils/pagination.utils';
import {
  ActivityWithUserResponseDto,
  UserResponseDto,
} from './dto/user-response.dto';
import { TaskManagementService } from '../task/services/task-management.service';
import { PaginatedResult } from 'src/common/types/paginarted-result';

@Injectable()
export class UserService {
  private readonly excludeFields: string[] = ['hashedRefreshToken'];

  constructor(
    private prisma: PrismaService,
    private readonly taskManagementService: TaskManagementService,
  ) {}

  async updateHashedRefreshToken(userId: string, hashedRefreshToken: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  async create(data: CreateUserDto) {
    return await this.prisma.user.create({ data });
  }

  async findAll(paginationDto: PaginationDto, search: string) {
    return await paginate<UserResponseDto>({
      prisma: this.prisma,
      model: 'user',
      paginationDto,
      options: {
        where: { isActive: true },
        order: { createdAt: 'desc' },
        searchQuery: search,
        searchFields: ['fullName'],
        excludeFields: this.excludeFields,
        include: { telegramUser: true, avatarImage: true },
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { telegramUser: true, avatarImage: true },
    });
  }

  async findMe(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        country: true,
        wallet: true,
        avatarImage: true,
      },
    });

    return user;
  }

  async findById(id: string, requestingUserId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        country: true,
        wallet: true,
        avatarImage: true,
      },
    });

    if (
      requestingUserId === id ||
      (requestingUserId !== id && user.showSoulPointsToOthers)
    ) {
      return user;
    } else {
      const { wallet: _wallet, ...userWithoitWallet } = user;

      return userWithoitWallet;
    }
  }

  async findOneByTelegramId(telegramId: string) {
    return await this.prisma.user.findFirst({
      where: { telegramUser: { telegramId } },
      include: { telegramUser: true, avatarImage: true },
    });
  }

  async updateUser(id: string, data: UpdateUserDto) {
    if (Object.prototype.hasOwnProperty.call(data, 'isActive')) {
      throw new BadRequestException('Нельзя изменить активность пользователя');
    }

    await this.prisma.user.findUniqueOrThrow({ where: { id } });

    const result = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        country: true,
        wallet: true,
      },
    });

    // Подтверждение задания
    if (result.description && result.country) {
      await this.taskManagementService.confirmUserTask(
        result.id,
        TaskList.PROFILE_COMPLETED,
      );
    }

    return result;
  }

  async banUser(id: string, isActive: boolean) {
    await this.prisma.user.findUniqueOrThrow({ where: { id } });

    return await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async createUserTx(
    tx: Prisma.TransactionClient,
    data: Prisma.UserCreateInput,
  ): Promise<User> {
    return await tx.user.create({ data });
  }

  async findUsersByEventId(
    paginationDto: { page: number; limit: number },
    eventId: string,
  ): Promise<PaginatedResult<UserResponseDto | null>> {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId, isArchived: false },
    });

    const currentDate = new Date();

    const res = await paginate<ActivityWithUserResponseDto>({
      prisma: this.prisma,
      model: 'activity',
      paginationDto,
      options: {
        where:
          event.finishDate > currentDate
            ? { eventId: eventId }
            : {
                eventId: eventId,
                isConfirmedAt: {
                  not: null,
                },
              },
        order:
          event.finishDate > currentDate
            ? { joinedAt: 'asc' } // Сортировка по дате записи на мероприятие
            : [
                { receivedPoints: 'asc' }, // Сначала те, у кого есть баллы
                { isConfirmedAt: 'asc' }, // Затем по дате "обилечивания"
              ],
        include: {
          user: {
            include: {
              avatarImage: true,
            },
          },
        },
      },
    });

    return { ...res, items: res.items.map((item) => item.user) };
  }

  async findUserByActivityId(
    activityId: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { activities: { some: { id: activityId } } },
      include: { avatarImage: true },
    });

    return user;
  }

  // Уменьшение количества доступных приглашений у пользователя
  async decreaseAvailableInvites(userId: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { availableInvites: { decrement: 1 } },
    });
  }

  async getLeaderboard({
    filter,
    countryId,
  }: {
    filter?: string;
    countryId?: number;
  }) {
    const countryWhere = countryId ? { country: { id: countryId } } : {};
    const take = 100; // Количество возвращаемых пользователей

    if (filter === LeaderboardType.XP) {
      return await this.prisma.user.findMany({
        where: {
          isActive: true,
          ...countryWhere,
        },
        include: {
          avatarImage: true,
          country: true,
        },
        orderBy: [
          {
            experience: 'desc',
          },
          {
            createdAt: 'asc',
          },
        ],
        take,
      });
    }

    return await this.prisma.user.findMany({
      where: {
        isActive: true,
        ...countryWhere,
        wallet: {
          isNot: null,
        },
      },
      select: {
        id: true,
        fullName: true,
        showSoulPointsToOthers: true,
        wallet: {
          select: {
            balance: true,
          },
        },
        avatarImage: {
          select: {
            mimeType: true,
            id: true,
          },
        },
      },
      orderBy: [
        {
          wallet: { balance: 'desc' },
        },
        {
          createdAt: 'asc',
        },
      ],
      take,
    });
  }

  async getPositionInLeaderboard({
    filter,
    countryId,
    userId,
  }: {
    filter?: string;
    countryId?: number;
    userId: string;
  }) {
    const currentUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId, wallet: { isNot: null } },
      include: {
        wallet: true,
      },
    });
    let position: number | null = null;

    if (filter === LeaderboardType.SP && !currentUser.showSoulPointsToOthers) {
      throw new ForbiddenException('У пользователя скрыты SP');
    }

    if (countryId && countryId !== currentUser.countryId) {
      throw new BadRequestException('Пользователь из другой страны');
    }

    if (!currentUser.wallet) {
      throw new NotFoundException('У пользователя нет кошелька');
    }

    const countryWhere = countryId ? { country: { id: countryId } } : {};
    let rateList: any[];

    if (filter === LeaderboardType.XP) {
      rateList = await this.prisma.user.findMany({
        where: {
          isActive: true,
          experience: {
            gte: currentUser.experience,
          },
          ...countryWhere,
        },
        orderBy: [{ createdAt: 'asc' }],
      });
    } else {
      rateList = await this.prisma.user.findMany({
        where: {
          isActive: true,
          showSoulPointsToOthers: true,
          ...countryWhere,
          wallet: {
            isNot: null,
          },
        },
        include: {
          avatarImage: true,
          country: true,
          wallet: true,
        },
        orderBy: [
          {
            wallet: { balance: 'desc' },
          },
          {
            createdAt: 'asc',
          },
        ],
      });
    }

    position = rateList.findIndex((user) => user.id == currentUser.id);

    return {
      position: position + 1, // Позиция в таблице лидеров
      balance: currentUser.wallet.balance,
      experience: currentUser.experience,
    };
  }
}
