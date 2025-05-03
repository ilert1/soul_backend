import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as assert from 'assert';
import { telegramData } from 'test/auth/auth-helper';
import { generateTestUserId, isResponseValid } from 'test/utils';
import { CreateEventRequestDto } from 'src/modules/event/dto/create-event.dto';
import { EntryCondition } from '@prisma/client';
import { telegramDataNew } from 'test/commonData';

describe('EventUserController (e2e)', () => {
  let app: INestApplication;
  let server: string;
  let eventCreatorAccessToken: string;
  let eventCreatorId: number = generateTestUserId();
  let currentUserAccessToken: string;
  let currentUserId: number = generateTestUserId();
  let eventId: number;

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
      .send(telegramData)
      .expect(isResponseValid);

    eventCreatorAccessToken = eventCreatorResponse.body.accessToken;
    eventCreatorId = eventCreatorResponse.body.id;

    const createEventDto: CreateEventRequestDto = {
      title: 'Концерт классической музыки',
      description: 'Уникальная возможность насладиться живым исполнением.',
      startDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      finishDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1) + 3600000,
      ),
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

    // Создание второго пользователя для активности
    const currentUserResponse = await request(server)
      .post('/auth/telegram')
      .send(telegramDataNew)
      .expect(isResponseValid);

    currentUserAccessToken = currentUserResponse.body.accessToken;
    currentUserId = currentUserResponse.body.id;

    await request(server)
      .post('/activities')
      .set('Authorization', `Bearer ${currentUserAccessToken}`)
      .send({ eventId: eventId })
      .expect(201);

    await request(server)
      .post('/event')
      .set('Authorization', `Bearer ${currentUserAccessToken}`)
      .send({ ...createEventDto, title: 'Новое событие' })
      .expect(201);
  });

  after(async () => {
    await app.close();
  });

  describe('GET /event/by-user/:userId', () => {
    it('Получение событий по ID пользователя', async () => {
      const response = await request(server)
        .get(`/event/by-user/${eventCreatorId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .query({
          size: 10,
          page: 1,
          sort: 'asc',
          period: 'future',
          latitude: 55.751244,
          longitude: 37.618423,
        })
        .expect(200);

      assert.ok(
        Array.isArray(response.body.items),
        'Items должны быть массивом',
      );
      assert.ok(response.body.page !== undefined, 'page не был возвращен');
      assert.ok(response.body.pages !== undefined, 'pages не был возвращен');
      assert.ok(response.body.size !== undefined, 'size не был возвращен');
      assert.ok(response.body.total !== undefined, 'total не был возвращен');
      assert.ok(response.body.items !== undefined, 'items не был возвращен');
      assert.ok(
        response.body.items.length > 0,
        'items не найдены (хотя они есть)',
      );

      response.body.items.forEach((item) => {
        assert.ok(item.id, 'id не был возвращен');
        assert.ok(item.title, 'title не был возвращен');
        assert.ok(item.startDate, 'startDate не был возвращен');
        assert.ok(item.finishDate, 'finishDate не был возвращен');
        assert.ok(item.distance !== undefined, 'distance не был возвращен');
        assert.ok(item.guestLimit, 'guestLimit не был возвращен');
        assert.ok(
          item.activitiesCount !== undefined,
          'activitiesCount не был возвращен',
        );
        assert.ok(item.image !== undefined, 'image не был возвращен');
      });
    });

    it('Ошибка 404: Пользователь не найден', async () => {
      const nonExistentUserId = 'non-existent-user-id';

      await request(server)
        .get(`/event/by-user/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .expect(404);
    });

    it('Получение событий: фильтр по созданным другим пользователем', async () => {
      const response = await request(server)
        .get(`/event/by-user/${eventCreatorId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .query({
          size: 10,
          page: 1,
          sort: 'asc',
          period: 'future',
          'only-created-by-user': true,
          latitude: 55.751244,
          longitude: 37.618423,
        })
        .expect(200);

      assert.ok(
        Array.isArray(response.body.items),
        'Items должны быть массивом',
      );
      assert.ok(response.body.page !== undefined, 'page не был возвращен');
      assert.ok(response.body.pages !== undefined, 'pages не был возвращен');
      assert.ok(response.body.size !== undefined, 'size не был возвращен');
      assert.ok(response.body.total !== undefined, 'total не был возвращен');
      assert.ok(response.body.items !== undefined, 'items не был возвращен');

      response.body.items.forEach((item) => {
        assert.ok(item.id, 'id не был возвращен');
        assert.ok(item.title, 'title не был возвращен');
        assert.ok(item.startDate, 'startDate не был возвращен');
        assert.ok(item.finishDate, 'finishDate не был возвращен');
        assert.ok(item.distance !== undefined, 'distance не был возвращен');
        assert.ok(item.guestLimit, 'guestLimit не был возвращен');
        assert.ok(
          item.activitiesCount !== undefined,
          'activitiesCount не был возвращен',
        );
        assert.ok(item.image !== undefined, 'image не был возвращен');
      });
    });

    it('Получение событий: все события текущего пользователя', async () => {
      const response = await request(server)
        .get(`/event/by-user/${currentUserId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .query({
          size: 10,
          page: 1,
          sort: 'asc',
          period: 'future',
          latitude: 55.751244,
          longitude: 37.618423,
        })
        .expect(200);

      assert.ok(
        Array.isArray(response.body.items),
        'Items должны быть массивом',
      );
      assert.ok(response.body.page !== undefined, 'page не был возвращен');
      assert.ok(response.body.pages !== undefined, 'pages не был возвращен');
      assert.ok(response.body.size !== undefined, 'size не был возвращен');
      assert.ok(response.body.total !== undefined, 'total не был возвращен');
      assert.ok(response.body.items !== undefined, 'items не был возвращен');
      assert.ok(response.body.items.length === 2, 'Не все события возвращены');

      response.body.items.forEach((item) => {
        assert.ok(item.id, 'id не был возвращен');
        assert.ok(item.title, 'title не был возвращен');
        assert.ok(item.startDate, 'startDate не был возвращен');
        assert.ok(item.finishDate, 'finishDate не был возвращен');
        assert.ok(item.distance !== undefined, 'distance не был возвращен');
        assert.ok(item.guestLimit, 'guestLimit не был возвращен');
        assert.ok(
          item.activitiesCount !== undefined,
          'activitiesCount не был возвращен',
        );
        assert.ok(item.image !== undefined, 'image не был возвращен');
      });
    });

    it('Получение событий: только созданные текущим пользователем', async () => {
      const response = await request(server)
        .get(`/event/by-user/${currentUserId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .query({
          'only-created-by-user': true,
          size: 10,
          page: 1,
          sort: 'asc',
          period: 'future',
          latitude: 55.751244,
          longitude: 37.618423,
        })
        .expect(200);

      assert.ok(
        Array.isArray(response.body.items),
        'Items должны быть массивом',
      );
      assert.ok(response.body.page !== undefined, 'page не был возвращен');
      assert.ok(response.body.pages !== undefined, 'pages не был возвращен');
      assert.ok(response.body.size !== undefined, 'size не был возвращен');
      assert.ok(response.body.total !== undefined, 'total не был возвращен');
      assert.ok(response.body.items !== undefined, 'items не был возвращен');
      assert.ok(response.body.items.length === 1, 'Не все события возвращены');

      response.body.items.forEach((item) => {
        assert.ok(item.id, 'id не был возвращен');
        assert.ok(item.title, 'title не был возвращен');
        assert.ok(item.startDate, 'startDate не был возвращен');
        assert.ok(item.finishDate, 'finishDate не был возвращен');
        assert.ok(item.distance !== undefined, 'distance не был возвращен');
        assert.ok(item.guestLimit, 'guestLimit не был возвращен');
        assert.ok(
          item.activitiesCount !== undefined,
          'activitiesCount не был возвращен',
        );
        assert.ok(item.image !== undefined, 'image не был возвращен');
      });
    });

    it('Ошибка 403: выставлен запрет на просмотр событий', async () => {
      await request(server)
        .patch('/user/me')
        .send({
          fullName: 'FirstName SecondName',
          showActivityToOthers: false,
        })
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .expect(200);

      await request(server)
        .get(`/event/by-user/${currentUserId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .query({
          page: 1,
          sort: 'future',
          latitude: 55.751244,
          longitude: 37.618423,
        })
        .expect(403);
    });

    it('Получение предстоящих событий с координатами', async () => {
      const response = await request(server)
        .get(`/event/by-user/${eventCreatorId}`)
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .query({
          size: 10,
          page: 1,
          sort: 'asc',
          period: 'future',
          latitude: 55.751244,
          longitude: 37.618423,
        })
        .expect(200);

      assert.ok(
        Array.isArray(response.body.items),
        'Items должны быть массивом',
      );
      assert.ok(response.body.page !== undefined, 'page не был возвращен');
      assert.ok(response.body.pages !== undefined, 'pages не был возвращен');
      assert.ok(response.body.size !== undefined, 'size не был возвращен');
      assert.ok(response.body.total !== undefined, 'total не был возвращен');
      assert.ok(response.body.items !== undefined, 'items не был возвращен');

      response.body.items.forEach((item) => {
        assert.ok(item.id, 'id не был возвращен');
        assert.ok(item.title, 'title не был возвращен');
        assert.ok(item.startDate, 'startDate не был возвращен');
        assert.ok(item.finishDate, 'finishDate не был возвращен');
        assert.ok(item.distance !== undefined, 'distance не был возвращен');
        assert.ok(item.guestLimit, 'guestLimit не был возвращен');
        assert.ok(
          item.activitiesCount !== undefined,
          'activitiesCount не был возвращен',
        );
        assert.ok(item.image !== undefined, 'image не был возвращен');
      });
    });

    it('Ошибка 400: Отсутствует долгота и/или широта', async () => {
      await request(server)
        .get(`/event/by-user/${eventCreatorId}`)
        .set('Authorization', `Bearer ${currentUserAccessToken}`)
        .query({
          page: 1,
          sort: 'future',
        })
        .expect(400);
    });
  });
});
