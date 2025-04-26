import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class UserDataDto {
  @ApiProperty({
    example: '123456789',
    description: 'Идентификатор пользователя',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Имя пользователя (если есть)',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'John', description: 'Имя пользователя' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Фамилия пользователя (если есть)',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: true, description: 'Является ли ботом' })
  @IsBoolean()
  @IsOptional()
  isBot?: boolean;

  @ApiProperty({ example: 'en', description: 'Код языка (например, en, ru)' })
  @IsString()
  @IsOptional()
  languageCode?: string;

  @ApiProperty({
    example: true,
    description: 'Является ли премиум пользователем',
  })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @ApiProperty({ example: false, description: 'Добавлен ли в меню вложений' })
  @IsBoolean()
  @IsOptional()
  addedToAttachmentMenu?: boolean;

  @ApiProperty({
    example: true,
    description: 'Разрешает ли писать в личные сообщения',
  })
  @IsBoolean()
  @IsOptional()
  allowsWriteToPm?: boolean;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL фото пользователя (если есть)',
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class ChatDataDto {
  @ApiProperty({ example: 123456789, description: 'Идентификатор чата' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'My Chat', description: 'Название чата' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Joe',
    description: 'Имя пользователя (если есть)',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'group', description: 'Тип чата' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'https://example.com/chat_photo.jpg',
    description: 'URL фото чата (если есть)',
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class InitDataUnsafeDto {
  @ApiProperty({
    example: 'AAHdF6IQAAAAAN0XohDhrB8b',
    description: 'Идентификатор запроса',
  })
  @IsUUID()
  @IsNotEmpty()
  queryId: string;

  @ApiProperty({ description: 'Данные пользователя' })
  @IsNotEmpty()
  user: UserDataDto;

  @ApiProperty({ description: 'Данные чата' })
  @IsNotEmpty()
  chat: ChatDataDto;

  @ApiProperty({ example: 'group', description: 'Тип чата' })
  @IsString()
  @IsOptional()
  chatType?: string;

  @ApiProperty({
    example: '123456789',
    description: 'Идентификатор экземпляра чата (при наличии)',
  })
  @IsString()
  @IsOptional()
  chatInstance?: string;

  @ApiProperty({
    example: 'start',
    description: 'Стартовый параметр (при наличии)',
  })
  @IsString()
  @IsOptional()
  startParam?: string;

  @ApiProperty({
    example: 10,
    description: 'Время, когда можно отправить сообщение (в секундах)',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  canSendAfter?: number;

  @ApiProperty({
    example: 1600000000,
    description: 'Дата аутентификации (Unix timestamp)',
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  authDate: number;

  @ApiProperty({
    example: 'abc123def456',
    description: 'Хэш для проверки целостности данных',
  })
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiProperty({ example: false, description: 'Является ли ботом' })
  @IsBoolean()
  @IsOptional()
  isBot?: boolean;
}

export class TelegramDataDto {
  @ApiProperty({
    example:
      'query_id=AAHdF6IQAAAAAN0XohDhrB8b&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%2C%22last_name%22%3A%22Doe%22%2C%22username%22%3A%22johndoe%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1600000000&hash=abc123def456',
    description: 'Данные инициализации для Telegram',
  })
  @IsString()
  @IsNotEmpty()
  initData: string;

  @ApiProperty({ description: 'Днные инициализации' })
  @IsNotEmpty()
  initDataUnsafe: InitDataUnsafeDto;

  @ApiProperty({
    example: 'abc123def456',
    description: 'Хэш приглашения (если есть)',
  })
  @IsString()
  @IsOptional()
  invitationHash?: string;
}
