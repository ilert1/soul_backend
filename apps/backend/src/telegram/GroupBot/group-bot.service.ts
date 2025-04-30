import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Bot, InputFile } from 'grammy';
import { TelegramUserService } from 'src/modules/telegramUser/telegramUser.service';
// import { TranslationService } from './translation.service';
// import { LANGUAGE_CHANGE_COMMAND_ARRAY } from './consts';
import { TgUserLanguageService } from '../common/tg-user-language.service';
import { run } from '@grammyjs/runner';

@Injectable()
export class GroupBotService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot;
  private welcomeMessages = new Map<number, number>();

  constructor(
    private readonly telegramUserService: TelegramUserService,
    private readonly tgUserLanguageService: TgUserLanguageService,
  ) {}

  onModuleInit() {
    if (process.env.BOT_ACITVE === 'false') return;

    this.bot = new Bot(process.env.TELEGRAM_GROUP_BOT_TOKEN ?? '');

    this.registerHello();

    run(this.bot);
  }

  async onModuleDestroy() {
    if (process.env.BOT_ACITVE === 'false') return;

    await this.bot.stop();
  }

  private registerHello() {
    const navigationURL = process.env.FORUM_NAVIGATION_URL!;
    const instructionURL = process.env.INSTRUCTION_URL!;
    const detailsURL = process.env.DETAILS_URL!;

    this.bot.on(':new_chat_members', async (ctx) => {
      const chatId = ctx?.chat?.id;

      const lastMessageId = this.welcomeMessages.get(chatId);

      if (lastMessageId) {
        await ctx.api.deleteMessage(chatId, lastMessageId).catch(() => {});
      }

      const username = ctx.from?.username;

      // Знаю, нехорошая практика так оставлять ссылку на изображение. Но пока пусть будет так. На проде протестируем, может скачивание по URL будет лучше
      const welcome = await ctx.replyWithPhoto(
        new InputFile('../backend/assets/group-image-min.JPG'),
        {
          caption: `${username ? '<a href="https://t.me/${ctx.from?.username}">' + ctx.from?.first_name + '</a>' : ctx.from?.first_name}, добро пожаловать в семью путешественников, подходи ближе к нашему костру и чувствуй себя как дома 🔥 \n
Эта ветка форума - общий чат международного сообщества, участники которого разбросаны по всему миру, в закрепе можешь почитать <a href="${detailsURL}">детали</a>\n  
❗️ Навигация по всему форуму со ссылками на разные ветки по странам и интересам - <a href=${navigationURL}>тут</a>\n
❓ Инструкции по настройке и пользованию форумом - <a href=${instructionURL}>тут</a>`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '❗️ Навигация по форуму',
                  url: navigationURL,
                },
              ],
              [
                {
                  text: '❓ Инструкции',
                  url: instructionURL,
                },
              ],
            ],
          },
        },
      );
      this.welcomeMessages.set(chatId, welcome.message_id);
    });
  }
}
