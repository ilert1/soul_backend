import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskManagementService } from '../services/task-management.service';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';
import { TaskList } from '@prisma/client';

@ApiTags('Task')
@Controller('task/manage')
export class TaskManagementController {
  constructor(private readonly taskService: TaskManagementService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Проверить выполнение задания' })
  @ApiBody({
    description: 'Данные для проверки',
    examples: {
      example1: {
        summary: 'Ключ задания для проверки (test-временно)',
        value: {
          taskKey: 'PROFILE_COMPLETED',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Результат проверки',
    type: UserTaskProgressResponseDto,
  })
  verifyTask(
    @User() user: UserPayload,
    @Body() body: { taskKey: TaskList },
  ): Promise<UserTaskProgressResponseDto> {
    return this.taskService.verifyTaskCompletion(user.id, body.taskKey);
  }

  @Post('collect')
  @ApiOperation({ summary: 'Получить награду за задание' })
  @ApiBody({
    description: 'Данные для проверки',
    examples: {
      example1: {
        summary: 'Ключ задания для получения награды',
        value: {
          taskKey: 'PROFILE_COMPLETED',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Награда получена',
    type: UserTaskProgressResponseDto,
  })
  collectReward(
    @User() user: UserPayload,
    @Body() body: { taskKey: TaskList },
  ): Promise<UserTaskProgressResponseDto> {
    return this.taskService.collectReward(user.id, body.taskKey);
  }
}
