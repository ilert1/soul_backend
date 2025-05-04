import { EntryCondition } from '@prisma/client';
import { TelegramDataDto } from 'src/modules/auth/dto/telegram-data.dto';
import {
  CreateEventRequestDto,
  UpdateEventRequestDto,
} from 'src/modules/event/dto/create-event.dto';
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
const userIdCreate = generateTestUserId();
const userIdCreateNew = generateTestUserId();

export const telegramUserForCreating: TelegramDataDto = {
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: userIdCreate.toString(),
    },
  },
};

export const telegramUserForCreatingNew: TelegramDataDto = {
  ...telegramData,
  initDataUnsafe: {
    ...telegramData.initDataUnsafe,
    queryId: uuid(),
    user: {
      ...telegramData.initDataUnsafe.user,
      id: userIdCreateNew.toString(),
    },
  },
};

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

export const createEventDto: CreateEventRequestDto = {
  title: 'Концерт классической музыки',
  description: 'Уникальная возможность насладиться живым исполнением.',
  startDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  finishDate: new Date(
    new Date().setFullYear(new Date().getFullYear() + 1) + 3600000,
  ), // Увеличиваем timestamp на 1 час
  guestLimit: 10,
  entryCondition: EntryCondition.FREE,
  bonusDistributionType: 'ALL',
  place: {
    name: 'Концертный зал',
    description: 'Один из лучших залов',
    latitude: 55.751244,
    longitude: 37.618423,
    address: 'г. Москва, ул. Арбат, 10',
  },
};

export const updateEventDto: UpdateEventRequestDto = {
  title: 'Обновленный концерт классической музыки',
  description: 'Теперь с участием знаменитого дирижера',
  startDate: new Date(
    new Date().setFullYear(new Date().getFullYear() + 1) + 1600000,
  ),
  finishDate: new Date(
    new Date().setFullYear(new Date().getFullYear() + 1) + 3600000,
  ),
};
