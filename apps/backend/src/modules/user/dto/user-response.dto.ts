import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class UserAvatarImage {
  @Expose()
  id: string;

  @Expose()
  mimeType: string;
}
@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID пользователя',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
    nullable: true,
  })
  fullName: string | null;

  @Expose()
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
