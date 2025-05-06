import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as assert from 'assert';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import {
  generateTestUserId,
  isResponseUnvalid,
  isResponseValid,
} from '../utils';
import { telegramData } from 'test/auth/auth-helper';

describe('InviteController (e2e)', () => {
  let server: string;

  let app: INestApplication;
  let accessToken: string;
  let invitationHash: string;

  const telegramDataWithUniqueId = () => {
    return {
      ...telegramData,
      initDataUnsafe: {
        ...telegramData.initDataUnsafe,
        user: {
          ...telegramData.initDataUnsafe.user,
          id: generateTestUserId(),
        },
      },
    };
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

  // GET / invite / qr;
  // GET / invite;
  // POST / invite / purchase;

  describe('GET /invite/qr', () => {
    it('Получение реферальной ссылки', async () => {
      const authResponse = await request(server)
        .post('/auth/telegram')
        .send(telegramDataWithUniqueId())
        .expect(isResponseValid);

      accessToken = authResponse.body.accessToken;

      const response = await request(server)
        .get('/invite/qr')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      invitationHash = response.body.hash;

      assert.ok(invitationHash, 'hash не вернулся');
    });

    it('Получение реферальной ссылки - негативный сценарий', async () => {
      const response = await request(server)
        .get('/invite/qr')
        .set('Authorization', `Bearer`)
        .expect(isResponseUnvalid);

      assert.ok(!response.body.hash, 'hash не должен возвращаться');
    });
  });

  describe('GET /invite', () => {
    it('Получение списка приглашенных друзей', async () => {
      await request(server)
        .post('/auth/telegram')
        .send({ ...telegramDataWithUniqueId(), invitationHash })
        .expect(isResponseValid);

      const response = await request(server)
        .get('/invite')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(response.body.items, 'список инвайтов не вернулся');
      assert.ok(response.body.items.length > 0, 'список инвайтов пустой');
    });

    it('Увеличение списка приглашенных друзей до 3', async () => {
      const authNewUserWithInviteRequest = async () =>
        await request(server)
          .post('/auth/telegram')
          .send({ ...telegramDataWithUniqueId(), invitationHash })
          .expect(isResponseValid);

      // регистрация новых пользователей по инвайту
      await authNewUserWithInviteRequest();
      await authNewUserWithInviteRequest();

      const response = await request(server)
        .get('/invite')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(response.body.items, 'список приглашенных друзей не вернулся');
      assert.ok(
        response.body.items.length === 3,
        'список приглашенных друзей должен содержать 3 элемента',
      );
    });

    it('Регистрация нового пользователя по приглашению - отсутсвие доступных инвайтов - негативный сценарий', async () => {
      await request(server)
        .post('/auth/telegram')
        .send({ ...telegramDataWithUniqueId(), invitationHash })
        .expect(isResponseUnvalid);

      const response = await request(server)
        .get('/invite')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(response.body.items, 'список приглашенных друзей не вернулся');
      assert.ok(
        response.body.items.length === 3,
        'список приглашенных друзей должен содержать 3 элемента',
      );
    });
  });

  describe('POST /invite/purchase', () => {
    it('Покупка инвайтов - увеличение лимита до 6', async () => {
      const purchaseInviteRequest = async () =>
        await request(server)
          .post('/invite/purchase')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(isResponseValid);

      const response = await purchaseInviteRequest();

      assert.ok(
        response.body.availableInvites,
        'не вернулось количество доступных инвайтов',
      );
      assert.ok(
        response.body.totalInvites,
        'не вернулось общее количество инвайтов',
      );
      assert.ok(response.body.totalInvites === 6, 'лимит инвайтов не равен 6');
      assert.ok(
        response.body.availableInvites === 3,
        'количество доступных инвайтов не равно 3',
      );
    });

    it('Покупка инвайтов - увеличение лимита до 12', async () => {
      const purchaseInviteRequest = async () =>
        await request(server)
          .post('/invite/purchase')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(isResponseValid);

      const response = await purchaseInviteRequest();

      assert.ok(
        response.body.availableInvites,
        'не вернулось количество доступных инвайтов',
      );
      assert.ok(
        response.body.totalInvites,
        'не вернулось общее количество инвайтов',
      );
      assert.ok(
        response.body.totalInvites === 12,
        'лимит инвайтов не равен 12',
      );
      assert.ok(
        response.body.availableInvites === 9,
        'количество доступных инвайтов не равно 9',
      );
    });

    it('Покупка инвайтов - негативный сценарий', async () => {
      await request(server)
        .post('/invite/purchase')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);
    });
  });
});
