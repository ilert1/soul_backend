import { ApiProperty } from '@nestjs/swagger';

export class AvatarImageDto {
  @ApiProperty({
    example: 'd45e4beb-b15b-4e0b-b52c-6ac149fa413d',
    description: 'ID аватара',
  })
  id: string;

  @ApiProperty({ example: 'image/png', description: 'MIME-тип изображения' })
  mimeType: string;
}

export class InviteeUserDto {
  @ApiProperty({
    example: 'e56e4beb-b15b-4e0b-b52c-6ac149fa413e',
    description: 'ID пользователя',
  })
  id: string;

  @ApiProperty({ example: 'john doe', description: 'Полное имя пользователя' })
  fullName: string;

  @ApiProperty({
    type: () => AvatarImageDto,
    description: 'Аватар пользователя',
  })
  avatarImage: AvatarImageDto;
}

export class ResponseInviteDto {
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID приглашения',
  })
  id: string;

  @ApiProperty({
    example: 100,
    description: 'Общее количество реферальных очков',
  })
  referralPointsGiven: number;

  @ApiProperty({
    type: () => InviteeUserDto,
    description: 'Приглашенный пользователь',
  })
  inviteeUser?: InviteeUserDto;
}

export class ResponseInvitesPurchaseDto {
  @ApiProperty({
    example: '2',
    description: 'Количество доступных приглашений пользователя',
  })
  availableInvites: number;

  @ApiProperty({
    example: '6',
    description: 'Общее количество приглашений пользователя',
  })
  totalInvites: number;
}

export class PaginatedResponseInviteDto {
  @ApiProperty({
    type: [ResponseInviteDto],
    description: 'Список друзей/приглашений в текущей странице ответа',
  })
  items: ResponseInviteDto[];

  @ApiProperty({ description: 'Общее количество' })
  total: number;

  @ApiProperty({ description: 'Размер страницы' })
  size: number;

  @ApiProperty({ description: 'Текущая страница ответа' })
  page: number;

  @ApiProperty({ description: 'Количество страниц' })
  pages: number;
}
