import { ExperienceType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class CreateExperienceDto {
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID пользователя, которому начисляется опыт',
  })
  userId: string;

  @ApiProperty({
    example: 'FRIENDS_PER_INVITE',
    description: 'Тип начисления опыта',
  })
  type: ExperienceType;
}

export class UserExperienceBufferDto {
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID пользователя, которому начисляется опыт',
  })
  userId: string;

  @ApiProperty({
    example: {
      MESSAGE: 2,
      REACTION: 1,
    },
    description:
      'Объект, где ключ — тип опыта, а значение — количество начислений этого типа',
  })
  @IsObject()
  xp: Partial<Record<ExperienceType, number>>;
}
