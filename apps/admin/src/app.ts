import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { PrismaClient } from '@prisma/client';
import { Database, Resource } from '@adminjs/prisma';
import 'dotenv/config';
import { generateResources } from './db.resources.js';

AdminJS.registerAdapter({ Database, Resource });

const start = async () => {
  const prisma = new PrismaClient();

  const adminJs = new AdminJS({
    resources: generateResources(prisma),
    rootPath: '/admin',
  });

  const app = express();

  const ADMIN = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };

  const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async (email, password) => {
      if (email === ADMIN.email && password === ADMIN.password) {
        return ADMIN;
      }
      return null;
    },
    cookiePassword: process.env.COOKIE_SECRET || 'cookie-secret',
  });

  app.use(adminJs.options.rootPath, router);

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(
      `AdminJS is running at http://localhost:${port}${adminJs.options.rootPath}`,
    );
  });
};

start();
