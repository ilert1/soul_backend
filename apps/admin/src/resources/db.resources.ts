import { getModelByName } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';

const modelNames = [
  'User',
  'TelegramUser',
  'Image',
  'Country',
  'Wallet',
  'Transaction',
  'Activity',
  'Event',
  'Rating',
  'Invite',
  'Place',
  'Farming',
  'Currency',
  'Notification',
  'Experience',
  'Task',
  'UserTaskProgress',
];

// Функция для генерации ресурсов
export const generateResources = (prisma: PrismaClient) => {
  return modelNames.map((name) => {
    return {
      resource: { model: getModelByName(name), client: prisma },
      options: {},
    };
  });
};
