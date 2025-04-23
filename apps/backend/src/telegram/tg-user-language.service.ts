import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TgUserLanguageService {
  constructor(private readonly prisma: PrismaService) {}

  async setUserLanguage(userId: string, languageCode: string): Promise<void> {
    await this.prisma.telegramUser.update({
      where: { telegramId: userId },
      data: { languageCode },
    });
  }

  async getUserLanguage(userId: string): Promise<string> {
    const user = await this.prisma.telegramUser.findUnique({
      where: { telegramId: userId },
    });

    return user?.languageCode ?? 'en';
  }
}
