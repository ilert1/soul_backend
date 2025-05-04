import { TelegramDataDto } from 'src/modules/auth/dto/telegram-data.dto';
import { telegramData } from 'test/auth/auth-helper';
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
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: userId.toString(),
    },
  },
};

export const telegramUserForParticipationNew: TelegramDataDto = {
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: userIdNew.toString(),
    },
  },
};

export const telegramUserForQR: TelegramDataDto = {
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: userIdQr.toString(),
    },
  },
};

export const telegramUserForQRNew: TelegramDataDto = {
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: userIdQrNew.toString(),
    },
  },
};

export const telegramUserForSearch: TelegramDataDto = {
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: userIdSearch.toString(),
    },
  },
};

export const telegramUserForSerchNew: TelegramDataDto = {
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: userIdSearchNew.toString(),
    },
  },
};

export const telegramUser: TelegramDataDto = {
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: user.toString(),
    },
  },
};

export const telegramUserNew: TelegramDataDto = {
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: userNew.toString(),
    },
  },
};
