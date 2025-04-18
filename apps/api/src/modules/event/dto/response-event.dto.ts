import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ResponseRating } from '../../activity/dto/response-rating.dto';
import { BonusDistributionEnum, EntryCondition } from '@prisma/client';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export class ResponseEventDto {
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
    example: 'Описание важного события',
    description: 'Подробности о событии',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Дата и время начала события',
  })
  startDate: Date;

  @ApiProperty({
    example: '2024-01-02T12:00:00Z',
    description: 'Дата и время окончания события',
  })
  finishDate: Date;

  @ApiProperty({
    example: 'FREE',
    description:
      'Условия входа на мероприятие: выбор из типов FREE, DONATION и PAID',
  })
  @IsEnum(EntryCondition)
  entryCondition: EntryCondition;

  @ApiProperty({
    example: 1000,
    description: 'Стоимость участия',
    nullable: true,
  })
  entryFee: number | null;

  @ApiProperty({
    example: {
      votesForOne: 10,
      votesForTwo: 20,
      votesForThree: 30,
      votesForFour: 40,
      votesForFive: 50,
    },
    description: 'Показатели рейтинга',
  })
  ratingDetails?: ResponseRating | null;

  @ApiProperty({
    example: 5,
    description:
      'Вычисленный рейтинг с точностью до одного знака после запятой',
    nullable: true,
  })
  averageRating?: number | null;

  @ApiProperty({
    example: 'USD',
    description: 'Буквенный код валюты для платного входа',
    nullable: true,
  })
  currency: {
    code: string;
  } | null;

  @ApiProperty({
    example: { balance: 100 },
    description: 'Баланс текущего события',
  })
  wallet?: {
    balance: number;
  } | null;

  @ApiProperty({
    example: {
      id: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
      fullName: 'name',
      avatarImage: {
        id: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
        mimeType: 'image/svg+xml',
      },
    },
    description: 'Данные создателя события',
  })
  creator?: UserResponseDto | null;

  @ApiProperty({
    example: {
      id: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
      latitude: 0,
      longitude: 0,
    },
    description: 'ID и координаты места события',
  })
  place?: { id: string; latitude: number; longitude: number } | null;

  @ApiProperty({
    example: 20,
    description: 'Расстояния до события от указанных координат',
  })
  distance?: number | null;

  @ApiProperty({
    example: 1000,
    description: 'Депозит события',
  })
  deposit?: number | null;

  @ApiProperty({
    example: 'ALL',
    description: 'Тип распределения токенов среди участников события',
  })
  bonusDistributionType: BonusDistributionEnum;

  @ApiProperty({
    example: 5,
    description:
      'Количество участников которые будут делить награду. Нужен только при типе распределения FIRST_N',
    nullable: true,
  })
  bonusDistributionN?: number | null;

  @ApiProperty({
    example: 20,
    description: 'Максимальное количество участников',
  })
  guestLimit?: number | null;

  @ApiProperty({
    example: 5,
    description: 'Количество подтвержденных участников',
  })
  confirmedGuests?: number | null;
}

export class PaginatedResponseEventDto {
  @ApiProperty({
    type: [ResponseEventDto],
    description: 'Список событий в текущей странице ответа',
  })
  items: ResponseEventDto[];

  @ApiProperty({ description: 'Общее количество' })
  total: number;

  @ApiProperty({ description: 'Размер страницы' })
  size: number;

  @ApiProperty({ description: 'Текущая страница ответа' })
  page: number;

  @ApiProperty({ description: 'Количество страниц' })
  pages: number;
}
