import { TelegramData } from 'src/modules/auth/types/telegram-data';
import { generateTestUserId } from 'test/utils';
import { v4 as uuid } from 'uuid';

const userId = generateTestUserId();
const chatId = userId + 1000000;

export const telegramData: TelegramData = {
  initData: 'mockedInitData',
  initDataUnsafe: {
    queryId: uuid(),
    user: {
      id: userId.toString(),
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
    authDate: Math.floor(Date.now() / 1000),
    hash: 'mockedHash',
  },
};
