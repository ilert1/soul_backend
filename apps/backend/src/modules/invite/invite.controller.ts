import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginatedResponseInviteDto,
  ResponseInvitesPurchaseDto,
} from './dto/response-invite.dto';
import { InviteService } from './invite.service';
import { ResponseHashDto } from 'src/common/dto/response-hash.dto';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { DEFAULT_PAGE_SIZE } from 'src/common/utils/constants';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('Invite')
@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Get()
  @ApiOperation({
    summary:
      'Получение списка приглашений текущего пользователя = список друзей',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество записей на странице (по умолчанию 10)',
    schema: { type: 'integer', default: 10 },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы (по умолчанию 1)',
    schema: { type: 'integer', default: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Список приглашений успешно получен',
    type: PaginatedResponseInviteDto,
    example: {
      items: [
        {
          id: '98e3171d-a38b-439b-a82f-5fa40b5f1409',
          referralPointsGiven: 3,
          inviteeUser: {
            id: 'b3ed159a-80aa-4afa-bdfa-e4621e28ecb0',
            fullName: 'Second FullName',
            avatarImage: {
              id: '58bc0c68-6642-4c03-a3e3-a7d7e1766cb3',
              mimeType: 'image/svg+xml',
            },
          },
        },
      ],
      total: 1,
      page: 1,
      size: 10,
      pages: 1,
    },
  })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  async findInvitesByUserId(
    @User() user: UserPayload,
    @Query('limit') limit: number = DEFAULT_PAGE_SIZE,
    @Query('page') page: number = 1,
  ) {
    const paginationDto: PaginationDto = { limit, page };

    return await this.inviteService.findInvitesByUserId(user.id, paginationDto);
  }

  @Get('/qr')
  @ApiOperation({
    summary:
      'Получение хэша текущего пользователя для формирования QR ссылки приглашения',
  })
  @ApiResponse({
    status: 200,
    description: 'Хэш пользователя получен',
    type: [ResponseHashDto],
  })
  getQR(@User() user: UserPayload): ResponseHashDto {
    return this.inviteService.getHash(user.id);
  }

  @Post('/purchase')
  @ApiOperation({
    summary: 'Покупка инвайтов для текущего пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Инвайты успешно добавлены',
    type: ResponseInvitesPurchaseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Максимальное число приглашений уже приобретено',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка во время проведения транзакции',
  })
  @HttpCode(200)
  async purchaseInvites(
    @User() user: UserPayload,
  ): Promise<ResponseInvitesPurchaseDto> {
    return await this.inviteService.purchaseInvites(user.id);
  }
}
