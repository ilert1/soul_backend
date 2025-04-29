import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Bot, Context } from 'grammy';
import { TelegramUserService } from 'src/modules/telegramUser/telegramUser.service';
import { TranslationService } from './translation.service';
import { LANGUAGE_CHANGE_COMMAND_ARRAY } from './consts';
import { TgUserLanguageService } from './tg-user-language.service';
import { run } from '@grammyjs/runner';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot;
  private client: TelegramClient;
  private isConnected = false;
  private stringSession: StringSession;

  constructor(
    private readonly telegramUserService: TelegramUserService,
    private readonly translationService: TranslationService,
    private readonly tgUserLanguageService: TgUserLanguageService,
  ) {}

  async onModuleInit() {
    if (process.env.BOT_ACITVE === 'false') return;

    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN ?? '');
    this.registerBotMiddlewares();
    await this.setCommandsText('');

    run(this.bot);
  }

  async onModuleDestroy() {
    await this.disconnect();

    if (process.env.BOT_ACITVE === 'false') return;

    await this.bot.stop();
  }

  registerBotMiddlewares() {
    this.bot.command('start', async (ctx) => {
      await this.isNewUser(ctx);
      await this.sendWelcomeMessage(ctx);
    });

    this.bot.command('language', async (ctx) => {
      await ctx.reply('Choose your language:', {
        reply_markup: {
          inline_keyboard: LANGUAGE_CHANGE_COMMAND_ARRAY,
        },
      });
    });

    this.bot.on('callback_query', async (ctx) => {
      if (!ctx.callbackQuery?.data) return;

      const data = ctx.callbackQuery.data;

      if (data.startsWith('lang_')) {
        await this.handleLangCallback(ctx, data);
      }
    });
  }

  private async setCommandsText(userId: string) {
    const { helpCommandText, languageCommandText, startCommandText } =
      await this.translationService.getCommandsStrings(userId);

    await this.bot.api.setMyCommands([
      { command: 'start', description: startCommandText },
      // { command: 'help', description: helpCommandText },
      { command: 'language', description: languageCommandText },
    ]);
  }

  private async isNewUser(ctx: Context) {
    const userId = String(ctx.from?.id);

    const isOld = await this.telegramUserService.findOne(userId);

    if (isOld) {
      return;
    }

    try {
      await this.telegramUserService.create({
        telegramId: userId,
        fullName: ctx.from?.first_name + ' ' + ctx.from?.last_name,
        isBot: ctx.from?.is_bot,
        languageCode: ctx.from?.language_code,
        username: ctx.from?.username,
      });
      await this.setCommandsText(userId);

      return;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private async sendWelcomeMessage(ctx: Context) {
    const userId = String(ctx.from?.id);

    const welcomeMessage =
      await this.translationService.getWelcomeMessage(userId);

    const { goToForum, openApp } =
      await this.translationService.getInlineButtonsText(userId);

    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: openApp,
              url: process.env.WEB_APP_URL ?? '',
            },
          ],
          [
            {
              text: goToForum,
              url: process.env.FORUM_URL ?? '',
            },
          ],
        ],
      },
    });
  }

  public async handleLangCallback(ctx: Context, data: string) {
    const userId = String(ctx.callbackQuery?.from.id);

    const language = data.substring(5);
    await this.tgUserLanguageService.setUserLanguage(userId, language);

    await this.setCommandsText(userId);

    const thankYouText = await this.translationService.translate(
      userId,
      'bot.language_changed',
    );

    await ctx.answerCallbackQuery(thankYouText);
    await ctx.editMessageText(thankYouText);
    await this.sendWelcomeMessage(ctx);
  }

  private async initializeClient() {
    const apiId = parseInt(process.env.TELEGRAM_API_ID as string);
    const apiHash = process.env.TELEGRAM_API_HASH;
    const sessionString = process.env.TELEGRAM_SESSION_STRING;

    if (!apiId || !apiHash || !sessionString) {
      throw new Error('Недостаточно данных для инициализации Telegram клиента');
    }

    this.stringSession = new StringSession(sessionString);

    this.client = new TelegramClient(this.stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });

    try {
      await this.connectExistingSession();
    } catch {
      this.isConnected = false;
    }
  }

  private async connectExistingSession() {
    await this.client.connect();
    this.isConnected = true;
  }

  async disconnect() {
    if (this.isConnected && this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async getTgUserAbout(telegramId: string): Promise<string> {
    if (!this.client) {
      await this.initializeClient();
    }

    if (!this.isConnected) {
      await this.client.connect();
    }

    try {
      const result = await this.client.invoke(
        new Api.users.GetFullUser({
          id: telegramId,
        }),
      );

      return result.fullUser.about || '';
    } catch {
      return '';
    }
  }
}
