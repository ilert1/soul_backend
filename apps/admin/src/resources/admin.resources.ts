import { getModelByName } from '@adminjs/prisma';
import { prisma } from '../config/prisma.client.js';
import { ActionContext, ActionRequest } from 'adminjs';
import { hashPassword, comparePassword } from '../utils/hashing.utils.js';

export const adminResource = () => {
  return {
    resource: { model: getModelByName('Admin'), client: prisma },
    options: {
      properties: {
        password: {
          type: 'password',
        },
        isPrimary: {
          isVisible: {
            list: true,
            filter: true,
            show: true,
            edit: false,
          },
          isDisabled: true,
        },
      },
      actions: {
        new: {
          isAccessible: ({ currentAdmin }: ActionContext) =>
            currentAdmin?.isPrimary === true, // Только главный админ может создавать новых
          before: (request: ActionRequest): Promise<ActionRequest> => {
            if (request.payload?.password) {
              request.payload.password = hashPassword(
                request.payload.password as string,
              );
            }

            return Promise.resolve(request);
          },
        },
        edit: {
          isAccessible: ({ currentAdmin, record }: ActionContext) =>
            Boolean(currentAdmin?.isPrimary && !record?.params.isPrimary), // Только главный админ может редактировать
          before: async (request: ActionRequest): Promise<ActionRequest> => {
            if (request.payload?.password) {
              const existedAdmin = await prisma.admin.findUnique({
                where: { email: request.payload?.email },
              });

              // обновить пароль, если он изменился
              const { password } = request.payload as { password: string };

              if (
                existedAdmin &&
                !comparePassword(password, existedAdmin.password)
              ) {
                request.payload.password = hashPassword(password);
              }
            }

            // убрать поле isPrimary из запроса
            if (request.payload && 'isPrimary' in request.payload) {
              delete request.payload.isPrimary;
            }

            return Promise.resolve(request);
          },
        },
        delete: {
          isAccessible: ({ currentAdmin, record }: ActionContext) =>
            Boolean(
              currentAdmin?.isPrimary && record?.params?.isPrimary !== true, // Только главный админ может удалять
            ),
          before: async (request: ActionRequest): Promise<ActionRequest> => {
            if (request.payload?.isPrimary) {
              throw new Error('Нельзя удалить главного администратора');
            }

            return Promise.resolve(request);
          },
        },
      },
    },
  };
};
