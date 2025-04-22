import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty } from 'class-validator';

export class RequestRatingDto {
  @IsInt()
  @IsNotEmpty()
  @IsIn([1, 2, 3, 4, 5])
  @ApiProperty({
    example: 5,
    description: 'Оценка',
  })
  rating: 1 | 2 | 3 | 4 | 5;
}
