import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { PrismaClient } from '@prisma/client';
import { Database, Resource, getModelByName } from '@adminjs/prisma';

AdminJS.registerAdapter({ Database, Resource });
const start = async () => {
  const prisma = new PrismaClient();

  const adminJs = new AdminJS({
    resources: [
      {
        resource: { model: getModelByName('User'), client: prisma },
        options: {},
      },
      {
        resource: { model: getModelByName('Event'), client: prisma },
        options: {},
      },
      {
        resource: { model: getModelByName('Country'), client: prisma },
        options: {},
      },
      {
        resource: { model: getModelByName('Image'), client: prisma },
        options: {},
      },
      // Добавьте другие модели по необходимости
    ],
    rootPath: '/admin',
  });

  const app = express();
  const router = AdminJSExpress.buildRouter(adminJs);
  app.use(adminJs.options.rootPath, router);

  const port = 3001;
  app.listen(port, () => {
    console.log(
      `AdminJS is running at http://localhost:${port}${adminJs.options.rootPath}`,
    );
  });
};
start();
