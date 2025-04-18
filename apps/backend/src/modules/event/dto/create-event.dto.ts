import { ApiProperty } from '@nestjs/swagger';
import { BonusDistributionEnum, EntryCondition } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsPositive,
  IsString,
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { CreatePlaceDto } from 'src/modules/place/dto/create-place.dto';

export class CreateEventRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Концерт классической музыки',
    description: 'Название события',
  })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example:
      'Уникальная возможность насладиться живым исполнением классической музыки от местных артистов.',
    description: 'Описание события',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  @ApiProperty({
    example: '13822722-9cae-477e-ba05-f434d95c63ed',
    description: 'ID изображения, необязательное поле',
  })
  imageId?: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Дата и время начала события в формате ISO 8601',
  })
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-01-02T12:00:00Z',
    description: 'Дата и время окончания события в формате ISO 8601',
  })
  finishDate: Date;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 1000,
    description: 'Фонд вознаграждения за участие в событии',
    nullable: true,
  })
  deposit?: number | null;

  @IsEnum(EntryCondition)
  entryCondition: EntryCondition;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 22,
    description: 'ID валюты для входа',
    nullable: true,
  })
  currencyId?: number | null;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 300,
    description: 'Стоимость входа на мероприятие',
    nullable: true,
  })
  entryFee?: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({
    example: 100,
    description: 'Ограничение по количеству гостей на событии',
  })
  guestLimit?: number;

  @IsNotEmpty()
  @ApiProperty({ type: CreatePlaceDto })
  @ValidateNested()
  @Type(() => CreatePlaceDto)
  place: CreatePlaceDto;

  @IsEnum(BonusDistributionEnum)
  @ApiProperty({
    example: 'ALL',
    description: 'Тип распределения токенов среди участников события',
  })
  bonusDistributionType: BonusDistributionEnum;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description:
      'Количество участников которые будут делить награду. Нужен только при типе распределения FIRST_N',
  })
  bonusDistributionN?: number;
}

export class UpdateEventRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Важное событие',
    description: 'Название события',
    required: false,
  })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Описание важного события',
    description: 'Подробности о событии',
    nullable: true,
    required: false,
  })
  description?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'image123',
    description: 'ID изображения события',
    nullable: true,
    required: false,
  })
  imageId?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'place123',
    description: 'ID места проведения события',
    nullable: true,
    required: false,
  })
  placeId?: string | null;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Дата и время начала события',
    required: false,
  })
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2024-01-02T12:00:00Z',
    description: 'Дата и время окончания события',
    required: false,
  })
  finishDate?: Date;
}
