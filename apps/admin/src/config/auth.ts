import AdminJSExpress from '@adminjs/express';
import { comparePassword } from '../utils/hashing.utils.js';
import { prisma } from './prisma.client.js';
import AdminJS from 'adminjs';

export const buildAdminRouter = (adminJs: AdminJS) => {
  return AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async (email, password) => {
      const admin = await prisma.admin.findUnique({ where: { email } });

      if (!admin || !comparePassword(password, admin.password)) {
        return null;
      }

      return { email: admin.email, isPrimary: admin.isPrimary };
    },
    cookiePassword: process.env.COOKIE_SECRET || 'defaultSecret',
  });
};
