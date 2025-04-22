import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
  IsEnum,
} from 'class-validator';

export class CreateTransactionBetweenWalletsDto {
  @ApiProperty({ example: 100, description: 'Сумма транзакции', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: 'TRANSFER',
    description: 'Тип транзакции',
    enum: TransactionType,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    example: 'Перевод средств',
    description: 'Описание транзакции',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID кошелька отправителя',
    format: 'uuid',
  })
  @IsUUID()
  fromWalletId: string;

  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440111',
    description: 'ID кошелька получателя',
    format: 'uuid',
  })
  @IsUUID()
  toWalletId: string;
}
