import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as assert from 'assert';
import { CountryDto } from 'src/modules/static/country.controller';
import { isResponseValid } from 'test/utils';
import { telegramUser } from './static-helper';

describe('Country and Currency Controllers (e2e)', () => {
  let app: INestApplication;
  let server: string;
  let accessToken: string;

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
      .send(telegramUser)
      .expect(isResponseValid);

    accessToken = eventCreatorResponse.body.accessToken;
  });

  after(async () => {
    await app.close();
  });

  describe('GET /countries', () => {
    it('| + | — получение списка стран', async () => {
      const response = await request(server)
        .get('/countries')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      assert(Array.isArray(response.body), 'Ответ не является массивом');
      assert.ok(response.body.length > 0, 'Список стран пуст');
      response.body.forEach((country: CountryDto) => {
        assert.ok(country.id, 'id страны не возвращен');
        assert.ok(country.name, 'название страны не возвращено');
        assert.ok(country.code, 'код страны не возвращен');
      });
    });
  });

  describe('GET /currency', () => {
    it('| + | — получение списка валют', async () => {
      const response = await request(server)
        .get('/currency')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1 })
        .expect(200);

      assert.ok(response.body.items, 'Ответ не содержит элементы');
      assert.ok(
        Array.isArray(response.body.items),
        'items не является массивом',
      );
      assert.ok(response.body.total >= 0, 'total должно быть >= 0');
      assert.ok(response.body.page > 0, 'page должно быть > 0');
      assert.ok(response.body.size > 0, 'size должно быть > 0');
      assert.ok(response.body.pages > 0, 'pages должно быть > 0');

      response.body.items.forEach((currency: any) => {
        assert.ok(currency.id, 'id валюты не возвращен');
        assert.ok(currency.code, 'код валюты не возвращен');
      });
    });
  });
});
