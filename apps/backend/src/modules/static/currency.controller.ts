import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/common/utils/constants';
import { PaginatedResponseCurrencyDto } from './dto/response-currency.dto';

@ApiBearerAuth()
@ApiTags('Сurrency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список буквенных кодов валют' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество транзакций на странице (по умолчанию 10)',
    schema: { type: 'integer', default: 10 },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы (по умолчанию 1)',
    schema: { type: 'integer', default: 1 },
  })
  @ApiOkResponse({
    description: 'Список буквенных кодов валют',
    type: PaginatedResponseCurrencyDto,
    example: {
      items: [
        {
          id: 1,
          code: 'USD',
        },
        {
          id: 2,
          code: 'EUR',
        },
      ],
      total: 2,
      page: 1,
      size: 10,
      pages: 1,
    },
  })
  async getCurrency(
    @Query('limit') limit: number = DEFAULT_PAGE_SIZE,
    @Query('page') page: number = 1,
  ) {
    const paginationDto: PaginationDto = { limit, page };

    return this.currencyService.getAllCurrency(paginationDto);
  }
}
