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
import { telegramData } from 'test/auth/auth-helper';
import { TaskList, TaskStatus, TaskType } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

describe('TaskController (e2e)', () => {
  let server: string;

  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: number = generateTestUserId();

  before(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Включаем валидацию DTO
    await app.init();

    prisma = app.get(PrismaService);

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

  describe('GET /task', () => {
    it('| + | — получить все задания', async () => {
      const response = await request(server)
        .get('/task')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(Array.isArray(response.body), 'ответ не является массивом');
      assert.ok(response.body.length > 0, 'ответ пустой, нужен seed');
    });

    it('| - | — несуществующий токен', async () => {
      await request(server)
        .get('/task')
        .set('Authorization', `Bearer ${accessToken}invalid`)
        .expect(isResponseUnvalid);
    });
  });

  describe('GET /task/:taskType', () => {
    it('| + | — получить задания по типу', async () => {
      const response = await request(server)
        .get(`/task/${TaskType.SECTION_MEETINGS}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(Array.isArray(response.body), 'ответ не является массивом');
      assert.ok(response.body.length > 0, 'ответ пустой, нужен seed');
      assert.equal(response.body[0].type, TaskType.SECTION_MEETINGS);
    });

    it('| - | — несуществующий тип', async () => {
      await request(server)
        .get(`/task/INVALID_TYPE`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);
    });
  });

  describe('GET /task/progress', () => {
    it('| + | — получить прогресс заданий пользователя', async () => {
      const response = await request(server)
        .get('/task/progress')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(Array.isArray(response.body), 'ответ не является массивом');
    });
  });

  describe('GET /task/progress/type/:taskType', () => {
    it('| + | — получить прогресс заданий пользователя по типу', async () => {
      const response = await request(server)
        .get(`/task/progress/type/${TaskType.SECTION_FARMING}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(Array.isArray(response.body), 'ответ не является массивом');
    });

    it('| - | — несуществующий тип', async () => {
      await request(server)
        .get(`/task/progress/type/INVALID_TYPE`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);
    });
  });

  describe('GET /task/progress/:taskKey', () => {
    it('| + | — получить прогресс задания пользователя по ключу', async () => {
      const response = await request(server)
        .get(`/task/progress/${TaskList.CREATED_FIRST_MEETING}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.ok(response.body.id, 'id не вернулся');
      assert.equal(response.body.userId, userId);
    });

    it('| - | — несуществующий ключ', async () => {
      await request(server)
        .get(`/task/progress/INVALID_KEY`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);
    });
  });

  describe('POST /task/checkin', () => {
    it('| + | — отправить чекин', async () => {
      await prisma.userTaskProgress.upsert({
        where: {
          userId_taskKey: {
            userId: userId.toString(),
            taskKey: TaskList.CHECKIN,
          },
        },
        create: {
          userId: userId.toString(),
          taskKey: TaskList.CHECKIN,
          progress: 1,
          status: TaskStatus.IN_PROGRESS,
          completedAt: null,
        },
        update: {
          progress: 1,
          status: TaskStatus.IN_PROGRESS,
          completedAt: null,
        },
      });
      const response = await request(server)
        .post('/task/checkin')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseValid);

      assert.equal(response.body.status, TaskStatus.COMPLETED);
    });

    it('| - | — ошибка при повторном чекине в этот день', async () => {
      await request(server)
        .post(`/task/checkin`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);
    });
  });

  describe('POST /task/manage/collect', () => {
    it('| + | — собрать награду по ключу', async () => {
      await prisma.userTaskProgress.upsert({
        where: {
          userId_taskKey: {
            userId: userId.toString(),
            taskKey: TaskList.PROFILE_COMPLETED,
          },
        },
        create: {
          userId: userId.toString(),
          taskKey: TaskList.PROFILE_COMPLETED,
          progress: 1,
          status: TaskStatus.COMPLETED,
        },
        update: { progress: 1, status: TaskStatus.COMPLETED },
      });
      const response = await request(server)
        .post('/task/manage/collect')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ taskKey: TaskList.PROFILE_COMPLETED })
        .expect(isResponseValid);

      assert.equal(response.body.status, TaskStatus.REWARD_COLLECTED);
    });

    it('| - | — ошибка при сборе награды (не выполнено или собрано)', async () => {
      const response = await request(server)
        .post(`/task/manage/collect`)
        .send({ taskKey: TaskList.PROFILE_COMPLETED })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);

      assert.notEqual(response.body.status, TaskStatus.REWARD_COLLECTED);
    });
  });

  describe('POST /task/weekly/confirm', () => {
    it('| + | — подтвердить недельное подзадание', async () => {
      await prisma.userTaskProgress.upsert({
        where: {
          userId_taskKey: {
            userId: userId.toString(),
            taskKey: TaskList.SUBSCRIBED_INSTAGRAM,
          },
        },
        create: {
          userId: userId.toString(),
          taskKey: TaskList.SUBSCRIBED_INSTAGRAM,
        },
        update: {
          progress: 0,
          status: TaskStatus.IN_PROGRESS,
          completedAt: null,
        },
      });
      const response = await request(server)
        .post('/task/weekly/confirm')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: userId.toString(),
          taskKey: TaskList.SUBSCRIBED_INSTAGRAM,
        })
        .expect(isResponseValid);

      assert.equal(response.body.status, TaskStatus.COMPLETED);
    });

    it('| + | — проверка состояния недельного главного задания (1/2)', async () => {
      const response = await request(server)
        .post('/task/weekly/confirm')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: userId.toString(),
          taskKey: TaskList.CHECKED_SOCIAL_MEDIA,
        })
        .expect(isResponseValid);

      assert.equal(response.body.status, TaskStatus.IN_PROGRESS);
      assert.equal(response.body.progress, 1);
    });

    it('| + | — проверка выполнения недельного главного задания (2/2)', async () => {
      await prisma.userTaskProgress.upsert({
        where: {
          userId_taskKey: {
            userId: userId.toString(),
            taskKey: TaskList.SUBSCRIBED_SOUL_FORUM,
          },
        },
        create: {
          userId: userId.toString(),
          taskKey: TaskList.SUBSCRIBED_SOUL_FORUM,
          progress: 1,
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
        },
        update: {
          progress: 1,
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
      const response = await request(server)
        .post('/task/weekly/confirm')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: userId.toString(),
          taskKey: TaskList.CHECKED_SOCIAL_MEDIA,
        })
        .expect(isResponseValid);

      assert.equal(response.body.status, TaskStatus.COMPLETED);
      assert.equal(response.body.progress, 2);
    });

    it('| - | — ошибка при неверном пользователе', async () => {
      await request(server)
        .post(`/task/weekly/confirm`)
        .send({
          userId: 'INVALID_USER_ID',
          taskKey: TaskList.CHECKED_SOCIAL_MEDIA,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);
    });

    it('| - | — ошибка, передан не недельный ключ задания', async () => {
      await request(server)
        .post(`/task/weekly/confirm`)
        .send({
          userId: userId.toString(),
          taskKey: TaskList.PROFILE_COMPLETED,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(isResponseUnvalid);
    });
  });
});
