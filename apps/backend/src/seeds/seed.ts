import { PrismaClient } from '@prisma/client';
import { countries } from './country-data';
import { randomUUID } from 'crypto';
import { currency } from './currency-data';
import { tasks } from './task-data';

const prisma = new PrismaClient();

const seedDatabase = async (): Promise<void> => {
  await prisma.$connect();

  try {
    console.log('Starting database seeding.');
    const countriesCount = await prisma.country.count();

    if (countriesCount === 0) {
      await prisma.country.deleteMany();
      await prisma.country.createMany({
        data: countries,
      });

      const currencyCount = await prisma.currency.count();

      if (currencyCount === 0) {
        await prisma.currency.deleteMany();
        await prisma.currency.createMany({
          data: currency,
        });
      }

      //  Проверяем задания
      for (const task of tasks) {
        const existingTask = await prisma.task.findUnique({
          where: { key: task.key },
        });

        if (!existingTask) {
          await prisma.task.create({ data: task });
        }
      }

      if (process.env.NODE_ENV !== 'development') {
        console.warn(
          'Seeding users is only allowed in development environment.',
        );

        return;
      }

      console.log('Starting seeding users');

      // Проверка и создание user1
      const existingUser1 = await prisma.user.findFirst({
        where: { username: 'User1' },
      });

      const user1 =
        existingUser1 ??
        (await prisma.user.create({
          data: {
            id: randomUUID(),
            fullName: 'Full Name',
            username: 'User1',
          },
        }));

      // Проверка и создание user2
      const existingUser2 = await prisma.user.findFirst({
        where: { username: 'User2' },
      });

      const user2 =
        existingUser2 ??
        (await prisma.user.create({
          data: {
            id: randomUUID(),
            fullName: 'Second FullName',
            username: 'User2',
          },
        }));

      const existingTgUser1 = await prisma.telegramUser.findUnique({
        where: { telegramId: '123456789' },
      });

      const tgUser1 =
        existingTgUser1 ??
        (await prisma.telegramUser.create({
          data: {
            fullName: 'abc',
            telegramId: '123456789',
            userId: user1.id,
          },
        }));

      const existingTgUser2 = await prisma.telegramUser.findUnique({
        where: { telegramId: '987654321' },
      });

      const tgUser2 =
        existingTgUser2 ??
        (await prisma.telegramUser.create({
          data: {
            fullName: 'abc',
            telegramId: '987654321',
            userId: user2.id,
          },
        }));

      // Проверка и создание приглашения
      const existingInvite = await prisma.invite.findFirst({
        where: {
          inviterId: tgUser1.userId!,
          inviteeId: tgUser2.userId!,
        },
      });

      if (!existingInvite) {
        await prisma.invite.create({
          data: {
            inviteeId: tgUser2.userId!,
            inviterId: tgUser1.userId!,
            referralPointsGiven: 3,
          },
        });
      }
    }
  } finally {
    await prisma.$disconnect();
  }
};

void (async () => {
  await seedDatabase();
})();
