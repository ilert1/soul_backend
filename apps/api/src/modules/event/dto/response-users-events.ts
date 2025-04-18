import { ApiProperty } from '@nestjs/swagger';

export class EventImage {
  @ApiProperty({ description: 'Уникальный идентификатор изображения' })
  id: string;

  @ApiProperty({ description: 'MIME-тип изображения' })
  mimeType: string;
}

export class ResponseUsersEventDto {
  @ApiProperty({ description: 'ID события' })
  id: string;

  @ApiProperty({ description: 'Название события' })
  title: string;

  @ApiProperty({ description: 'Дата начала события в формате ISO' })
  startDate: string;

  @ApiProperty({ description: 'Информация о изображении события' })
  image: EventImage;

  @ApiProperty({
    description:
      'Количество пользователей, записанных или участвующих в событии',
  })
  activitiesCount: number;

  @ApiProperty({
    description: 'Депозит для участия в событии (для предшествующего)',
    required: false,
  })
  deposit?: number | null;

  @ApiProperty({
    description: 'Лимит гостей на события (для предшествующего)',
    required: false,
  })
  guestLimit?: number | null;

  @ApiProperty({
    description: 'Средний рейтинг события (для прошедшего)',
    required: false,
  })
  averageRating?: number | null;

  @ApiProperty({
    description:
      'Расстояния до события от указанных координат (для предстоящего)',
    required: false,
  })
  distance?: number | null;
}

export class PaginatedResponseUsersEventDto {
  @ApiProperty({
    type: [ResponseUsersEventDto],
    description: 'Список событий в текущей странице ответа',
  })
  items: ResponseUsersEventDto[];

  @ApiProperty({ description: 'Общее количество' })
  total: number;

  @ApiProperty({ description: 'Размер страницы' })
  size: number;

  @ApiProperty({ description: 'Текущая страница ответа' })
  page: number;

  @ApiProperty({ description: 'Количество страниц' })
  pages: number;
}

export const ResponseUsersEventFutureExample = {
  items: [
    {
      id: '170eb5de-53d1-4c0b-8a74-73693d32cc7a',
      title: 'Концерт классической музыки (уже прошел)',
      startDate: '2026-11-15T00:00:00.000Z',
      image: {
        id: 'e614c1a2-977e-4f30-a260-8024524a0b6c',
        mimeType: 'image/jpeg',
      },
      activitiesCount: 4,
      deposit: 10,
      guestLimit: 100,
      distance: 5.8,
    },
  ],
  total: 7,
  page: 1,
  size: 10,
  pages: 1,
};

export const ResponseUsersEventPastExample = {
  items: [
    {
      id: '01506abd-2446-43d7-9fc8-e9455a246533',
      title: 'Концерт классической музыки (еще не прошел)',
      startDate: '2024-09-15T00:00:00.000Z',
      image: {
        id: '35581bb0-f820-4bb8-93f4-a3bad8f989d9',
        mimeType: 'image/jpeg',
      },
      activitiesCount: 3,
      averageRating: 4.5,
    },
  ],
  total: 1,
  page: 1,
  size: 10,
  pages: 1,
};
