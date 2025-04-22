import { ApiProperty } from '@nestjs/swagger';
import { TaskList, TaskStatus, TaskType } from '@prisma/client';

export class TaskResponseDto {
  @ApiProperty({
    example: 'PROFILE_COMPLETED',
    description: 'Уникальный ключ задания',
    enum: TaskList,
  })
  key: TaskList;

  @ApiProperty({
    example: 'SECTION_TRAINING',
    description: 'Тип задания',
    enum: TaskType,
  })
  type: string;

  @ApiProperty({
    example: 'Заполнить профиль',
    description: 'Название задания',
  })
  title: string;

  @ApiProperty({
    example: 'Заполните свой профиль для получения награды',
    description: 'Описание задания',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    example: 1,
    description: 'Требуемое количество для выполнения',
  })
  goal: number;

  @ApiProperty({ example: 100, description: 'Награда в SP' })
  rewardSp: number;
}

export class UserTaskProgressResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID записи прогресса',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID пользователя',
  })
  userId?: string;

  @ApiProperty({ example: 'PROFILE_COMPLETED', description: 'Ключ задания' })
  taskKey?: TaskList;

  @ApiProperty({ example: 1, description: 'Текущий прогресс выполнения' })
  progress: number;

  @ApiProperty({
    example: 'IN_PROGRESS',
    description: 'Статус выполнения',
    enum: TaskStatus,
  })
  status: string;

  @ApiProperty({
    example: '2025-07-01T00:00:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt?: Date;

  @ApiProperty({
    example: '2025-07-01T00:00:00.000Z',
    description: 'Дата завершения задания',
    required: false,
  })
  completedAt?: Date | null;
}

export class TaskProgressResponseDto {
  @ApiProperty({
    example: 'PROFILE_COMPLETED',
    description: 'Уникальный ключ задания',
  })
  taskKey: string;

  @ApiProperty({ example: 1, description: 'Текущий прогресс выполнения' })
  progress: number;

  @ApiProperty({
    example: 'IN_PROGRESS',
    description: 'Статус выполнения',
    enum: TaskStatus,
  })
  status: string;

  @ApiProperty({
    example: '2025-07-01T00:00:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt?: Date;

  @ApiProperty({
    example: '2025-07-01T00:00:00.000Z',
    description: 'Дата завершения задания',
    required: false,
  })
  completedAt?: Date | null;
}
