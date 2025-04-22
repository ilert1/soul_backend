import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
} from '@nestjs/common';
import { TelegramUserService } from './telegramUser.service';
import { CreateTelegramUserDto } from './dto/create-telegramUser.dto';
import { UpdateTelegramUserDto } from './dto/update-telegramUser.dto';
import { Public } from '../auth/decorators/public.decorator';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateTelegramUserExample,
  TelegramUserResponseExample,
  UpdateTelegramUserExample,
} from './dto/examples/telegramUser.example';

@ApiTags('Telegram User')
@Controller('telegram-user')
export class TelegramUserController {
  // constructor(private readonly telegramUserService: TelegramUserService) {}
  // @Public()
  // @Post()
  // @ApiOperation({ summary: 'Создать нового Telegram пользователя' })
  // @ApiBody({
  //   description: 'Данные для создания Telegram пользователя',
  //   examples: {
  //     example: {
  //       value: CreateTelegramUserExample,
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Telegram пользователь успешно создан',
  //   schema: {
  //     example: TelegramUserResponseExample,
  //   },
  // })
  // @ApiResponse({ status: 400, description: 'Некорректные данные' })
  // @UsePipes()
  // async create(@Body() createTelegramUserDto: CreateTelegramUserDto) {
  //   return await this.telegramUserService.create(createTelegramUserDto);
  // }
  // @Get(':telegramId')
  // @ApiOperation({ summary: 'Получить Telegram пользователя по ID' })
  // @ApiParam({
  //   name: 'telegramId',
  //   description: 'ID Telegram пользователя',
  //   example: '123456789',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Telegram пользователь успешно найден',
  //   schema: {
  //     example: TelegramUserResponseExample,
  //   },
  // })
  // @ApiResponse({ status: 404, description: 'Telegram пользователь не найден' })
  // async findOne(@Param('telegramId') telegramId: string) {
  //   return await this.telegramUserService.findOne(telegramId);
  // }
  // @Patch(':telegramId')
  // @ApiOperation({ summary: 'Обновить данные Telegram пользователя' })
  // @ApiParam({
  //   name: 'telegramId',
  //   description: 'ID Telegram пользователя',
  //   example: '123456789',
  // })
  // @ApiBody({
  //   description: 'Данные для обновления Telegram пользователя',
  //   examples: {
  //     example: {
  //       value: UpdateTelegramUserExample,
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Данные Telegram пользователя успешно обновлены',
  //   schema: {
  //     example: TelegramUserResponseExample,
  //   },
  // })
  // @ApiResponse({ status: 404, description: 'Telegram пользователь не найден' })
  // async update(
  //   @Param('telegramId') telegramId: string,
  //   @Body() updateTelegramUserDto: UpdateTelegramUserDto,
  // ) {
  //   return await this.telegramUserService.update(
  //     telegramId,
  //     updateTelegramUserDto,
  //   );
  // }
}
