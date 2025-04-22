import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators/current-user.decorator';
import { TaskCheckinService } from '../services/task-checkin.service';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { UserTaskProgressResponseDto } from '../dto/task-response.dto';

@ApiTags('Task')
@Controller('task/checkin')
export class TaskCheckinController {
  constructor(private readonly taskService: TaskCheckinService) {}

  @Post()
  @ApiOperation({ summary: 'Выполнить ежедневный чекин' })
  @ApiResponse({
    status: 201,
    description: 'Чекин выполнен успешно',
    type: UserTaskProgressResponseDto,
  })
  userCheckIn(@User() user: UserPayload): Promise<UserTaskProgressResponseDto> {
    return this.taskService.userCheckIn(user.id);
  }
}
