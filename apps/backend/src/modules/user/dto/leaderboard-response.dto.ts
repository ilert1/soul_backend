import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserAvatarImage {
  @ApiProperty({
    description: 'ID изображения',
    example: '011e9a67-b855-444a-a74b-d15445d12983',
  })
  id: string;

  @ApiProperty({
    description: 'Тип изображения',
    example: 'image/svg+xml',
  })
  mimeType: string;
}

export class LeaderboardDto {
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID пользователя',
  })
  id: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
    nullable: true,
  })
  fullName?: string;

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

  @ApiProperty({
    example: 100,
    description: 'Очки опыта',
    nullable: true,
  })
  experience?: number;

  @ApiProperty({
    example: 100,
    description: 'Баланс SP',
    nullable: true,
  })
  wallet?: { balance: number } | null;
}

export class LeaderboardPositionDto {
  @ApiProperty({
    example: 1,
    description: 'Позиция пользователя в таблице лидеров',
  })
  position: number;

  @ApiProperty({
    example: 100,
    description: 'Очки опыта',
    nullable: true,
  })
  experience?: number;

  @ApiProperty({
    example: 100,
    description: 'Баланс SP',
    nullable: true,
  })
  balance?: number | null;
}
