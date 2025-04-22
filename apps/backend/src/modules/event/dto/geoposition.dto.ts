import { IsNumber } from 'class-validator';

export class GeopositionDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
