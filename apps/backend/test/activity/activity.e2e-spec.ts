import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as assert from 'assert';
import { isResponseValid } from 'test/utils';
import { telegramUser, telegramUserNew } from './activity-helper';
import { createEventDto } from 'test/event/event-helper';

describe('ActivityController', () => {
  let app: INestApplication;
  let server: string;
  let eventCreatorAccessToken: string;
  let currentUserAccessToken: string;
  let eventId: string;
  let lateEventId: string;
  let activityId: string;

  before(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    server = app.getHttpServer();

    // Создание первого пользователя для создания события
    const eventCreatorResponse = await request(server)
      .post('/auth/telegram')
      .send(telegramUser)
      .expect(isResponseValid);

    eventCreatorAccessToken = eventCreatorResponse.body.accessToken;

    const eventCreateResponse = await request(server)
      .post('/event')
      .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
      .send(createEventDto)
      .expect(201);
    eventId = eventCreateResponse.body.id;

    // Второе событие (более трех часов до начала)
    const lateEventCreateResponse = await request(server)
      .post('/event')
      .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
      .send({
        ...createEventDto,
        startDate: new Date(Date.now() + 14400000),
        finishDate: new Date(Date.now() + 14500000),
      })
      .expect(201);

    lateEventId = lateEventCreateResponse.body.id;

    // Создание второго пользователя для активности
    const currentUserResponse = await request(server)
      .post('/auth/telegram')
      .send(telegramUserNew)
      .expect(isResponseValid);

    currentUserAccessToken = currentUserResponse.body.accessToken;
  });

  after(async () => {
    await app.close();
  });

  describe('POST /activities', () => {
    it('| + | — создание активности', async () => {
      const response = await request(server)
        .post('/activities')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send({ eventId: eventId })
        .expect(201);
      activityId = response.body.id;
      assert.ok(response.body.id, 'id не вернулся');
      assert.ok(response.body.userId, 'userId не вернулся');
      assert.ok(response.body.eventId, 'eventId не вернулся');
      assert.ok(response.body.joinedAt, 'joinedAt не вернулся');
      assert.ok(response.body.rating !== undefined, 'rating не вернулся');
      assert.ok(
        response.body.isConfirmed !== undefined,
        'isConfirmed не вернулся',
      );
      assert.ok(
        response.body.isConfirmedAt !== undefined,
        'isConfirmedAt не вернулся',
      );
      assert.ok(
        response.body.receivedPoints !== undefined,
        'receivedPoints не вернулся',
      );
    });

    it('| - | — создание активности - некорректный eventId', async () => {
      await request(server)
        .post('/activities')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send({ eventId: 'non-exsisting-data' })
        .expect(400);
    });

    it('| - | — создание активности создателем события', async () => {
      await request(server)
        .post('/activities')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send({ eventId: 'non-exsisting-data' })
        .expect(400);
    });
  });

  describe('GET /activities/:activityId', () => {
    it('| + | — Получение активности по ID', async () => {
      const response = await request(server)
        .get(`/activities/${activityId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);

      assert.ok(response.body.id, 'id не вернулся');
      assert.ok(response.body.userId, 'userId не вернулся');
      assert.ok(response.body.eventId, 'eventId не вернулся');
      assert.ok(response.body.joinedAt, 'joinedAt не вернулся');
      assert.ok(response.body.rating !== undefined, 'rating не вернулся');
      assert.ok(
        response.body.isConfirmed !== undefined,
        'isConfirmed не вернулся',
      );
      assert.ok(
        response.body.isConfirmedAt !== undefined,
        'isConfirmedAt не вернулся',
      );
      assert.ok(
        response.body.receivedPoints !== undefined,
        'receivedPoints не вернулся',
      );
    });

    it('| - | — поиск активности - несуществующий activityId', async () => {
      await request(server)
        .get('/activities/non-exsisting-data')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(404);
    });
  });

  describe('DELETE /activities/:activityId', () => {
    it('| - | — удаление активности не ее создателем', async () => {
      await request(server)
        .delete(`/activities/${activityId}`)
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .expect(404);
    });

    it('| - | — удаление активности по ID', async () => {
      await request(server)
        .delete(`/activities/${activityId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);
    });

    it('| - | — удаление активности - несуществующий activityId', async () => {
      await request(server)
        .delete('/activities/non-exsisting-data')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(404);
    });
  });

  describe('GET /activities/qr/:activityId', () => {
    it('| + | — получение хэша активности для формирования QR ссылки', async () => {
      const activityResponseForLate = await request(server)
        .post('/activities')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send({ eventId: lateEventId })
        .expect(201);

      const hashResponse = await request(server)
        .get(`/activities/qr/${activityResponseForLate.body.id}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);

      assert.ok(hashResponse.body.hash, 'hash не вернулся');
    });

    it('| - | — получение QR - несуществующий activityId', async () => {
      await request(server)
        .get('/activities/qr/non-exsisting-data')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(404);
    });

    it('| - | — получение QR - другой пользователь', async () => {
      await request(server)
        .get(`/activities/qr/${activityId}`)
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .expect(404);
    });
  });
});
