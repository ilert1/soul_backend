import { PartialType } from '@nestjs/mapped-types';
import { CreateTelegramUserDto } from './create-telegramUser.dto';

export class UpdateTelegramUserDto extends PartialType(CreateTelegramUserDto) {}
