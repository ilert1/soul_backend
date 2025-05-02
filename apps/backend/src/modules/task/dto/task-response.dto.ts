import { ApiProperty } from '@nestjs/swagger';
import { TaskList, TaskStatus, TaskType } from '@prisma/client';

export class TaskResponseDto {
  @ApiProperty({
    example: 'SUBSCRIBED_INSTAGRAM',
    description: 'Уникальный ключ задания',
    enum: TaskList,
  })
  key: TaskList;

  @ApiProperty({
    example: 'WEEKLY',
    description: 'Тип задания',
    enum: TaskType,
  })
  type: string;

  @ApiProperty({
    example: 'Подписаться на Instagram проекта',
    description: 'Название задания',
  })
  title: string;

  @ApiProperty({
    example:
      'В Instagram мы публикуем важные новости, репостим сториз со встреч, рассказываем о локальных сообществах из разных стран',
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
    example: 'VIEWED_HOW_IT_WORKS',
    description: 'Ключ задания',
  })
  taskKey: TaskList;

  @ApiProperty({ example: 1, description: 'Текущий прогресс выполнения' })
  progress: number;

  @ApiProperty({
    example: 'COMPLETED',
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
