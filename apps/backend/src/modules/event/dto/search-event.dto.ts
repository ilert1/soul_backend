import { ApiProperty } from '@nestjs/swagger';
import { EventImage } from './response-users-events';

export class ResponseEventSearchDto {
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID события',
  })
  id: string;

  @ApiProperty({
    example: 'Важное событие',
    description: 'Название события',
  })
  title: string;

  @ApiProperty({
    example: {
      id: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
      mimeType: 'image/jpeg',
    },
    description: 'Информация о изображении события',
  })
  image: EventImage;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Дата и время начала события',
  })
  startDate: Date;

  @ApiProperty({
    example: 20,
    description: 'Расстояния до события от указанных координат',
  })
  distance?: number | null;

  @ApiProperty({
    example: 1000,
    description: 'Фонд вознаграждения за участие в событии',
    nullable: true,
  })
  deposit?: number | null;

  @ApiProperty({
    example: 20,
    description: 'Максимальное количество участников',
  })
  guestLimit?: number | null;

  @ApiProperty({
    example: 5,
    description: 'Количество вступивших участников',
  })
  connectedGuests?: number | null;
}

export class PaginatedResponseEventSearchDto {
  @ApiProperty({
    type: [ResponseEventSearchDto],
    description: 'Список событий в текущей странице ответа',
  })
  items: ResponseEventSearchDto[];

  @ApiProperty({ description: 'Общее количество' })
  total: number;

  @ApiProperty({ description: 'Размер страницы' })
  size: number;

  @ApiProperty({ description: 'Текущая страница ответа' })
  page: number;

  @ApiProperty({ description: 'Количество страниц' })
  pages: number;
}
