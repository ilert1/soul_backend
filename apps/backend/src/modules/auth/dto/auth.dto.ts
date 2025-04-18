import { ApiProperty } from '@nestjs/swagger';
import { ActionDto } from './action.dto';
import {
  ActionRedirctToEventExample,
  ActionRedirctToMainExample,
} from './examples/action.example';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { TelegramUserDataAnalyze } from '../types/telegram-data';

export class AuthDto {
  @IsUUID()
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Токен доступа',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMDYxOGE2MC03MTY0LTQyODItOTdkZC1hNDdlNDE2NTQzMDYiLCJpYXQiOjE3NDM1NTk0OTcsImV4cCI6MTc0MzY0NTg5N30.yUSmy2x6_Gg5yNafm281MbSJmzv0zRKURZjskUfcaRE',
    type: String,
  })
  accessToken: string;

  @ApiProperty({
    description: 'Токен обновления',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMDYxOGE2MC03MTY0LTQyODItOTdkZC1hNDdlNDE2NTQzMDYiLCJpYXQiOjE3NDM1NTk0OTcsImV4cCI6MTc0MzY0NTg5N30.yUSmy2x6_Gg5yNafm281MbSJmzv0zRKURZjskUfcaRE',
  })
  @IsString()
  refreshToken: string;

  @ApiProperty({
    description: 'Признак если пользователь вепрвые зашел',
    example: true,
    type: Boolean,
  })
  isNew?: boolean;

  @ApiProperty({
    description: 'Объект действия для перенаправления на событие',
    example: ActionRedirctToEventExample,
  })
  @ApiProperty({
    description: 'Объект действия для перенаправления главный экран',
    example: ActionRedirctToMainExample,
  })
  @IsOptional()
  action?: ActionDto;

  @ApiProperty({
    description: 'Объект с посчитанными баллами за первый вход',
    example: ActionRedirctToEventExample,
  })
  @IsOptional()
  analyzeProfile?: TelegramUserDataAnalyze;
}
