import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as assert from 'assert';
import { isResponseValid } from 'test/utils';
import { ConfirmParticipationDto } from 'src/modules/event/dto/confirm-participation.dto';
import { CreateEventRequestDto } from 'src/modules/event/dto/create-event.dto';
import { EntryCondition } from '@prisma/client';
import { telegramUser, telegramUserNew } from './activity-helper';

describe('ActivityController', () => {
  let app: INestApplication;
  let server: string;
  let eventCreatorAccessToken: string;
  let currentUserAccessToken: string;
  let eventId: string;
  let lateEventId: string;
  let activityId: string;
  let activityHash: string;
  let activityHashForLate: string;

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

    const createEventDto: CreateEventRequestDto = {
      title: 'Концерт классической музыки',
      description: 'Уникальная возможность насладиться живым исполнением.',
      startDate: new Date(Date.now() + 20000),
      finishDate: new Date(Date.now() + 600000),
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
    it('Создание активности', async () => {
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

    it('Ошибка 400: Создание активности - некорректный eventId', async () => {
      await request(server)
        .post('/activities')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send({ eventId: 'non-exsisting-data' })
        .expect(400);
    });

    it('Ошибка 400: Создание активности создателем события', async () => {
      await request(server)
        .post('/activities')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send({ eventId: 'non-exsisting-data' })
        .expect(400);
    });
  });

  describe('GET /activities/:activityId', () => {
    it('Получение активности по ID', async () => {
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

    it('Ошибка 400: Поиск активности - несуществующий activityId', async () => {
      await request(server)
        .get('/activities/non-exsisting-data')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(404);
    });
  });

  describe('DELETE /activities/:activityId', () => {
    it('Ошибка 404: Удаление активности не ее создателем', async () => {
      await request(server)
        .delete(`/activities/${activityId}`)
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .expect(404);
    });

    it('Удаление активности по ID', async () => {
      await request(server)
        .delete(`/activities/${activityId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);
    });

    it('Ошибка 404: Удаление активности - несуществующий activityId', async () => {
      await request(server)
        .delete('/activities/non-exsisting-data')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(404);
    });
  });

  describe('POST /activities/rate/:activityId', () => {
    it('Оценка события', async () => {
      await request(server)
        .post('/activities')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send({ eventId: eventId })
        .expect(201);

      const response = await request(server)
        .post(`/activities/rate/${activityId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send({ rating: 5 })
        .expect(200);

      assert.ok(response.body.rating, 'rating не вернулся');
      assert.ok(response.body.activityId, 'activityId не вернулся');
    });

    it('Ошибка 404: Оценка события - несуществующий activityId', async () => {
      await request(server)
        .post('/activities/rate/non-exsisting-data')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send({ rating: 5 })
        .expect(404);
    });

    it('Ошибка 400: Оценка события - некорректный рейтинг', async () => {
      await request(server)
        .post(`/activities/rate/${activityId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send({ rating: -1 }) // Например, рейтинг не может быть отрицательным
        .expect(400);
    });
  });

  describe('GET /activities/qr/:activityId', () => {
    it('Получение хэша активности для формирования QR ссылки', async () => {
      await request(server)
        .post('/activities')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send({ eventId: eventId })
        .expect(201);

      const response = await request(server)
        .get(`/activities/qr/${activityId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);

      assert.ok(response.body.hash, 'hash не вернулся');
    });

    it('Ошибка 404: Получение QR - несуществующий activityId', async () => {
      await request(server)
        .get('/activities/qr/non-exsisting-data')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(404);
    });
  });
});
