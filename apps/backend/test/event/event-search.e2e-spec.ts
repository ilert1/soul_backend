import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as assert from 'assert';
import { EntryCondition } from '@prisma/client';
import { isResponseValid } from 'test/utils';
import { createEventDto, telegramUserForSearch } from './event-helper';

describe('EventSearchController (e2e)', () => {
  let app: INestApplication;
  let server: string;
  let eventCreatorAccessToken: string;

  before(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    server = app.getHttpServer();

    // Создание пользователя для создания события
    const eventCreatorResponse = await request(server)
      .post('/auth/telegram')
      .send(telegramUserForSearch)
      .expect(isResponseValid);

    eventCreatorAccessToken = eventCreatorResponse.body.accessToken;

    await request(server)
      .post('/event')
      .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
      .send(createEventDto)
      .expect(201);
  });

  after(async () => {
    await app.close();
  });

  describe('GET /event/search', () => {
    it('| + | — успешный поиск событий', async () => {
      const response = await request(server)
        .get('/event/search')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .query({
          latitude: 55.751244,
          longitude: 37.618423,
          limit: 10,
          page: 1,
        })
        .expect(200);

      assert.ok(
        Array.isArray(response.body.items),
        'Items должны быть массивом',
      );
      assert.ok(response.body.page, 'page не был возвращен');
      assert.ok(response.body.pages, 'pages не был возвращен');
      assert.ok(response.body.size, 'size не был возвращен');
      assert.ok(response.body.total, 'total не был возвращен');
      assert.ok(response.body.items.length > 0, 'Список событий пуст');
    });

    it('| + | — поиск событий без результата', async () => {
      const response = await request(server)
        .get('/event/search')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .query({
          latitude: 55.751244,
          longitude: 37.618423,
          limit: 10,
          page: 1,
          entryCondition: EntryCondition.PAID,
        })
        .expect(200);

      assert.ok(
        Array.isArray(response.body.items),
        'Items должны быть массивом',
      );
      assert.ok(response.body.page, 'page не был возвращен');
      assert.ok(response.body.pages !== undefined, 'pages не был возвращен');
      assert.ok(response.body.size, 'size не был возвращен');
      assert.ok(response.body.total !== undefined, 'total не был возвращен');
      assert.ok(
        response.body.items.length === 0,
        'Список событий должен быть пуст',
      );
    });

    it('| - | — неверные координаты', async () => {
      await request(server)
        .get('/event/search')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .query({
          latitude: null,
          longitude: null,
          limit: 10,
          page: 1,
        })
        .expect(400);
    });

    it('| - | — неверная дата', async () => {
      await request(server)
        .get('/event/search')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .query({
          latitude: 55.751244,
          longitude: 37.618423,
          limit: 10,
          page: 1,
          date: 'invalid-date',
        })
        .expect(400);
    });
  });

  describe('GET /event/map-markers', () => {
    it('| + | — успешное получение маркеров событий', async () => {
      const response = await request(server)
        .get('/event/map-markers')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .query({
          latitude: 55.751244,
          longitude: 37.618423,
          radius: 50,
        })
        .expect(200);

      assert.ok(Array.isArray(response.body), 'Маркеры должны быть массивом');
      response.body.forEach((marker) => {
        assert.ok(marker.id, 'ID маркера не был возвращен');
        assert.ok(marker.place, 'Место не было возвращено');
      });
    });

    it('| - | — неверные координаты для маркеров', async () => {
      await request(server)
        .get('/event/map-markers')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .query({
          latitude: null,
          longitude: null,
          radius: 50,
        })
        .expect(400);
    });

    it('| - | — неверный радиус', async () => {
      await request(server)
        .get('/event/map-markers')
        .set('Authorization', `Bearer ${eventCreatorAccessToken}`)
        .query({
          latitude: 55.751244,
          longitude: 37.618423,
          radius: -1,
        })
        .expect(400);
    });
  });
});
