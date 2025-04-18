import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from '@prisma/client';

export class TransactionResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Уникальный идентификатор транзакции',
  })
  id: string;

  @ApiProperty({
    example: 'Перевод средств',
    description: 'Описание транзакции',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 'TRANSFER',
    description: 'Тип транзакции',
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiProperty({
    example: 'PENDING',
    description: 'Статус транзакции',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @ApiProperty({ example: 100, description: 'Сумма транзакции' })
  amount: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID кошелька отправителя',
    nullable: true,
  })
  fromWalletId: string | null;

  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440111',
    description: 'ID кошелька получателя',
  })
  toWalletId: string;

  @ApiProperty({
    example: '2025-03-03T12:00:00.000Z',
    description: 'Дата создания транзакции',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-03-03T12:30:00.000Z',
    description: 'Дата последнего обновления транзакции',
  })
  updatedAt: Date;
}

export class PaginatedTransactionResponseDto {
  @ApiProperty({
    type: [TransactionResponseDto],
    description: 'Список транзакций в текущей странице ответа',
  })
  items: TransactionResponseDto[];

  @ApiProperty({ description: 'Общее количество' })
  total: number;

  @ApiProperty({ description: 'Размер страницы' })
  size: number;

  @ApiProperty({ description: 'Текущая страница ответа' })
  page: number;

  @ApiProperty({ description: 'Количество страниц' })
  pages: number;
}
