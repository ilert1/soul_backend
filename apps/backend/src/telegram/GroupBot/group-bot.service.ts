import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ExperienceType } from '@prisma/client';
import { Bot, InputFile } from 'grammy';
import { ExperienceService } from 'src/modules/experience/experience.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AppLoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class GroupBotService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot;
  private welcomeMessages = new Map<number, number>();

  constructor(
    private prisma: PrismaService,
    private readonly experienceService: ExperienceService,
    private readonly loggerService: AppLoggerService,
  ) {}

  onModuleInit() {
    if (process.env.GROUP_BOT_ACTIVE === 'false') return;

    this.bot = new Bot(process.env.TELEGRAM_GROUP_BOT_TOKEN ?? '');

    this.registerHello();
    this.registerMessageHandlers();
    this.registerReactionHandlers();

    this.bot
      .start({
        allowed_updates: ['message', 'message_reaction'],
      })
      .catch((err) => {
        this.loggerService.error('Ошибка при запуске бота:', err);
      });
  }

  async onModuleDestroy() {
    if (process.env.GROUP_BOT_ACTIVE === 'false') return;

    await this.bot.stop();
  }

  private registerHello() {
    const navigationURL = process.env.FORUM_NAVIGATION_URL || '';
    const instructionURL = process.env.INSTRUCTION_URL || '';
    const detailsURL = process.env.DETAILS_URL || '';

    this.bot.on(':new_chat_members', async (ctx) => {
      const chatId = ctx?.chat?.id;

      const lastMessageId = this.welcomeMessages.get(chatId);

      if (lastMessageId) {
        await ctx.api.deleteMessage(chatId, lastMessageId).catch(() => {});
      }

      const username = ctx.from?.username;

      // Знаю, нехорошая практика так оставлять ссылку на изображение. Но пока пусть будет так. На проде протестируем, может скачивание по URL будет лучше
      const welcome = await ctx.replyWithPhoto(
        new InputFile('./assets/group-image-min.jpg'),
        {
          caption: `${username ? `<a href="https://t.me/${ctx.from?.username}">${ctx.from?.first_name}</a>` : ctx.from?.first_name}, добро пожаловать в семью путешественников, подходи ближе к нашему костру и чувствуй себя как дома 🔥 \n
Эта ветка форума - общий чат международного сообщества, участники которого разбросаны по всему миру, в закрепе можешь почитать <a href="${detailsURL}">детали</a>\n  
❗️ Навигация по всему форуму со ссылками на разные ветки по странам и интересам - <a href="${navigationURL}">тут</a>\n
❓ Инструкции по настройке и пользованию форумом - <a href="${instructionURL}">тут</a>`,
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

  private registerMessageHandlers() {
    this.bot.on('message', async (ctx) => {
      const telegramId = ctx.from?.id;
      const telegramIdStr = telegramId?.toString();

      let currentUserId: string | null = null;

      if (telegramIdStr) {
        const userExists = await this.prisma.telegramUser.findUnique({
          where: { telegramId: telegramIdStr },
          select: { userId: true },
        });

        currentUserId = userExists?.userId ?? null;
      }

      // Если это ответ на сообщение
      if (ctx.message.reply_to_message) {
        const originalMessageUserId = ctx.message.reply_to_message.from?.id;

        // Опыт для ответчика (если зарегистрирован) и только если это чужое сообщение
        if (currentUserId) {
          if (originalMessageUserId !== telegramId) {
            await this.experienceService.addExperience({
              userId: currentUserId,
              type: ExperienceType.REPLY,
            });
          } else {
            await this.experienceService.addExperience({
              userId: currentUserId,
              type: ExperienceType.MESSAGE,
            });
          }
        }

        // Опыт для автора оригинального сообщения (если он другой и зарегистрирован)
        if (originalMessageUserId && originalMessageUserId !== telegramId) {
          const originalUser = await this.prisma.telegramUser.findUnique({
            where: { telegramId: originalMessageUserId.toString() },
            select: { userId: true },
          });

          if (originalUser?.userId) {
            await this.experienceService.addExperience({
              userId: originalUser.userId,
              type: ExperienceType.RECEIVED_REPLY,
            });
          }
        }
      } else {
        // Обычное сообщение (только если отправитель зарегистрирован)
        if (currentUserId) {
          await this.experienceService.addExperience({
            userId: currentUserId,
            type: ExperienceType.MESSAGE,
          });
        }
      }

      if (currentUserId) {
        await this.prisma.messages.create({
          data: {
            messageId: ctx.message.message_id,
            chatId: ctx.chat.id,
            telegramUserId: telegramId,
          },
        });
      }
    });
  }

  private registerReactionHandlers() {
    this.bot.on('message_reaction', async (ctx) => {
      const reaction = ctx.update.message_reaction;
      const telegramId = reaction.user?.id;
      const messageId = reaction.message_id;

      if (!telegramId || !messageId) return;

      const telegramIdStr = telegramId.toString();

      // Параллельно получаем пользователя и сообщение
      const [user, message] = await Promise.all([
        this.prisma.telegramUser.findUnique({
          where: { telegramId: telegramIdStr },
          select: { userId: true },
        }),
        this.prisma.messages.findUnique({
          where: { messageId },
          select: { telegramUserId: true },
        }),
      ]);

      const userId = user?.userId;
      const originalTelegramUserId = message?.telegramUserId;

      // Если пользователь существует — начисляем опыт за реакцию если это чужое сообщение
      if (userId && message?.telegramUserId !== BigInt(telegramId)) {
        await this.experienceService.addExperience({
          userId,
          type: ExperienceType.REACTION,
        });
      }

      // Если автор сообщения найден и это не сам реактор — начисляем опыт автору
      if (
        originalTelegramUserId &&
        originalTelegramUserId !== BigInt(telegramId)
      ) {
        const originalUser = await this.prisma.telegramUser.findUnique({
          where: { telegramId: originalTelegramUserId.toString() },
          select: { userId: true },
        });

        if (originalUser?.userId) {
          await this.experienceService.addExperience({
            userId: originalUser.userId,
            type: ExperienceType.RECEIVED_REACTION,
          });
        }
      }
    });
  }
}
