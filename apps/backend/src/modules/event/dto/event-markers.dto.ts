import { ApiProperty } from '@nestjs/swagger';

export class ResponseEventMapMarkerDto {
  @ApiProperty({
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
    description: 'ID мероприятия',
  })
  id: string;

  @ApiProperty({
    example: {
      latitude: 55.751244,
      longitude: 37.618423,
    },
    description: 'Координаты места события',
  })
  place: { latitude: number; longitude: number } | null;
}
