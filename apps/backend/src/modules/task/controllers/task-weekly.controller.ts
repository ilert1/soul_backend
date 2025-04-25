import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';
import { TaskList } from '@prisma/client';
import { TaskWeeklyService } from '../services/task-weekly.service';
import { TaskExamples } from '../examples/task-examples';

@ApiBearerAuth()
@ApiTags('Task')
@Controller('task/weekly')
export class TaskWeeklyController {
  constructor(private readonly taskService: TaskWeeklyService) {}

  @Post('confirm')
  @ApiOperation({ summary: 'Подтвердить недельное задание' })
  @ApiBody({
    description: 'Данные для подтверждения',
    examples: {
      example1: {
        summary: 'Id пользователя и ключ задания для подтверждения',
        value: {
          userId: 'e64c7d5e-e38a-461a-99e1-38eae06f75a0',
          taskKey: TaskList.VIEWED_HOW_IT_WORKS,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Результат подтверждения',
    type: UserTaskProgressResponseDto,
    examples: {
      weeklyCompletedResponse: {
        value: TaskExamples.weeklyCompletedResponse,
        summary:
          'Пример данных для ответа на запрос подтверждения недельного задания',
      },
    },
  })
  confirmWeeklyUserTask(
    @Body() body: { userId: string; taskKey: TaskList },
  ): Promise<UserTaskProgressResponseDto> {
    return this.taskService.confirmWeeklyUserTask(body.userId, body.taskKey);
  }

  @Post('reset')
  @ApiOperation({ summary: 'ADMIN-API Сбросить все недельные задания' })
  @ApiResponse({
    status: 200,
    description: 'Задания сброшены',
  })
  @ApiResponse({
    status: 400,
    description: 'Задания не сброшены',
  })
  async resetAllWeeklyTask(): Promise<void> {
    return this.taskService.resetAllWeeklyTask();
  }
}
