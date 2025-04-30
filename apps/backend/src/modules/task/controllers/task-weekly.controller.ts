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

  @Post('check')
  @ApiOperation({ summary: 'Проверить недельное задание' })
  @ApiBody({
    description: 'Данные для подтверждения',
    examples: {
      example1: {
        summary: 'Id пользователя и ключ задания для подтверждения',
        value: {
          userId: 'e64c7d5e-e38a-461a-99e1-38eae06f75a0',
          taskKey: TaskList.SUBSCRIBED_INSTAGRAM,
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
  checkWeeklyTask(
    @Body() body: { userId: string; taskKey: TaskList },
  ): Promise<UserTaskProgressResponseDto> {
    return this.taskService.checkWeeklyTask(body.userId, body.taskKey);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'ADMIN-API Подтвердить недельное задание' })
  @ApiBody({
    description: 'Данные для подтверждения',
    examples: {
      example1: {
        summary: 'Id пользователя и ключ задания для подтверждения',
        value: {
          userId: 'e64c7d5e-e38a-461a-99e1-38eae06f75a0',
          taskKey: TaskList.SUBSCRIBED_INSTAGRAM,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Результат проверки',
    type: UserTaskProgressResponseDto,
    examples: {
      weeklyCompletedResponse: {
        value: TaskExamples.weeklyCompletedResponse,
        summary:
          'Пример данных для ответа на запрос проверки недельного задания',
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
