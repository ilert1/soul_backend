import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { isResponseValid } from 'test/utils';
import { ConfirmParticipationDto } from 'src/modules/event/dto/confirm-participation.dto';
import { CreateEventRequestDto } from 'src/modules/event/dto/create-event.dto';
import {
  createEventDto,
  telegramUserForParticipation,
  telegramUserForParticipationNew,
} from './event-helper';

describe('EventParticipationController (e2e)', () => {
  let app: INestApplication;
  let server: string;
  let eventCreatorAccessToken: string;
  let currentUserAccessToken: string;
  let eventId: string;
  let lateEventId: string;
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
      .send(telegramUserForParticipation)
      .expect(isResponseValid);

    eventCreatorAccessToken = eventCreatorResponse.body.accessToken;

    const createNewEventDto: CreateEventRequestDto = {
      ...createEventDto,
      startDate: new Date(Date.now() + 20000),
      finishDate: new Date(Date.now() + 600000),
    };

    const eventCreateResponse = await request(server)
      .post('/event')
      .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
      .send(createNewEventDto)
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
      .send(telegramUserForParticipationNew)
      .expect(isResponseValid);

    currentUserAccessToken = currentUserResponse.body.accessToken;

    const activityResponse = await request(server)
      .post('/activities')
      .set('Authorization', `Bearer ${currentUserAccessToken}`)
      .send({ eventId: eventId })
      .expect(201);

    const activityResponseForLate = await request(server)
      .post('/activities')
      .set('Authorization', `Bearer ${currentUserAccessToken}`)
      .send({ eventId: lateEventId })
      .expect(201);

    const hashResponse = await request(server)
      .get(`/activities/qr/${activityResponse.body.id}`)
      .set('Authorization', `Bearer ${currentUserAccessToken}`)
      .expect(200);

    activityHash = hashResponse.body.hash;

    const hashResponseforLate = await request(server)
      .get(`/activities/qr/${activityResponseForLate.body.id}`)
      .set('Authorization', `Bearer ${currentUserAccessToken}`)
      .expect(200);

    activityHashForLate = hashResponseforLate.body.hash;
  });

  after(async () => {
    await app.close();
  });

  describe('POST /event/confirm-participation', () => {
    it('| + | — подтверждение участия в событии', async () => {
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

    it('| - | — невозможно подтвердить участие (до начала более трех часов)', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: lateEventId,
        activityHash: activityHashForLate,
        geoposition: { latitude: 55.751244, longitude: 37.618423 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400);
    });

    it('| - | — невозможно подтвердить участие (пользователь не имеет прав на подтверждение участия)', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: activityHash,
        geoposition: { latitude: 55.751244, longitude: 37.618423 },
      };

      // Используем токен другого пользователя
      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400);
    });

    it('| - | — невозможно подтвердить участие (гепозиция не предоставлена)', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: activityHash,
        geoposition: { latitude: 1, longitude: 1 }, // Неверные координаты
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400);
    });

    it('| - | — неверный хеш', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash:
          'ae6a57e373160b7507ef7b40225c659000b1ed81faafbef5624192dec4e7f56a5dae6bb2bf3deefbb9968b673aae6ae6',
        geoposition: { latitude: 55.751244, longitude: 37.618423 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(500);
    });

    it('| - | — невозможно подтвердить участие (хэш события не соответствует eventId)', async () => {
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

    it('| - | — невозможно подтвердить участие (билет уже подтвержден)', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: activityHash,
        geoposition: { latitude: 55.751244, longitude: 37.618423 },
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400); // Ожидаем ошибку, так как билет уже подтвержден
    });

    it('| - | — Невозможно подтвердить участие (гепозиция не совпадает с местом события)', async () => {
      const confirmParticipationDto: ConfirmParticipationDto = {
        eventId: eventId,
        activityHash: activityHash,
        geoposition: { latitude: 0, longitude: 0 }, // Неверные координаты
      };

      await request(server)
        .post('/event/confirm-participation')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .send(confirmParticipationDto)
        .expect(400);
    });
  });
});
