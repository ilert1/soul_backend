import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Geoposition } from 'src/common/utils/geoposition';
import { Type } from 'class-transformer';
import { GeopositionDto } from './geoposition.dto';

export class ConfirmParticipationDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID события',
  })
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'hash активности',
  })
  activityHash: string;

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty({
    example: '{ latitude: 55.7558, longitude: 37.6173 }',
    description: 'гепозиция - широта и долгота',
    type: GeopositionDto,
  })
  @Type(() => GeopositionDto)
  geoposition: Geoposition;
}
