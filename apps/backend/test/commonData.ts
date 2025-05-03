import { TelegramDataDto } from 'src/modules/auth/dto/telegram-data.dto';
import { generateTestUserId } from 'test/utils';
import { v4 as uuid } from 'uuid';

const userId = generateTestUserId();
const chatId = userId + 1000000;

export const telegramData: TelegramDataDto = {
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
    signature: 'signature',
    authDate: new Date().toISOString(),
    hash: 'mockedHash',
  },
};

export const telegramDataNew: TelegramDataDto = {
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
    signature: 'signature',
    authDate: new Date().toISOString(),
    hash: 'mockedHash',
  },
};
