import { Controller, Post, Req, Body, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PaginatedTransactionResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto';
import { Transaction } from '@prisma/client';
import { CreateTransactionBetweenWalletsDto } from './dto/create-transaction.dto';
import { TransactionReadService } from './transaction-read.service';
import { TransactionCreateAdminService } from './transaction-create-admin.service';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { User } from 'src/common/decorators/current-user.decorator';
import { DEFAULT_PAGE_SIZE } from 'src/common/utils/constants';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  private readonly transactionCreateAdminService: TransactionCreateAdminService;
  private readonly transactionReadService: TransactionReadService;
  constructor(
    transactionCreateAdminService: TransactionCreateAdminService,
    transactionReadService: TransactionReadService,
  ) {
    this.transactionCreateAdminService = transactionCreateAdminService;
    this.transactionReadService = transactionReadService;
  }

  @Get('/history')
  @ApiOperation({ summary: 'Получить список транзакций текущего пользователя' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество транзакций на странице (по умолчанию 10)',
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
    description: 'Список транзакций',
    type: PaginatedTransactionResponseDto,
    example: {
      items: [
        {
          id: '7590e559-c71e-4ee9-a784-85f5449682b3',
          amount: 8,
          type: 'FARM_REWARD',
          status: 'COMPLETED',
          description: null,
          fromWalletId: '3177fa7c-2639-4b82-a15c-6d726ef316b5',
          toWalletId: 'e5f9ee5e-79eb-494a-a467-5023a470ef57',
          createdAt: '2025-03-28T09:11:49.914Z',
          updatedAt: '2025-03-28T09:11:49.946Z',
        },
      ],
      total: 2,
      page: 1,
      size: 10,
      pages: 1,
    },
  })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  async getUserTransactions(
    @Query('limit') limit: number = DEFAULT_PAGE_SIZE,
    @Query('page') page: number = 1,
    @User() user: UserPayload,
  ) {
    const paginationDto: PaginationDto = { limit, page };

    return this.transactionReadService.getUserTransactions(
      user.id,
      paginationDto,
    );
  }

  @Get('/:transactionId')
  @ApiOperation({ summary: 'Получить транзакцию по ID' })
  @ApiParam({
    name: 'transactionId',
    type: String,
    description: 'ID транзакции',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный ответ',
  })
  @ApiResponse({
    status: 403,
    description: 'Транзакция не принадлежит пользователю',
  })
  @ApiResponse({
    status: 404,
    description: 'Транзакция не найдена',
  })
  async getOneTransaction(
    @Param('transactionId') transactionId: string,
    @User() user: UserPayload,
  ): Promise<Transaction> {
    return await this.transactionReadService.getTransactionById(
      transactionId,
      user.id,
    );
  }

  @Post()
  @ApiOperation({ summary: 'ADMIN-API Создать транзакцию между кошельками' })
  @ApiBody({ type: CreateTransactionBetweenWalletsDto })
  @ApiResponse({
    status: 201,
    description: 'Транзакция успешно создана',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Недостаточно баллов на счету',
  })
  @ApiResponse({
    status: 403,
    description: 'Пользователь не имеет доступа к кошельку',
  })
  @ApiResponse({
    status: 404,
    description: 'Не найдена сущность',
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка сервера',
  })
  async createTransaction(
    @Req() request: Request & { user: { id: string } },
    @Body() createTransactionDto: CreateTransactionBetweenWalletsDto,
  ): Promise<Transaction> {
    return await this.transactionCreateAdminService.createTransactionBetweenWalletsAdmin(
      request.user.id,
      createTransactionDto,
    );
  }
}
