import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EntryCondition } from '@prisma/client';
import * as assert from 'assert';
import { TelegramData } from 'src/modules/auth/types/telegram-data';
import { CreateEventRequestDto } from 'src/modules/event/dto/create-event.dto';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AppModule } from '../../src/app.module';
import {
  generateTestUserId,
  isResponseUnvalid,
  isResponseValid,
} from '../utils';

describe('AuthController (e2e)', () => {
  let server: string;

  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let inviteHash: string;
  let inviteEventHash: string;

  const userId = generateTestUserId();
  const chatId = userId + 1000000;

  const inviteeUserId = generateTestUserId();
  const inviteeWithEventUserId = generateTestUserId();

  const telegramData: TelegramData = {
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

  const createEventDto: CreateEventRequestDto = {
    title: 'Концерт классической музыки',
    description:
      'Уникальная возможность насладиться живым исполнением классической музыки от местных артистов.',
    startDate: new Date('2026-03-23T15:30:00Z'), // '2026-03-23T15:30:00Z',
    finishDate: new Date('2026-03-23T16:30:00Z'), // '2026-03-23T16:30:00Z',
    guestLimit: 10,
    entryCondition: EntryCondition.FREE,
    bonusDistributionType: 'ALL',
    place: {
      name: 'Концертный зал Филармонии',
      description: 'Один из лучших залов для классической музыки в городе.',
      latitude: 55.751244,
      longitude: 37.618423,
      address: 'г. Москва, ул. Арбат, 10',
    },
  };

  before(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Включаем валидацию DTO
    await app.init();

    server = app.getHttpServer();
  });

  after(async () => {
    await app.close();
  });

  describe('POST /auth/telegram', () => {
    it('Регистрация - Aвторизация нового пользователя', async () => {
      const response = await request(server)
        .post('/auth/telegram')
        .send(telegramData)
        .expect(isResponseValid);

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      assert.ok(
        response.body.analyzeProfile,
        'analyzeProfile не вернулся, такой пользователь уже есть',
      );
      assert.ok(accessToken, 'accessToken не вернулся');
      assert.ok(refreshToken, 'refreshToken не вернулся');
    });

    it('Регистрация - Aвторизация нового пользователя - негативный сценарий', async () => {
      await request(server)
        .post('/auth/telegram')
        .send({
          ...telegramData,
          initDataUnsafe: {
            ...telegramData.initDataUnsafe,
            user: {
              ...telegramData.initDataUnsafe.user,
              id: null,
            },
          },
        })
        .expect(isResponseUnvalid);
    });

    it('Авторизация ранее зарегистрированного пользователя', async () => {
      const response = await request(server)
        .post('/auth/telegram')
        .send(telegramData)
        .expect(isResponseValid);

      assert.ok(
        !response.body.analyzeProfile,
        'analyzeProfile вернулся, пользователь уже зарегистрирован ранее',
      );

      refreshToken = response.body.refreshToken;

      assert.ok(response.body.accessToken, 'accessToken не вернулся');
      assert.ok(response.body.refreshToken, 'refreshToken не вернулся');
    });

    it('Регистрация - Авторизация нового пользователя c приглашением - реферальная ссылка', async () => {
      const inviteHasResponse = await request(server)
        .get('/invite/qr')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      inviteHash = inviteHasResponse.body.hash;

      assert.ok(inviteHash, 'hash приглашения не вернулся');

      const response = await request(server)
        .post('/auth/telegram')
        .send({
          ...telegramData,
          invitationHash: inviteHash,
          initDataUnsafe: {
            ...telegramData.initDataUnsafe,
            user: {
              ...telegramData.initDataUnsafe.user,
              id: inviteeUserId,
            },
          },
        })
        .expect(isResponseValid);

      assert.ok(
        response.body.analyzeProfile,
        'analyzeProfile не вернулся, такой пользователь уже есть',
      );
      assert.ok(response.body.action, 'action не вернулся');
      assert.ok(response.body.action.actionType, 'actionType не вернулся');
      assert.equal(
        response.body.action.actionType,
        'REDIRECT_TO_MAIN',
        'actionType должен быть REDIRECT_TO_MAIN',
      );
      assert.ok(response.body.accessToken, 'accessToken не вернулся');
      assert.ok(response.body.refreshToken, 'refreshToken не вернулся');
    });

    it('Повторная авторизация ранее зарегистрированного пользователя c передачей приглашения - реферальная ссылка', async () => {
      const response = await request(server)
        .post('/auth/telegram')
        .send({
          ...telegramData,
          invitationHash: inviteHash,
          initDataUnsafe: {
            ...telegramData.initDataUnsafe,
            user: {
              ...telegramData.initDataUnsafe.user,
              id: inviteeUserId,
            },
          },
        })
        .expect(isResponseValid);

      assert.ok(
        !response.body.analyzeProfile,
        'analyzeProfile вернулся, вместо входа в систему, произошла регистрация нового пользователя',
      );
      assert.ok(!response.body.action, 'action не должен возвращаться');
      assert.ok(response.body.accessToken, 'accessToken не вернулся');
      assert.ok(response.body.refreshToken, 'refreshToken не вернулся');
    });

    it('Регистрация - Авторизация нового пользователя c приглашением на Событие - реферальная ссылка', async () => {
      const createEventResponse = await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventDto)
        .expect(isResponseValid);

      assert.ok(createEventResponse.body.id, 'ошибка при создании события');

      const getInviteToEventResponse = await request(server)
        .get('/event/qr/' + createEventResponse.body.id)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(
        getInviteToEventResponse.body.hash,
        'hash приглашения на событие не вернулся',
      );

      inviteEventHash = getInviteToEventResponse.body.hash;

      const response = await request(server)
        .post('/auth/telegram')
        .send({
          ...telegramData,
          invitationHash: inviteEventHash,
          initDataUnsafe: {
            ...telegramData.initDataUnsafe,
            user: {
              ...telegramData.initDataUnsafe.user,
              id: inviteeWithEventUserId,
            },
          },
        })
        .expect(isResponseValid);

      assert.ok(
        response.body.analyzeProfile,
        'analyzeProfile не вернулся, такой пользователь уже есть',
      );
      assert.ok(response.body.action, 'action не вернулся');
      assert.ok(response.body.action.actionType, 'actionType не вернулся');
      assert.equal(
        response.body.action.actionType,
        'REDIRECT_TO_EVENT',
        'actionType должен быть REDIRECT_TO_EVENT',
      );
      assert.ok(response.body.accessToken, 'accessToken не вернулся');
      assert.ok(response.body.refreshToken, 'refreshToken не вернулся');
    });

    it('Повторная авторизация ранее зарегистрированного пользователя c приглашением на Событие - реферальная ссылка', async () => {
      const response = await request(server)
        .post('/auth/telegram')
        .send({
          ...telegramData,
          invitationHash: inviteEventHash,
          initDataUnsafe: {
            ...telegramData.initDataUnsafe,
            user: {
              ...telegramData.initDataUnsafe.user,
              id: inviteeWithEventUserId,
            },
          },
        })
        .expect(isResponseValid);

      assert.ok(
        !response.body.analyzeProfile,
        'analyzeProfile вернулся, вместо входа в систему, произошла регистрация нового пользователя',
      );

      assert.ok(response.body.action, 'action не вернулся');
      assert.ok(response.body.action.actionType, 'actionType не вернулся');
      assert.equal(
        response.body.action.actionType,
        'REDIRECT_TO_EVENT',
        'actionType должен быть REDIRECT_TO_EVENT',
      );
      assert.ok(response.body.accessToken, 'accessToken не вернулся');
      assert.ok(response.body.refreshToken, 'refreshToken не вернулся');
    });
  });

  describe('POST /auth/refresh', () => {
    it('Обновление токенов', async () => {
      const response = await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(isResponseValid);

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      assert.ok(accessToken, 'accessToken не вернулся');
      assert.ok(refreshToken, 'refreshToken не вернулся');
    });

    it('Обновление токенов - негативный сценарий', async () => {
      const response = await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      assert.ok(!accessToken, 'accessToken не должен возвращаться');
      assert.ok(!refreshToken, 'refreshToken не должен возвращаться');
    });
  });
});
