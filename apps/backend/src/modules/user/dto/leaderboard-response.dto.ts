import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class UserAvatarImage {
  @Expose()
  id: string;

  @Expose()
  mimeType: string;
}
@Exclude()
export class LeaderboardDto {
  @Expose()
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID пользователя',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
    nullable: true,
  })
  fullName?: string;

  @Expose()
  @Type(() => UserAvatarImage)
  @ApiProperty({
    example: {
      id: '011e9a67-b855-444a-a74b-d15445d12983',
      mimeType: 'image/svg+xml',
    },
    description: 'Аватарка пользователя',
    nullable: true,
  })
  avatarImage?: UserAvatarImage | null;

  @Expose()
  @ApiProperty({
    example: 100,
    description: 'Очки опыта',
    nullable: true,
  })
  experience?: number;

  @Expose()
  @ApiProperty({
    example: 100,
    description: 'Баланс SP',
    nullable: true,
  })
  wallet?: { balance: number } | null;
}

@Exclude()
export class LeaderboardPositionDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Позиция пользователя в таблице лидеров',
  })
  position: number;

  @Expose()
  @ApiProperty({
    example: 100,
    description: 'Очки опыта',
    nullable: true,
  })
  experience?: number;

  @Expose()
  @ApiProperty({
    example: 100,
    description: 'Баланс SP',
    nullable: true,
  })
  balance?: number | null;
}
