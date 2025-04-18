import { Injectable } from '@nestjs/common';
import { Country } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCountries(): Promise<Country[]> {
    try {
      const countries = await this.prisma.country.findMany();

      return countries;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching countries:', error.message);
      } else {
        console.error('Unexpected error fetching countries:', error);
      }

      return [];
    }
  }
}
