import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateActivityRequestDto {
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID события',
  })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  eventId: string;
}

export class ActivityResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор активности',
    example: '13822722-9cae-477e-ba05-f434d95c63ed',
  })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Идентификатор пользователя, связанного с активностью',
    example: 'cm7mcxl5e0000rcukxsmucghg',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Идентификатор события, связанного с активностью',
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
  })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'Дата и время присоединения к активности',
    example: '2025-02-28T10:21:30.436Z',
  })
  @IsDate()
  joinedAt: Date;

  @ApiProperty({
    description: 'Оценка прошедшему мероприятию',
    example: 5,
    nullable: true,
  })
  @IsInt()
  rating: number | null;
}
