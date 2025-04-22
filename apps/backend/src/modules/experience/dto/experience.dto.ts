import { ExperienceType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

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
