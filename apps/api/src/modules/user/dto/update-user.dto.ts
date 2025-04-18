import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Имя и фамилия пользователя',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'Язык пользователя',
    example: 'en',
    required: false,
  })
  @IsString()
  @IsOptional()
  languageCode?: string | null;

  @ApiProperty({
    description: 'Описание пользователя',
    example: 'Люблю программировать и путешествовать.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    description: 'ID страны пользователя',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  countryId?: number | null;

  @ApiProperty({
    description: 'Настройки приватности. Показывать другим SP',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  showSoulPointsToOthers?: boolean;

  @ApiProperty({
    description: 'Настройки приватности. Показывать другим активности',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  showActivityToOthers?: boolean;
}
