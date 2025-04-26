import express from 'express';
import { buildAdminRouter } from './config/auth.js';
import AdminJS from 'adminjs';
import { prisma } from './config/prisma.client.js';
import { adminResource } from './resources/admin.resources.js';
import { generateResources } from './resources/db.resources.js';
import { Database, Resource } from '@adminjs/prisma';
import 'dotenv/config';

AdminJS.registerAdapter({ Database, Resource });

const start = () => {
  const adminJs = new AdminJS({
    resources: [...generateResources(prisma), adminResource()],
    rootPath: '/admin',
  });

  const app = express();
  const router = buildAdminRouter(adminJs);

  app.use(adminJs.options.rootPath, router);

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(
      `✅ AdminJS запущен на http://localhost:${port}${adminJs.options.rootPath}`,
    );
  });
};

start();
