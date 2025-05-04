import { TelegramDataDto } from 'src/modules/auth/dto/telegram-data.dto';
import { generateTestUserId } from 'test/utils';
import { v4 as uuid } from 'uuid';

const user = generateTestUserId();
const userNew = generateTestUserId();
const chatId = user + 1000000;

export const telegramUser: TelegramDataDto = {
  initData: 'mockedInitData',
  initDataUnsafe: {
    queryId: uuid(),
    user: {
      id: user.toString(),
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      isBot: false,
      languageCode: 'en',
      isPremium: false,
    },
    chat: {
      id: chatId,
      title: 'Mocked Chat',
      username: 'mockedchat',
      type: 'group',
    },
    signature: 'signature',
    authDate: new Date().toISOString(),
    hash: 'mockedHash',
  },
};

export const telegramUserNew: TelegramDataDto = {
  ...telegramUser,
  initDataUnsafe: {
    ...telegramUser.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramUser.initDataUnsafe.user,
      id: userNew.toString(),
    },
  },
};
