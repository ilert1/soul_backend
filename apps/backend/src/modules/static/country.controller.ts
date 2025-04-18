import { Controller, Get } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from '@prisma/client';
import {
  ApiOkResponse,
  ApiProperty,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

class CountryDto {
  @ApiProperty({ example: 2, description: 'Идентификатор страны' })
  id: number;

  @ApiProperty({ example: 'Japan', description: 'Название страны' })
  name: string;

  @ApiProperty({ example: 'JP', description: 'Код страны' })
  code: string;
}

@ApiBearerAuth()
@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех стран' })
  @ApiOkResponse({
    description: 'Список всех стран',
    type: [CountryDto],
  })
  async getCountries(): Promise<Country[]> {
    return await this.countryService.getAllCountries();
  }
}
