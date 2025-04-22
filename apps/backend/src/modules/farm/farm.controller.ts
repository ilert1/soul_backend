import { Controller, Get, HttpCode, Post, UsePipes } from '@nestjs/common';
import { FarmService } from './farm.service';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { User } from 'src/common/decorators/current-user.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FarmingStartExampleResponse } from './examples/farming-start.example';
import {
  FarmStatusExampleInProcess,
  FarmStatusExampleNotActive,
} from './examples/farm-status.example';

@Controller('farming')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post('start')
  @HttpCode(201)
  @ApiOperation({ summary: 'Начать фарминг токенов' })
  @ApiResponse({
    status: 201,
    description: 'Фарминг токенов начался успешно',
    schema: { example: FarmingStartExampleResponse },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные (например, фарминг уже активен)',
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  @UsePipes()
  async startFarming(@User() user: UserPayload) {
    return this.farmService.startFarming(user.id);
  }

  @Post('finish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Закончить фарминг токенов и получить награду' })
  @ApiResponse({
    status: 200,
    description: 'Фарминг успешно завершён, пользователь получил награду',
  })
  @ApiResponse({
    status: 400,
    description: 'Фарминг ещё не завершён или не был начат',
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  @UsePipes()
  async finishFarming(@User() user: UserPayload): Promise<void> {
    return this.farmService.finishFarming(user.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Получить статус фарминга' })
  @ApiResponse({
    status: 200,
    description: 'Текущий статус фарминга и оставшееся время',
    examples: {
      example: {
        summary: 'Фарминг в процессе',
        value: FarmStatusExampleInProcess,
      },
      example1: {
        summary: 'Фарминг не происходит',
        value: FarmStatusExampleNotActive,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  @UsePipes()
  async farmingStatus(@User() user: UserPayload) {
    return this.farmService.getFarmingStatus(user.id);
  }
}
