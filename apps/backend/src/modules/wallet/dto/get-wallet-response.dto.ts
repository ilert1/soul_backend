import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '@prisma/client';

export class GetWalletResponseDto {
  @ApiProperty({
    example: 'cm7l414nt0000tlksqn3h8nui',
    description: 'ID кошелька',
  })
  id: string;

  @ApiProperty({ example: 0, description: 'Баланс кошелька' })
  balance: number;

  @ApiProperty({
    example: '2025-02-25T23:20:47.320Z',
    description: 'Дата создания',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-02-25T23:20:47.320Z',
    description: 'Дата обновления',
  })
  updatedAt: Date;

  @ApiProperty({
    example: [
      {
        id: '69ca51b7-9c08-4fe9-a805-49ee817c28e3',
        amount: 50,
        type: 'EARNING',
        status: 'COMPLETED',
        description: null,
        fromWalletId: '4def86e6-b2cc-4851-8b4a-565dc9c770b8',
        toWalletId: '7db6064a-e327-435b-b92d-98eae6a64b9c',
        createdAt: '2025-03-03T11:01:27.862Z',
        updatedAt: '2025-03-03T11:01:27.914Z',
      },
      {
        id: '7c2d7c3b-cf9e-4d4e-8731-de6b5d180255',
        amount: 50,
        type: 'EARNING',
        status: 'COMPLETED',
        description: null,
        fromWalletId: '4def86e6-b2cc-4851-8b4a-565dc9c770b8',
        toWalletId: '7db6064a-e327-435b-b92d-98eae6a64b9c',
        createdAt: '2025-03-03T11:02:37.528Z',
        updatedAt: '2025-03-03T11:02:37.570Z',
      },
    ],
    description:
      'Перечень транзакций кошелька отсортированых от ранних к поздним',
  })
  transactions?: Transaction[];
}
