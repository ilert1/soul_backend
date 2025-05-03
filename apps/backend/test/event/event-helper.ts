import { TelegramDataDto } from 'src/modules/auth/dto/telegram-data.dto';
import { generateTestUserId } from 'test/utils';
import { v4 as uuid } from 'uuid';

const user = generateTestUserId();
const userNew = generateTestUserId();
const userId = generateTestUserId();
const userIdNew = generateTestUserId();
const userIdQr = generateTestUserId();
const userIdQrNew = generateTestUserId();
const userIdSearch = generateTestUserId();
const userIdSearchNew = generateTestUserId();
const chatId = userId + 1000000;

export const telegramUserForParticipation: TelegramDataDto = {
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

export const telegramUserForParticipationNew: TelegramDataDto = {
  initData: 'mockedInitData',
  initDataUnsafe: {
    queryId: uuid(),
    user: {
      id: userIdNew.toString(),
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

export const telegramUserForQR: TelegramDataDto = {
  ...telegramUserForParticipation,
  initDataUnsafe: {
    ...telegramUserForParticipation.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramUserForParticipation.initDataUnsafe.user,
      id: userIdQr.toString(),
    },
  },
};

export const telegramUserForQRNew: TelegramDataDto = {
  ...telegramUserForParticipation,
  initDataUnsafe: {
    ...telegramUserForParticipation.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramUserForParticipation.initDataUnsafe.user,
      id: userIdQrNew.toString(),
    },
  },
};

export const telegramUserForSearch: TelegramDataDto = {
  ...telegramUserForParticipation,
  initDataUnsafe: {
    ...telegramUserForParticipation.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramUserForParticipation.initDataUnsafe.user,
      id: userIdSearch.toString(),
    },
  },
};

export const telegramUserForSerchNew: TelegramDataDto = {
  ...telegramUserForParticipation,
  initDataUnsafe: {
    ...telegramUserForParticipation.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramUserForParticipation.initDataUnsafe.user,
      id: userIdSearchNew.toString(),
    },
  },
};

export const telegramUser: TelegramDataDto = {
  ...telegramUserForParticipation,
  initDataUnsafe: {
    ...telegramUserForParticipation.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramUserForParticipation.initDataUnsafe.user,
      id: user.toString(),
    },
  },
};

export const telegramUserNew: TelegramDataDto = {
  ...telegramUserForParticipation,
  initDataUnsafe: {
    ...telegramUserForParticipation.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramUserForParticipation.initDataUnsafe.user,
      id: userNew.toString(),
    },
  },
};
