import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TaskCrudService } from '../services/task-crud.service';
import { TaskResponseDto } from '../dto/task-response.dto';
import { TaskType } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('Task')
@Controller('task')
export class TaskCrudController {
  constructor(private readonly taskService: TaskCrudService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех доступных заданий' })
  @ApiResponse({
    status: 200,
    description: 'Список заданий',
    isArray: true,
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Задания не найдены' })
  async getAllTasks(): Promise<TaskResponseDto[]> {
    return this.taskService.getAllTasks();
  }

  @Get('/:taskType')
  @ApiOperation({ summary: 'Получить задания по типу' })
  @ApiParam({
    name: 'taskType',
    required: true,
    enum: TaskType,
    description: 'Тип задания',
  })
  @ApiResponse({
    status: 200,
    description: 'Список заданий',
    isArray: true,
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Задания не найдены' })
  async getTrainingTasks(
    @Param('taskType') taskType: TaskType,
  ): Promise<TaskResponseDto[]> {
    return this.taskService.getAllTasks(taskType);
  }
}
