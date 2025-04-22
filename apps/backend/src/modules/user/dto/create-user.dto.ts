import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Имя и фамилия пользователя',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Имя пользователя (username)',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty({
    description: 'Язык пользователя',
    example: 'en',
    required: false,
  })
  @IsString()
  @IsOptional()
  languageCode: string;

  @ApiProperty({
    description: 'Описание пользователя',
    example: 'Люблю программировать и путешествовать.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  contryId?: number;
}
