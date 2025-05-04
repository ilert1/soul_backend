import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as assert from 'assert';
import { isResponseValid } from 'test/utils';
import { CreateEventRequestDto } from 'src/modules/event/dto/create-event.dto';
import {
  createEventDto,
  telegramUserForQR,
  telegramUserForQRNew,
} from './event-helper';

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
    it('| + | — получение хэша мероприятия для формирования QR ссылки другим юзером', async () => {
      const response = await request(server)
        .get(`/event/qr/${eventId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);

      assert.ok(response.body.hash, 'hash не был возвращен');
    });

    it('| - | — неверный eventId', async () => {
      await request(server)
        .get('/event/qr/non-existent-activity-id')
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(404);
    });

    it('| + | — получение хэша мероприятия для формирования QR ссылки создателем', async () => {
      await request(server)
        .get(`/event/qr/${eventId}`)
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .expect(200);
    });
  });
});
