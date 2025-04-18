import { ApiProperty } from '@nestjs/swagger';

export class ResponseRating {
  @ApiProperty({
    description: 'Количество поставленных единиц',
  })
  votesForOne: number;

  @ApiProperty({
    description: 'Количество поставленных двоек',
  })
  votesForTwo: number;

  @ApiProperty({
    description: 'Количество  поставленных троек',
  })
  votesForThree: number;

  @ApiProperty({
    description: 'Количество поставленных четверок',
  })
  votesForFour: number;

  @ApiProperty({
    description: 'Количество поставленных пятерок',
  })
  votesForFive: number;
}

export class EventsRatingtResponseDto {
  @ApiProperty({
    description: 'Показатели рейтинга',
    example: {
      votesForOne: 3,
      votesForTwo: 5,
      votesForThree: 12,
      votesForFour: 8,
      votesForFive: 20,
    },
  })
  ratingDetails: ResponseRating | null;

  @ApiProperty({
    example: 4.2,
    description:
      'Вычисленный рейтинг с точностью до одного знака после запятой',
    nullable: true,
  })
  averageRating: number | null;
}
