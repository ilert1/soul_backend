import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, TaskList, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/utils/pagination.utils';
import { UserResponseDto } from './dto/user-response.dto';
import { TaskManagementService } from '../task/services/task-management.service';

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
  ): Promise<User | null> {
    return await tx.user.create({ data });
  }

  async findUsersByEventId(eventId: string): Promise<UserResponseDto[] | null> {
    await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId, isArchived: false },
    });

    return await this.prisma.user.findMany({
      where: { activities: { some: { eventId } } },
      include: { avatarImage: true },
    });
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
}
