import { ApiProperty } from '@nestjs/swagger';

class ResponseCurrencyDto {
  @ApiProperty({ example: 2, description: 'Идентификатор валюты' })
  id: number;

  @ApiProperty({ example: 'EUR', description: 'Буквенный код валюты' })
  code: string;
}
export class PaginatedResponseCurrencyDto {
  @ApiProperty({
    type: [ResponseCurrencyDto],
    description: 'Список событий в текущей странице ответа',
  })
  items: ResponseCurrencyDto[];

  @ApiProperty({ description: 'Общее количество' })
  total: number;

  @ApiProperty({ description: 'Размер страницы' })
  size: number;

  @ApiProperty({ description: 'Текущая страница ответа' })
  page: number;

  @ApiProperty({ description: 'Количество страниц' })
  pages: number;
}
