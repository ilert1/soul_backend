import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CurrencyController } from './currency.controller';
import { CountryService } from './country.service';
import { CurrencyService } from './currency.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  controllers: [CountryController, CurrencyController],
  providers: [CountryService, CurrencyService, PrismaService],
})
export class StaticModule {}
