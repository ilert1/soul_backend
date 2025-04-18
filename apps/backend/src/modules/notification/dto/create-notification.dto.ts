import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @ApiProperty({
    example: 'Новое сообщение',
    description: 'Заголовок уведомления',
  })
  title: string;

  @ApiProperty({
    description: 'Дополнительные данные уведомления в формате JSON',
    required: false,
    example: {
      type: 'event.update',
      id: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
      title: 'Дегустация крафтового пива',
      date: '26.02.2025',
      changes: 'дата, время',
    },
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsString()
  @ApiProperty({
    example: '123',
    description: 'ID пользователя',
  })
  userId: string;

  @ApiProperty({
    example: false,
    description: 'Статус прочтения',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRead: boolean;
}
