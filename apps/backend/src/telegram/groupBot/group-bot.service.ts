import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ExperienceType } from '@prisma/client';
import { Bot, InputFile } from 'grammy';
import { ExperienceService } from 'src/modules/experience/experience.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { UserExperienceBufferDto } from 'src/modules/experience/dto/experience.dto';
import { GratitudeDetectorService } from './gratitude/gratitude-detector.service';
import { forumRewardCollectInterval } from 'src/modules/experience/dto/constants';
import { xpTypeLimit } from './consts';

type DataBuffer = {
  [userId: string]: {
    xp: { [key in ExperienceType]?: number };
    sp: number;
  };
};

@Injectable()
export class GroupBotService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot;
  private welcomeMessages = new Map<number, number>();
  private readonly groupId = process.env.TELEGRAM_GROUP_ID ?? '';
  private readonly botToken = process.env.TELEGRAM_GROUP_BOT_TOKEN ?? '';

  private dataBuffer: DataBuffer = {};

  constructor(
    private prisma: PrismaService,
    private readonly experienceService: ExperienceService,
    private readonly loggerService: AppLoggerService,
    private detector: GratitudeDetectorService,
  ) {}

  onModuleInit() {
    if (process.env.GROUP_BOT_ACTIVE === 'false') return;

    if (!this.groupId || !this.botToken) {
      this.loggerService.error(
        'TELEGRAM_GROUP_BOT_TOKEN or TELEGRAM_GROUP_ID is not defined',
      );

      return;
    }

    this.bot = new Bot(this.botToken);

    this.registerHello();
    this.registerMessageHandlers();
    this.registerReactionHandlers();

    this.bot
      .start({
        allowed_updates: ['message', 'message_reaction'],
      })
      .catch((error) => {
        this.loggerService.error('Ошибка при запуске бота:', error);
      });

    setInterval(() => {
      this.flushDataBuffer().catch((error) => {
        this.loggerService.error('Ошибка при отправке xp или sp:', error);
      });
    }, forumRewardCollectInterval);
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

  async userIsChatMember(telegramUserId: number): Promise<boolean> {
    try {
      const result = await this.bot.api.getChatMember(
        this.groupId,
        telegramUserId,
      );

      return !!result;
    } catch {
      return false;
    }
  }

  async userIsBoosted(telegramUserId: number): Promise<boolean> {
    try {
      const result = await this.bot.api.getUserChatBoosts(
        this.groupId,
        telegramUserId,
      );

      return result.boosts.length > 0;
    } catch {
      return false;
    }
  }

  private registerMessageHandlers() {
    this.bot.on('message', async (ctx) => {
      const telegramId = ctx.from?.id;
      const telegramIdStr = telegramId?.toString();
      const messageText = ctx.message.text;

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
            this.addXPToDataBuffer(currentUserId, ExperienceType.REPLY);
          } else {
            this.addXPToDataBuffer(currentUserId, ExperienceType.MESSAGE);
          }
        }

        // Опыт для автора оригинального сообщения (если он другой и зарегистрирован)
        if (originalMessageUserId && originalMessageUserId !== telegramId) {
          const originalUser = await this.prisma.telegramUser.findUnique({
            where: { telegramId: originalMessageUserId.toString() },
            select: { userId: true },
          });

          if (originalUser?.userId) {
            // Проверка на благодарность
            let isGratitude = false;

            if (messageText) {
              isGratitude = await this.detector.isGratitude(messageText);
            }

            this.addXPToDataBuffer(
              originalUser.userId,
              ExperienceType.RECEIVED_REPLY,
              isGratitude ? 1 : undefined,
            );
          }
        }
      } else {
        // Обычное сообщение (только если отправитель зарегистрирован)
        if (currentUserId) {
          this.addXPToDataBuffer(currentUserId, ExperienceType.MESSAGE);
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

      // Вычисляем добавленные или удаленные реакции
      const isAddedReaction = !!(
        reaction.new_reaction.length > reaction.old_reaction.length
      );

      // Если пользователь существует — начисляем опыт за реакцию если это чужое сообщение
      if (userId && message?.telegramUserId !== BigInt(telegramId)) {
        if (isAddedReaction) {
          // Eсли реакция добавлена
          this.addXPToDataBuffer(userId, ExperienceType.REACTION);
        } else {
          // Если реакция удалена
          this.removeXPFromDataBuffer(userId, ExperienceType.REACTION);
        }
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
          if (isAddedReaction) {
            // Eсли реакция добавлена
            this.addXPToDataBuffer(
              originalUser.userId,
              ExperienceType.RECEIVED_REACTION,
              1,
            );
          } else {
            // Если реакция удалена
            this.removeXPFromDataBuffer(
              originalUser.userId,
              ExperienceType.RECEIVED_REACTION,
              1,
            );
          }
        }
      }
    });
  }

  private addXPToDataBuffer(
    userId: string,
    type: ExperienceType,
    amount?: number,
  ) {
    if (!this.dataBuffer[userId]) {
      this.dataBuffer[userId] = { xp: {}, sp: 0 };
    }

    const xpMap = this.dataBuffer[userId].xp;

    // Получаем текущее количество этого типа опыта
    const currentCount = xpMap[type] ?? 0;

    // Добавляем только если количество меньше xpTypeLimit
    if (currentCount < xpTypeLimit) {
      xpMap[type] = currentCount + 1;
    }

    if (amount) {
      this.dataBuffer[userId].sp += amount;
    }
  }

  private removeXPFromDataBuffer(
    userId: string,
    type: ExperienceType,
    amount?: number,
  ) {
    const buffer = this.dataBuffer[userId];

    if (!buffer) return;

    const xpMap = buffer.xp;

    if (xpMap[type]) {
      xpMap[type] -= 1;

      // Если стало 0 — удаляем ключ
      if (xpMap[type] === 0) {
        delete xpMap[type];
      }
    }

    if (amount) {
      this.dataBuffer[userId].sp -= amount;
    }

    // Если и xp и sp пустые — удаляем всю запись
    if (Object.keys(xpMap).length === 0 && buffer.sp === 0) {
      delete this.dataBuffer[userId];
    }
  }

  private async flushDataBuffer() {
    if (Object.keys(this.dataBuffer).length === 0) return;

    const bufferCopy = { ...this.dataBuffer };
    this.dataBuffer = {};

    for (const [userId, data] of Object.entries(bufferCopy)) {
      const userExperience: UserExperienceBufferDto = {
        userId,
        xp: data.xp,
      };

      await this.experienceService.processUserExperienceBuffer(userExperience);

      if (data.sp > 0) {
        await this.prisma.telegramUser.update({
          where: { userId },
          data: {
            forumReward: { increment: data.sp },
          },
        });
      }
    }
  }
}
