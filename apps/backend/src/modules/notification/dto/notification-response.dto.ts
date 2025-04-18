import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export class NotificationResponseDto {
  @ApiProperty({ description: 'ID уведомления' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Заголовок уведомления' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Дополнительные данные уведомления',
  })
  @Type(() => Object)
  data: Record<string, any>;

  @ApiProperty({ description: 'Прочитано ли уведомление' })
  @IsBoolean()
  isRead: boolean;

  @ApiProperty({
    description: 'ID пользователя, которому адресовано уведомление',
  })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Дата создания уведомления в формате ISO' })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Дата последнего обновления уведомления в формате ISO',
  })
  @IsString()
  updatedAt: string;

  @ApiProperty({
    description: 'Информация о пользователе, которому адресовано уведомление',
    type: () => UserResponseDto,
  })
  @ValidateNested()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}

export class PaginatedNotificationResponseDto {
  @ApiProperty({
    description: 'Список уведомлений на текущей странице',
    type: [NotificationResponseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => NotificationResponseDto)
  items: NotificationResponseDto[];

  @ApiProperty({ description: 'Общее количество уведомлений' })
  total: number;

  @ApiProperty({ description: 'Размер страницы' })
  size: number;

  @ApiProperty({ description: 'Текущая страница' })
  page: number;

  @ApiProperty({ description: 'Количество страниц' })
  pages: number;
}
