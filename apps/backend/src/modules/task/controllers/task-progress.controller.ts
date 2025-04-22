import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators/current-user.decorator';
import { TaskProgressService } from '../services/task-progress.service';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { TaskProgressResponseDto } from '../dto/task-response.dto';

@ApiTags('Task')
@Controller('task/progress')
export class TaskProgressController {
  constructor(private readonly taskService: TaskProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Получить прогресс пользователя по заданиям' })
  @ApiResponse({
    status: 200,
    description: 'Прогресс пользователя',
    isArray: true,
    type: TaskProgressResponseDto,
  })
  async getUserProgress(
    @User() user: UserPayload,
  ): Promise<TaskProgressResponseDto[]> {
    return this.taskService.getUserProgress(user.id);
  }
}
