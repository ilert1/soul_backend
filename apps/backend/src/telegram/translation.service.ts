import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TgUserLanguageService } from './tg-user-language.service';

@Injectable()
export class TranslationService {
  constructor(
    private readonly i18n: I18nService,
    private readonly userLanguageService: TgUserLanguageService,
  ) {}

  async translate(
    userId: string,
    key: string,
    args?: Record<string, any>,
  ): Promise<string> {
    const language = await this.userLanguageService.getUserLanguage(userId);

    return this.i18n.translate(key, { lang: language, args });
  }

  async getWelcomeMessage(userId: string): Promise<string> {
    const language = await this.userLanguageService.getUserLanguage(userId);
    const welcome = this.i18n.translate('bot.welcome', { lang: language });

    const letsBuildTogether = this.i18n.translate('bot.letsBuildTogether', {
      lang: language,
    });

    const findNewFrineds = this.i18n.translate('bot.findNewFrineds', {
      lang: language,
    });

    const gainSoul = this.i18n.translate('bot.gainSoul', { lang: language });

    const forumAndCommunity = this.i18n.translate('bot.forumAndCommunity', {
      lang: language,
    });

    const combinedMessage = [
      welcome,
      letsBuildTogether,
      findNewFrineds,
      gainSoul,
      forumAndCommunity,
    ].join('\n');

    return combinedMessage;
  }

  async getInlineButtonsText(
    userId: string,
  ): Promise<{ openApp: string; goToForum: string }> {
    const language = await this.userLanguageService.getUserLanguage(userId);

    const openApp = this.i18n.translate('bot.openApp', { lang: language });
    const goToForum = this.i18n.translate('bot.goToForum', { lang: language });

    return { openApp, goToForum };
  }

  async getCommandsStrings(userId: string): Promise<{
    startCommandText: string;
    helpCommandText: string;
    languageCommandText: string;
  }> {
    const language = await this.userLanguageService.getUserLanguage(userId);

    const startCommandText = this.i18n.translate('bot.startCommandText', {
      lang: language,
    });
    const helpCommandText = this.i18n.translate('bot.helpCommandText', {
      lang: language,
    });
    const languageCommandText = this.i18n.translate('bot.languageCommandText', {
      lang: language,
    });

    return { startCommandText, helpCommandText, languageCommandText };
  }
}
