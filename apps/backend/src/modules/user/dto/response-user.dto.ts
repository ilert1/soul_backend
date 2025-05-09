import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserWalletDto {
  @ApiProperty({
    description: 'Уникальный идентификатор кошелька пользователя',
    example: 'ce127619-2ff7-40b1-b63e-5a757bde574e',
  })
  id: string;

  @ApiProperty({
    description: 'Баланс кошелька пользователя',
    example: 1020,
  })
  balance: number;
}

export class UserCountryDto {
  @ApiProperty({ example: 2, description: 'Идентификатор страны' })
  id: number;

  @ApiProperty({ example: 'Japan', description: 'Название страны' })
  name: string;

  @ApiProperty({ example: 'JP', description: 'Код страны' })
  code: string;
}

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

export class UserGlobalResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: 'ba30f562-67a8-4fe5-81a5-000ebbd2e06f',
  })
  id: string;

  @ApiProperty({
    description: 'Полное имя пользователя',
    example: 'text text',
  })
  fullName: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'text',
  })
  username: string | null;

  @ApiProperty({
    description: 'Код языка',
    example: 'ru',
  })
  languageCode: string | null;

  @ApiProperty({
    description: 'Описание пользователя',
    example: '',
  })
  description: string | null;

  @ApiProperty({
    description: 'Дата создания пользователя',
    example: '2025-05-03T23:56:34.419Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления пользователя',
    example: '2025-05-08T11:15:40.078Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Опыт пользователя',
    example: 0,
  })
  experience: number;

  @ApiProperty({
    description: 'Ранг пользователя',
    example: 'user',
  })
  rank: string;

  @ApiProperty({
    description: 'Общее количество приглашений',
    example: 3,
  })
  totalInvites: number;

  @ApiProperty({
    description: 'Количество доступных приглашений',
    example: 3,
  })
  availableInvites: number;

  @ApiProperty({
    description: 'Общее количество реферальных баллов',
    example: 0,
  })
  totalReferralPoints: number;

  @ApiProperty({
    description: 'Показывать ли активности другим пользователям',
    example: 'true',
  })
  showActivityToOthers: boolean;

  @ApiProperty({
    description: 'Показывать ли соул-пойнты другим пользователям',
    example: 'true',
  })
  showSoulPointsToOthers: boolean;

  @ApiProperty({
    description: 'Время фарминга в профиле пользователя',
    example: 28800000,
  })
  farmingTime: number;

  @ApiProperty({
    description: 'Параметры фарминга',
    example: 1,
  })
  farmingRate: number;

  @Type(() => UserCountryDto)
  country: UserCountryDto | null;

  @Type(() => UserWalletDto)
  wallet: UserWalletDto | null;

  @Type(() => UserAvatarImage)
  avatarImage: UserAvatarImage | null;
}
