import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as assert from 'assert';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import {
  generateTestUserId,
  isResponseUnvalid,
  isResponseValid,
} from '../utils';
import { UserExampleRequestUpdate } from 'src/modules/user/dto/examples/user.example';
import { telegramData } from 'test/auth/auth-helper';

describe('UserController (e2e)', () => {
  let server: string;

  let app: INestApplication;
  let accessToken: string;
  let userId: number = generateTestUserId();

  before(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Включаем валидацию DTO
    await app.init();

    server = app.getHttpServer();

    const response = await request(server)
      .post('/auth/telegram')
      .send(telegramData)
      .expect(isResponseValid);

    accessToken = response.body.accessToken;
    userId = response.body.id;
  });

  after(async () => {
    await app.close();
  });

  describe('GET /user/me', () => {
    it('| + | — получить информацию о себе', async () => {
      const response = await request(server)
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(response.body.id, 'id не вернулся');
      assert.ok(response.body.fullName, 'fullName не вернулся');
      assert.ok(response.body.username, 'username не вернулся');
      assert.ok(response.body.languageCode, 'languageCode не вернулся');
      assert.ok(response.body.createdAt, 'createdAt не вернулся');
      assert.ok(response.body.updatedAt, 'updatedAt не вернулся');
      assert.ok(response.body.rank, 'rank не вернулся');
      assert.ok(response.body.wallet, 'wallet не вернулся');
      assert.ok(response.body.totalInvites, 'totalInvites не вернулся');
      assert.ok(
        response.body.showSoulPointsToOthers,
        'showSoulPointsToOthers не вернулся',
      );
      assert.ok(
        response.body.showActivityToOthers,
        'showActivityToOthers не вернулся',
      );
      assert.ok(response.body.avatarImage, 'avatarImage не вернулся');
    });

    it('| - | — несуществующий токен', async () => {
      await request(server)
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}invalid`)
        .expect(isResponseUnvalid);
    });
  });

  describe('PATCH /user/me', () => {
    it('| + | — обновить информацию о себе', async () => {
      const response = await request(server)
        .patch('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(UserExampleRequestUpdate)
        .expect(isResponseValid);

      assert.equal(response.body.fullName, UserExampleRequestUpdate.fullName);
      assert.equal(
        response.body.description,
        UserExampleRequestUpdate.description,
      );
      assert.equal(
        response.body.showSoulPointsToOthers,
        UserExampleRequestUpdate.showSoulPointsToOthers,
      );
      assert.equal(
        response.body.showActivityToOthers,
        UserExampleRequestUpdate.showActivityToOthers,
      );
      assert.equal(
        response.body.languageCode,
        UserExampleRequestUpdate.languageCode,
      );
    });

    it('| - | — отправка невалидных данных', async () => {
      const updatePayload = {
        ...UserExampleRequestUpdate,
        fullName: 12345,
      };
      await request(server)
        .patch('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePayload)
        .expect(isResponseUnvalid);
    });
  });

  describe('GET /user/:id', () => {
    it('| + | — получить информацию о пользователе', async () => {
      const response = await request(server)
        .get(`/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(response.body.id, 'id не вернулся');
      assert.ok(response.body.fullName, 'fullName не вернулся');
      assert.ok(response.body.username, 'username не вернулся');
      assert.ok(response.body.languageCode, 'languageCode не вернулся');
      assert.ok(response.body.createdAt, 'createdAt не вернулся');
      assert.ok(response.body.updatedAt, 'updatedAt не вернулся');
      assert.ok(response.body.rank, 'rank не вернулся');
      assert.ok(response.body.wallet, 'wallet не вернулся');
      assert.ok(response.body.totalInvites, 'totalInvites не вернулся');
      assert.ok(
        response.body.showSoulPointsToOthers,
        'showSoulPointsToOthers не вернулся',
      );
      assert.ok(
        response.body.showActivityToOthers,
        'showActivityToOthers не вернулся',
      );
      assert.ok(response.body.avatarImage, 'avatarImage не вернулся');
    });

    it('| - | — передан несуществующий id', async () => {
      await request(server)
        .get(`/user/99999999`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);
    });
  });
});
