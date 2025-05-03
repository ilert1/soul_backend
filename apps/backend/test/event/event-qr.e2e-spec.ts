import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as assert from 'assert';
import { isResponseValid } from 'test/utils';
import { ConfirmParticipationDto } from 'src/modules/event/dto/confirm-participation.dto';
import { CreateEventRequestDto } from 'src/modules/event/dto/create-event.dto';
import { EntryCondition } from '@prisma/client';
import { telegramUserForQR, telegramUserForQRNew } from './event-helper';

describe('EventQrController (e2e)', () => {
  let app: INestApplication;
  let server: string;
  let eventCreatorAccessToken: string;
  let currentUserAccessToken: string;
  let eventId: string;
  let activityId: string;
  let activityHash: string;

  before(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    server = app.getHttpServer();

    const eventCreatorResponse = await request(server)
      .post('/auth/telegram')
      .send(telegramUserForQR)
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

    const currentUserResponse = await request(server)
      .post('/auth/telegram')
      .send(telegramUserForQRNew)
      .expect(isResponseValid);

    currentUserAccessToken = currentUserResponse.body.accessToken;

    const activityResponse = await request(server)
      .post('/activities')
      .set('Authorization', `Bearer ${currentUserAccessToken}`)
      .send({ eventId: eventId })
      .expect(201);
    activityId = activityResponse.body.id;

    const hashResponse = await request(server)
      .get(`/activities/qr/${activityId}`)
      .set('Authorization', `Bearer ${currentUserAccessToken}`)
      .expect(200);

    activityHash = hashResponse.body.hash;
  });

  after(async () => {
    await app.close();
  });

  describe('GET /activities/qr/:activityId', () => {
    it('Получение QR-кода для активности', async () => {
      const response = await request(server)
        .get(`/activities/qr/${activityId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);

      assert.ok(response.body.hash, 'hash не был возвращен');
    });

    it('Ошибка 404: Неверный activityId', async () => {
      await request(server)
        .get('/activities/qr/non-existent-activity-id')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(404);
    });
  });

  describe('POST /event/confirm-participation', () => {
    it('Подтверждение участия в событии', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: activityHash,
        geoposition: { latitude: 55.751244, longitude: 37.618423 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(204);
    });

    it('Ошибка 400: Пользователь не имеет прав на подтверждение участия', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: activityHash,
        geoposition: { latitude: 55.751244, longitude: 37.618423 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400);
    });

    it('Ошибка 400: Гепозиция не предоставлена', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: activityHash,
        geoposition: { latitude: 1, longitude: 1 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400);
    });

    it('Ошибка 404: Неверный хеш', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: 'invalid-hash',
        geoposition: { latitude: 55.751244, longitude: 37.618423 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(500);
    });

    it('Ошибка 404: Хэш события не соответствует eventId', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: 'non-existent-event-id',
        activityHash: activityHash,
        geoposition: { latitude: 55.751244, longitude: 37.618423 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400);
    });

    it('Ошибка 400: Билет уже подтвержден', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: activityHash,
        geoposition: { latitude: 55.751244, longitude: 37.618423 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400);
    });

    it('Ошибка 400: Гепозиция не совпадает с местом события', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: activityHash,
        geoposition: { latitude: 0, longitude: 0 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400);
    });
  });
});
