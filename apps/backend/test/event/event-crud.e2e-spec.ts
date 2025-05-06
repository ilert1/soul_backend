import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { EntryCondition } from '@prisma/client';
import * as assert from 'assert';
import {
  CreateEventRequestDto,
  UpdateEventRequestDto,
} from 'src/modules/event/dto/create-event.dto';
import { isResponseValid } from 'test/utils';
import {
  createEventDto,
  telegramUserForCreating,
  telegramUserForCreatingNew,
  updateEventDto,
} from './event-helper';

describe('EventCrudController (e2e)', () => {
  let app: INestApplication;
  let server: string;
  let accessToken: string;
  let createdEventId: string;
  let createdImageId: string;
  let anotherAcessToken: string;

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
      .send(telegramUserForCreating)
      .expect(isResponseValid);

    accessToken = userResponse.body.accessToken;

    const anotherUserResponse = await request(server)
      .post('/auth/telegram')
      .send(telegramUserForCreatingNew)
      .expect(isResponseValid);

    anotherAcessToken = anotherUserResponse.body.accessToken;
  });

  after(async () => {
    await app.close();
  });

  describe('POST /images/upload', () => {
    it('| + | — создание изображения', async () => {
      const base64Image =
        'iVBORw0KGgoAAAANSUhEUgAAAAAAAAABCAQAAAABi8iAAAAAAElFTkSuQmCC';
      const imageBuffer = Buffer.from(base64Image, 'base64');

      const response = await request(server)
        .post('/images/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', imageBuffer, {
          filename: 'test-image.png',
          contentType: 'image/png',
        })
        .expect(201);

      assert.ok(response.body.id, 'id не вернулся');
      assert.ok(response.body.name, 'name не вернулся');
      assert.ok(response.body.data, 'data не вернулся');
      assert.strictEqual(
        response.body.name,
        'test-image.png',
        'name не совпадает',
      );
      createdImageId = response.body.id;
    });
  });

  describe('POST /event', () => {
    it('| + | — создание события', async () => {
      const response = await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...createEventDto,
          imageId: createdImageId,
        })
        .expect(201);

      assert.ok(response.body.id, 'id не вернулся');
      assert.ok(response.body.title, 'title не вернулся');
      assert.ok(response.body.description, 'description не вернулся');
      assert.ok(response.body.imageId !== undefined, 'imageId не вернулся');
      assert.ok(response.body.startDate, 'startDate не вернулся');
      assert.ok(response.body.finishDate, 'finishDate не вернулся');
      assert.ok(response.body.entryCondition, 'entryCondition не вернулся');
      assert.ok(response.body.entryFee !== undefined, 'entryFee не вернулся');
      assert.ok(
        response.body.bonusDistributionType,
        'bonusDistributionType не вернулся',
      );
      assert.ok(
        response.body.guestLimit !== undefined,
        'guestLimit не вернулся',
      );
      assert.ok(response.body.wallet !== undefined, 'wallet не вернулся');
      assert.ok(
        response.body.averageRating !== undefined,
        'averageRating не вернулся',
      );
      assert.ok(response.body.currency !== undefined, 'currency не вернулся');
      assert.ok(response.body.place !== undefined, 'place не вернулся');
      assert.ok(response.body.deposit !== undefined, 'deposit не вернулся');
      assert.ok(
        response.body.bonusDistributionN !== undefined,
        'bonusDistributionN не вернулся',
      );
      // Не возвращаются поля dto: creator, distance, confirmedGuests
      createdEventId = response.body.id; // Храним ID созданного события для дальнейших тестов
    });

    it('| - | — дата начала события не может быть в прошлом', async () => {
      const createEventWithErrorDto: CreateEventRequestDto = {
        ...createEventDto,
        startDate: new Date(Date.now() - 10000),
        finishDate: new Date(Date.now()),
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventWithErrorDto)
        .expect(400);
    });

    it('| - | — дата окончания события не может быть меньше даты начала', async () => {
      const createEventWithErrorDto: CreateEventRequestDto = {
        ...createEventDto,
        startDate: new Date(Date.now() + 20000),
        finishDate: new Date(Date.now() + 10000), // дата окончания раньше даты начала
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventWithErrorDto)
        .expect(400);
    });

    it('| - | — разница между началом и окончанием не может превышать 24 часа', async () => {
      const createEventWithErrorDto: CreateEventRequestDto = {
        ...createEventDto,
        startDate: new Date(Date.now() + 1000),
        finishDate: new Date(Date.now() + 25 * 60 * 60 * 1000 + 1000), // 25 часов
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventWithErrorDto)
        .expect(400);
    });

    it('| - | — при платном участии обязательны поля currencyId и entryFee', async () => {
      const createEventWithErrorDto: CreateEventRequestDto = {
        ...createEventDto,
        entryCondition: EntryCondition.PAID, // платное участие
        entryFee: undefined, // обязательные поля не указаны
        currencyId: undefined, // обязательные поля не указаны
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventWithErrorDto)
        .expect(400);
    });

    it('| - | — при бесплатном участии не должны быть указаны currencyId и entryFee', async () => {
      const createEventWithErrorDto: CreateEventRequestDto = {
        ...createEventDto,
        entryCondition: EntryCondition.FREE, // бесплатное участие
        entryFee: 0, // не должно быть указано
        currencyId: 5,
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventWithErrorDto)
        .expect(400);
    });
  });

  describe('GET /event/:eventId', () => {
    it('| + | — получение события по ID', async () => {
      const response = await request(server)
        .get(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      assert.ok(response.body.id, 'id не вернулся');
      assert.ok(response.body.title, 'title не вернулся');
      assert.ok(response.body.description, 'description не вернулся');
      assert.ok(response.body.startDate, 'startDate не вернулся');
      assert.ok(response.body.finishDate, 'finishDate не вернулся');
      assert.ok(response.body.entryCondition, 'entryCondition не вернулся');
      assert.ok(response.body.entryFee !== undefined, 'entryFee не вернулся');
      assert.ok(
        response.body.bonusDistributionType,
        'bonusDistributionType не вернулся',
      );
      assert.ok(
        response.body.averageRating !== undefined,
        'averageRating не вернулся',
      );
      assert.ok(response.body.currency !== undefined, 'currency не вернулся');
      assert.ok(response.body.place !== undefined, 'place не вернулся');
      assert.ok(response.body.deposit !== undefined, 'deposit не вернулся');
      assert.ok(
        response.body.guestLimit !== undefined,
        'guestLimit не вернулся',
      );
      assert.ok(
        response.body.bonusDistributionN !== undefined,
        'bonusDistributionN не вернулся',
      );
      // Не возвращаются поля dto: wallet
    });
    it('| - | — получение несуществующего события', async () => {
      await request(server)
        .get(`/event/nonexistent-id`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /event/:eventId', () => {
    it('| + | — обновление события', async () => {
      const response = await request(server)
        .patch(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateEventDto)
        .expect(200);

      assert.strictEqual(
        response.body.title,
        updateEventDto.title,
        'Название события не совпадает',
      );
      assert.strictEqual(
        response.body.description,
        updateEventDto.description,
        'Описание события не совпадает',
      );
      assert.ok(response.body.id, 'id не вернулся');
      assert.ok(response.body.title, 'title не вернулся');
      assert.ok(response.body.description, 'description не вернулся');
      assert.ok(response.body.startDate, 'startDate не вернулся');
      assert.ok(response.body.finishDate, 'finishDate не вернулся');
      assert.ok(response.body.entryCondition, 'entryCondition не вернулся');
      assert.ok(response.body.entryFee !== undefined, 'entryFee не вернулся');
      assert.ok(
        response.body.bonusDistributionType,
        'bonusDistributionType не вернулся',
      );
      assert.ok(
        response.body.guestLimit !== undefined,
        'guestLimit не вернулся',
      );
      assert.ok(response.body.currency !== undefined, 'currency не вернулся');
      assert.ok(response.body.place !== undefined, 'place не вернулся');
      assert.ok(response.body.deposit !== undefined, 'deposit не вернулся');
      // Не возвращаются поля dto: averageRating, wallet, bonusDistributionN, creator, distance, confirmedGuests
    });

    it('| - | — обновление события не создателем', async () => {
      const updateEventDto: UpdateEventRequestDto = {
        title: 'Обновленный концерт классической музыки',
        description: 'Теперь с участием знаменитого дирижера',
      };

      await request(server)
        .patch(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${anotherAcessToken}`)
        .send(updateEventDto)
        .expect(404);
    });

    it('| - | — дата начала события не может быть в прошлом', async () => {
      const updateEventDto: UpdateEventRequestDto = {
        title: 'Обновленный концерт классической музыки',
        description: 'Теперь с участием знаменитого дирижера',
        startDate: new Date(Date.now() - 1000),
        finishDate: new Date(Date.now()),
      };

      await request(server)
        .patch(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateEventDto)
        .expect(400);
    });

    it('| - | — дата окончания события не может быть раньше даты начала', async () => {
      const updateEventDto: UpdateEventRequestDto = {
        startDate: new Date(Date.now() + 200000),
        finishDate: new Date(Date.now() + 100000),
      };

      await request(server)
        .patch(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateEventDto)
        .expect(400);
    });

    it('| - | — новая дата окончания события не может быть раньше прежней даты начала', async () => {
      const updateEventDto: UpdateEventRequestDto = {
        finishDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
      };

      await request(server)
        .patch(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateEventDto)
        .expect(400);
    });

    it('| - | — новая дата начала события не может быть позже прежней даты окончания', async () => {
      const updateEventDto: UpdateEventRequestDto = {
        startDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1) + 5600000,
        ),
      };

      await request(server)
        .patch(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateEventDto)
        .expect(400);
    });

    it('| - | — разница между началом и окончанием не может быть больше 24 часов', async () => {
      const updateEventDto: UpdateEventRequestDto = {
        title: 'Долгий концерт',
        description: 'Описание события',
        startDate: new Date(Date.now() + 100000),
        finishDate: new Date(Date.now() + 25 * 60 * 60 * 1000 + 100000), // + 25 часов
      };

      await request(server)
        .patch(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateEventDto)
        .expect(400);
    });
  });

  describe('DELETE /event/:eventId', () => {
    it('| + | — удаление события', async () => {
      const response = await request(server)
        .delete(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      assert.strictEqual(response.status, 200, 'Событие не было удалено');
    });

    it('| - | — удаление события не создателем', async () => {
      const response = await request(server)
        .delete(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${anotherAcessToken}`)
        .expect(404);

      assert.strictEqual(
        response.status,
        404,
        'Событие для удаления не должно быть найдено',
      );
    });

    it('| - | — удаление несуществующего события', async () => {
      const response = await request(server)
        .delete('/event/not-existing-event')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      assert.strictEqual(
        response.status,
        404,
        'Событие для удаления не должно быть найдено',
      );
    });
  });
});
