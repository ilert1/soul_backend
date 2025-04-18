import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExperienceService } from './experience.service';

@ApiTags('Experience')
@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить запись истории опыта по ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID записи истории опыта для удаления',
    example: 'a33e4beb-b15b-4e0b-b52c-6ac149fa413a',
  })
  @ApiResponse({
    status: 200,
    description: 'Запись истории опыта удалена',
  })
  @ApiResponse({
    status: 404,
    description: 'Запись истории начисления опыта не найдена',
  })
  async deleteExperienceById(@Param('id') id: string): Promise<void> {
    return await this.experienceService.deleteExperience(id);
  }
}
