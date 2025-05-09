import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as assert from 'assert';
import { telegramUser, telegramUserNew } from './notification-helper';
import { createEventDto, updateEventDto } from 'test/event/event-helper';

describe('NotificationsController', () => {
  let app: INestApplication;
  let server: string;
  let accessToken: string;
  let currentUserAccessToken: string;
  let notificationId: string;
  let eventId: number;

  before(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    server = app.getHttpServer();

    const userResponse = await request(server)
      .post('/auth/telegram')
      .send(telegramUser)
      .expect(200);

    accessToken = userResponse.body.accessToken;

    const eventCreateResponse = await request(server)
      .post('/event')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createEventDto)
      .expect(201);

    eventId = eventCreateResponse.body.id;

    // Регистрация второго пользователя
    const currentUserResponse = await request(server)
      .post('/auth/telegram')
      .send(telegramUserNew)
      .expect(200);

    currentUserAccessToken = currentUserResponse.body.accessToken;

    await request(server)
      .post('/activities')
      .set('Authorization', `Bearer ${currentUserAccessToken}`)
      .send({ eventId: eventId })
      .expect(201);

    await request(server)
      .patch(`/event/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateEventDto)
      .expect(200);
  });

  after(async () => {
    await app.close();
  });

  describe('GET /notification/me', () => {
    it('| + | — Получение уведомлений текущего пользователя', async () => {
      const response = await request(server)
        .get('/notification/me')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .query({ page: 1 })
        .expect(200);

      notificationId = response.body.items[0].id;

      assert.ok(
        Array.isArray(response.body.items),
        'Ответ не является массивом',
      );
      assert.ok(response.body.items.length > 0, 'Уведомления не найдены');

      // Проверка структуры уведомления
      assert.ok(response.body.items[0].id, 'id уведомления не вернулся');
      assert.ok(response.body.items[0].title, 'title уведомления не вернулся');
      assert.ok(
        response.body.items[0].isRead !== undefined,
        'Поле isRead не вернулось',
      );
    });

    it('| - | — Получение уведомлений - пользователь не авторизован', async () => {
      await request(server).get('/notification/me').expect(401);
    });
  });

  describe('PATCH /notification/read-all', () => {
    it('| + | — Изменение статуса всех уведомлений на прочитанные', async () => {
      const response = await request(server)
        .patch('/notification/read-all')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);

      assert.strictEqual(response.status, 200, 'Статус ответа должен быть 200');
    });

    it('| - | — Изменение статуса всех уведомлений - пользователь не авторизован', async () => {
      await request(server).patch('/notification/read-all').expect(401);
    });
  });

  describe('PATCH /notification/read/:id', () => {
    it('| + | — Изменение статуса уведомления на прочитанное', async () => {
      const response = await request(server)
        .patch(`/notification/read/${notificationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      assert.strictEqual(response.status, 200, 'Статус ответа должен быть 200');
    });

    it('| - | — Изменение статуса несуществующего уведомления', async () => {
      await request(server)
        .patch('/notification/read/non-existing-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /notification/unread/:id', () => {
    it('| + | — Изменение статуса уведомления на непрочитанное', async () => {
      const response = await request(server)
        .patch(`/notification/unread/${notificationId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);

      assert.strictEqual(response.status, 200, 'Статус ответа должен быть 200');
    });
  });
});
