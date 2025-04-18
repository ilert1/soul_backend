import { Injectable } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/utils/pagination.utils';

@Injectable()
export class CurrencyService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCurrency(paginationDto: PaginationDto) {
    return await paginate<Currency[]>({
      prisma: this.prisma,
      model: 'currency',
      paginationDto,
    });
  }
}
