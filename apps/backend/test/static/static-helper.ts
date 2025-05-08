import { TelegramDataDto } from 'src/modules/auth/dto/telegram-data.dto';
import { telegramData } from 'test/auth/auth-helper';
import { generateTestUserId } from 'test/utils';
import { v4 as uuid } from 'uuid';

const user = generateTestUserId();

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
