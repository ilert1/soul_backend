import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskCrudService } from '../services/task-crud.service';
import { TaskResponseDto } from '../dto/task-response.dto';

@ApiTags('Task')
@Controller('task')
export class TaskCrudController {
  constructor(private readonly taskService: TaskCrudService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех доступных заданий' })
  @ApiResponse({
    status: 200,
    description: 'Список заданий',
    type: TaskResponseDto,
  })
  getAllTasks(): Promise<TaskResponseDto[]> {
    return this.taskService.getAllTasks();
  }
}
