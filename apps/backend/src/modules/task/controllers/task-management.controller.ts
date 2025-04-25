import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TaskManagementService } from '../services/task-management.service';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';
import { TaskList } from '@prisma/client';
import { TaskExamples } from '../examples/task-examples';

@ApiBearerAuth()
@ApiTags('Task')
@Controller('task/manage')
export class TaskManagementController {
  constructor(private readonly taskService: TaskManagementService) {}

  @Post('confirm')
  @ApiOperation({ summary: 'ADMIN-API Подтвердить задание' })
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
      completedResponse: {
        value: TaskExamples.completedResponse,
        summary:
          'Пример данных для ответа на запрос подтверждения задания пользователя',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Задание не найдено' })
  confirmTask(
    @Body() body: { userId: string; taskKey: TaskList },
  ): Promise<UserTaskProgressResponseDto> {
    return this.taskService.confirmUserTask(body.userId, body.taskKey);
  }

  @Post('reset')
  @ApiOperation({ summary: 'ADMIN-API Сбросить задание' })
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
    description: 'Результат сброса',
    type: UserTaskProgressResponseDto,
    examples: {
      inProgressResponse: {
        value: TaskExamples.inProgressResponse,
        summary:
          'Пример данных для ответа на запрос сброса задания пользователя',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Задание не найдено' })
  resetTask(
    @Body() body: { userId: string; taskKey: TaskList },
  ): Promise<UserTaskProgressResponseDto> {
    return this.taskService.resetUserTask(body.userId, body.taskKey);
  }

  @Post('verify')
  @ApiOperation({ summary: 'ADMIN-API Проверить выполнение задания' })
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
    examples: {
      completedResponse: {
        value: TaskExamples.completedResponse,
        summary:
          'Пример данных для ответа на запрос проверки задания пользователя',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Задание не найдено' })
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
    examples: {
      collectedResponse: {
        value: TaskExamples.collectedResponse,
        summary:
          'Пример данных для ответа на запрос получения награды пользователя',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Задание не найдено' })
  collectReward(
    @User() user: UserPayload,
    @Body() body: { taskKey: TaskList },
  ): Promise<UserTaskProgressResponseDto> {
    return this.taskService.collectReward(user.id, body.taskKey);
  }
}
