import { Injectable } from '@nestjs/common';
import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';
import { DEFAULT_AVATAR } from './default.avatar';
import { AppLoggerService } from '../logger/logger.service';

@Injectable()
export class AvatarService {
  constructor(private loggerService: AppLoggerService) {}

  /**
   * Генерация аватара в стиле Identicon.
   * @param seed - Строка-семя для генерации аватара (например, имя пользователя или email).
   * @returns SVG-строка аватара.
   */
  generateAvatar(seed: string) {
    if (!seed) {
      throw new Error('Seed не указан');
    }

    try {
      // Попытка создать аватар
      const avatar = createAvatar(identicon, {
        seed, // seed для генерации аватара
      });
      const base64_avatar = Buffer.from(avatar.toString()).toString('base64');

      return base64_avatar;
    } catch (error) {
      this.loggerService.error('Ошибка при создании аватара:', error.message);

      return DEFAULT_AVATAR;
    }
  }
}
