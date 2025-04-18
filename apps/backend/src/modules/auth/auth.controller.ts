import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from './decorators/public.decorator';
import { TelegramData } from './types/telegram-data';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import {
  AuthResponseExample,
  AuthResponseExampleNewUser,
  AuthResponseExampleWithEventInvite,
  AuthResponseExampleWithInvite,
  TelegramDataExample,
} from './dto/examples/telegram-data.example';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { TelegramDataDto } from './dto/telegram-data.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('telegram')
  @ApiOperation({ summary: 'Авторизация через Telegram' })
  @ApiBody({
    type: TelegramDataDto,
    examples: {
      example: {
        value: TelegramDataExample,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Авторизация через Telegram',
    type: AuthDto,
    examples: {
      newUserAuth: {
        summary: 'Новый пользователь зарегистрирован через Telegram',
        value: AuthResponseExampleNewUser,
      },
      successAuth: {
        summary: 'Пользователь успешно авторизован через Telegram',
        value: AuthResponseExample,
      },
      userAuthWithInvite: {
        summary: 'Новый пользователь зарегистрирован по реферальной ссылке',
        value: AuthResponseExampleWithInvite,
      },
      newUserAuthWithEventInvite: {
        summary:
          'Новый пользователь зарегистрирован через Telegram с приглашением на событие',
        value: AuthResponseExampleWithEventInvite,
      },
    },
  })
  async telegramLogin(@Body() telegramData: TelegramData) {
    return await this.authService.handleTelegramLogin(telegramData);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Refresh токен в формате: Bearer <refreshToken>',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOkResponse({
    description: 'Токены успешно обновлены',
    type: AuthDto,
    examples: {
      example: {
        value: AuthResponseExample,
        summary: 'Токены успешно обновлены',
      },
    },
  })
  async refresh(@User() user: UserPayload) {
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    return await this.authService.refreshToken(user.id);
  }
}
