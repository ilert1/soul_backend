import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/common/decorators/current-user.decorator';
import { TaskProgressService } from '../services/task-progress.service';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';
import { TaskList, TaskType } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('Task')
@Controller('task/progress')
export class TaskProgressController {
  constructor(private readonly taskService: TaskProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Получить прогресс пользователя по всем заданиям' })
  @ApiResponse({
    status: 200,
    description: 'Прогресс пользователя',
    isArray: true,
    type: UserTaskProgressResponseDto,
  })
  async getUserProgress(
    @User() user: UserPayload,
  ): Promise<UserTaskProgressResponseDto[]> {
    return this.taskService.getUserProgress(user.id);
  }

  @Get('/type/:taskType')
  @ApiOperation({
    summary: 'Получить прогресс пользователя по заданиям определенного типа',
  })
  @ApiParam({
    name: 'taskType',
    required: true,
    enum: TaskType,
    description: 'Тип задания',
  })
  @ApiResponse({
    status: 200,
    description: 'Прогресс пользователя по заданиям определенного типа',
    isArray: true,
    type: UserTaskProgressResponseDto,
  })
  async getUserTrainingTaskProgress(
    @User() user: UserPayload,
    @Param('taskType') taskType: TaskType,
  ): Promise<UserTaskProgressResponseDto[]> {
    return this.taskService.getUserTaskTypeProgress(user.id, taskType);
  }

  @Get('/:taskKey')
  @ApiOperation({ summary: 'Получить прогресс пользователя по заданию' })
  @ApiParam({
    name: 'taskKey',
    required: true,
    enum: TaskList,
    description: 'Ключ задания для получения прогресса',
  })
  @ApiResponse({
    status: 200,
    description: 'Прогресс пользователя',
    type: UserTaskProgressResponseDto,
  })
  async getUserProgressUniqueTask(
    @User() user: UserPayload,
    @Param('taskKey') taskKey: TaskList,
  ): Promise<UserTaskProgressResponseDto> {
    return this.taskService.getUserProgressUniqueTask(user.id, taskKey);
  }
}
