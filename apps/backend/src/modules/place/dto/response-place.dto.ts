import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ResponsePlaceDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID места',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Концертный зал Филармонии',
    description: 'Название места',
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Один из лучших залов для классической музыки в городе.',
    description: 'Описание места',
  })
  description: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'г. Москва, ул. Арбат, 10',
    description: 'Адрес места',
  })
  address: string | null;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 55.751244,
    description: 'Широта',
  })
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 37.618423,
    description: 'Долгота',
  })
  longitude: number;
}
