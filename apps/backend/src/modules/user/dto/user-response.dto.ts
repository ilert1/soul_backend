import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserAvatarImage {
  @ApiProperty({
    description: 'ID изображения',
    example: '011e9a67-b855-444a-a74b-d15445d12983',
  })
  id: string;

  @ApiProperty({
    description: 'Тип изображения',
    example: 'image/svg+xml',
  })
  mimeType: string;
}

export class UserResponseDto {
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID пользователя',
  })
  id: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
    nullable: true,
  })
  fullName: string | null;

  @Type(() => UserAvatarImage)
  @ApiProperty({
    example: {
      id: '011e9a67-b855-444a-a74b-d15445d12983',
      mimeType: 'image/svg+xml',
    },
    description: 'Аватарка пользователя',
    nullable: true,
  })
  avatarImage: UserAvatarImage | null;
}

export class ActivityWithUserResponseDto {
  @Type(() => UserResponseDto)
  @ApiProperty({
    description: 'Пользователь из активности',
  })
  user: UserResponseDto;
}
