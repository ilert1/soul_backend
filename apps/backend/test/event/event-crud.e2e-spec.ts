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
import { telegramData } from 'test/auth/auth-helper';
import { isResponseValid } from 'test/utils';

describe('EventCrudController (e2e)', () => {
  let app: INestApplication;
  let server: string;
  let accessToken: string;
  let createdEventId: string;

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
      .send(telegramData)
      .expect(isResponseValid);

    accessToken = userResponse.body.accessToken;
  });

  after(async () => {
    await app.close();
  });

  describe('POST /event', () => {
    it('Создание события', async () => {
      const createEventDto: CreateEventRequestDto = {
        title: 'Концерт классической музыки',
        description: 'Уникальная возможность насладиться живым исполнением.',
        startDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
        finishDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1) + 3600000,
        ), // Увеличиваем timestamp на 1 час
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

      const response = await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventDto)
        .expect(201);

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

    it('Ошибка при создании события: Дата начала события не может быть в прошлом', async () => {
      const createEventDto: CreateEventRequestDto = {
        title: 'Концерт музыки',
        description: 'Описание события',
        startDate: new Date(Date.now() - 10000),
        finishDate: new Date(Date.now()),
        guestLimit: 10,
        entryCondition: EntryCondition.FREE,
        bonusDistributionType: 'ALL',
        place: {
          name: 'Место проведения',
          description: 'Описание места',
          latitude: 55.751244,
          longitude: 37.618423,
          address: 'г. Москва, ул. Арбат, 10',
        },
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventDto)
        .expect(400);
    });

    it('Ошибка при создании события: Дата окончания события не может быть меньше даты начала', async () => {
      const createEventDto: CreateEventRequestDto = {
        title: 'Концерт музыки',
        description: 'Описание события',
        startDate: new Date(Date.now() + 20000),
        finishDate: new Date(Date.now() + 10000), // дата окончания раньше даты начала
        guestLimit: 10,
        entryCondition: EntryCondition.FREE,
        bonusDistributionType: 'ALL',
        place: {
          name: 'Место проведения',
          description: 'Описание места',
          latitude: 55.751244,
          longitude: 37.618423,
          address: 'г. Москва, ул. Арбат, 10',
        },
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventDto)
        .expect(400);
    });

    it('Ошибка при создании события: Разница между началом и окончанием не может превышать 24 часа', async () => {
      const createEventDto: CreateEventRequestDto = {
        title: 'Долгий концерт',
        description: 'Описание события',
        startDate: new Date(Date.now() + 1000),
        finishDate: new Date(Date.now() + 25 * 60 * 60 * 1000 + 1000), // 25 часов
        guestLimit: 10,
        entryCondition: EntryCondition.FREE,
        bonusDistributionType: 'ALL',
        place: {
          name: 'Место проведения',
          description: 'Описание места',
          latitude: 55.751244,
          longitude: 37.618423,
          address: 'г. Москва, ул. Арбат, 10',
        },
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventDto)
        .expect(400);
    });

    it('Ошибка при создании события: При платном участии обязательны поля currencyId и entryFee', async () => {
      const createEventDto: CreateEventRequestDto = {
        title: 'Платный концерт',
        description: 'Описание события',
        startDate: new Date(Date.now() + 10000),
        finishDate: new Date(Date.now() + 20000),
        guestLimit: 10,
        entryCondition: EntryCondition.PAID, // платное участие
        bonusDistributionType: 'ALL',
        entryFee: undefined, // обязательные поля не указаны
        currencyId: undefined, // обязательные поля не указаны
        place: {
          name: 'Место проведения',
          description: 'Описание места',
          latitude: 55.751244,
          longitude: 37.618423,
          address: 'г. Москва, ул. Арбат, 10',
        },
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventDto)
        .expect(400);
    });

    it('Ошибка при создании события: При бесплатном участии не должны быть указаны поля currencyId и entryFee', async () => {
      const createEventDto: CreateEventRequestDto = {
        title: 'Бесплатный концерт',
        description: 'Описание события',
        startDate: new Date(Date.now() + 10000),
        finishDate: new Date(Date.now() + 20000),
        guestLimit: 10,
        entryCondition: EntryCondition.FREE, // бесплатное участие
        bonusDistributionType: 'ALL',
        entryFee: 0, // не должно быть указано
        currencyId: 5,
        place: {
          name: 'Место проведения',
          description: 'Описание места',
          latitude: 55.751244,
          longitude: 37.618423,
          address: 'г. Москва, ул. Арбат, 10',
        },
      };

      await request(server)
        .post('/event')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEventDto)
        .expect(400);
    });
  });

  describe('GET /event/:eventId', () => {
    it('Получение события по ID', async () => {
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
      // Не возвращаются поля dto: guestLimit, wallet, deposit, bonusDistributionN
    });
  });

  describe('PATCH /event/eventId', () => {
    it('Обновление события', async () => {
      const updateEventDto: UpdateEventRequestDto = {
        title: 'Обновленный концерт классической музыки',
        description: 'Теперь с участием знаменитого дирижера',
        startDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1) + 1600000,
        ),
        finishDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1) + 3600000,
        ),
      };

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

    it('Ошибка при изменении события: Дата начала события не может быть в прошлом', async () => {
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

    it('Ошибка при изменении события: Дата окончания события не может быть раньше даты начала', async () => {
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

    it('Ошибка при изменении события: Новая дата окончания события не может быть раньше прежней даты начала', async () => {
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

    it('Ошибка при изменении события: Новая дата начала события не может быть позже прежней даты окончания', async () => {
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

    it('Ошибка при создании события: Разница между началом и окончанием не может превышать 24 часа', async () => {
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

  describe('DELETE /event/eventId', () => {
    it('Удаление события', async () => {
      const response = await request(server)
        .delete(`/event/${createdEventId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      assert.strictEqual(response.status, 200, 'Событие не было удалено');
    });
  });

  describe('Получение несуществующего события', () => {
    it('Получение события по ID (404)', async () => {
      await request(server)
        .get(`/event/nonexistent-id`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
