import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTelegramUserDto {
  @ApiProperty({
    description: 'ID пользователя в Telegram',
    example: '123456789',
  })
  @IsString()
  telegramId: string;

  @ApiProperty({
    description: 'Имя пользователя в Telegram (username)',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'John',
    required: false,
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Является ли пользователь ботом',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isBot?: boolean;

  @ApiProperty({
    description: 'Язык пользователя',
    example: 'en',
    required: false,
  })
  @IsString()
  @IsOptional()
  languageCode?: string;
}
