import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlaceService } from './place.service';
import { ResponsePlaceDto } from './dto/response-place.dto';

@ApiBearerAuth()
@ApiTags('Place')
@Controller('place')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить место по ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Данные для поиска места по id',
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
  })
  @ApiResponse({
    status: 200,
    description: 'Место найдено',
    type: ResponsePlaceDto,
  })
  @ApiResponse({ status: 404, description: 'Место не найдено' })
  async getEventById(@Param('id') id: string): Promise<ResponsePlaceDto> {
    return await this.placeService.getPlaceById(id);
  }
}
