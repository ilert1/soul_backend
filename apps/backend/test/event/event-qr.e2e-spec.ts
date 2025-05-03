import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as assert from 'assert';
import { isResponseValid } from 'test/utils';
import { CreateEventRequestDto } from 'src/modules/event/dto/create-event.dto';
import { EntryCondition } from '@prisma/client';
import { telegramUserForQR, telegramUserForQRNew } from './event-helper';

describe('EventQrController (e2e)', () => {
  let app: INestApplication;
  let server: string;
  let eventCreatorAccessToken: string;
  let currentUserAccessToken: string;
  let eventId: string;

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
  });

  after(async () => {
    await app.close();
  });

  describe('GET /event/qr/:eventId', () => {
    it('Получение хэша мероприятия для формирования QR ссылки другим юзером', async () => {
      const response = await request(server)
        .get(`/event/qr/${eventId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);

      assert.ok(response.body.hash, 'hash не был возвращен');
    });

    it('Ошибка 404: Неверный eventId', async () => {
      await request(server)
        .get('/event/qr/non-existent-activity-id')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(404);
    });

    it('Получение хэша мероприятия для формирования QR ссылки создателем', async () => {
      await request(server)
        .get(`/event/qr/${eventId}`)
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .expect(200);
    });
  });
});
