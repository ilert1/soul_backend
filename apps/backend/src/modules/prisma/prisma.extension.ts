import { Prisma, PrismaClient } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

export const extendedPrismaClient = (prisma: PrismaClient) => {
  return prisma.$extends({
    model: {
      $allModels: {
        /**
         * Finds a unique record in the database or throws a NotFoundException if not found.
         * @template T - The model type.
         * @template A - The arguments type for the findUnique operation.
         * @param {Prisma.Exact<A, Prisma.Args<T, 'findUnique'>>} args - The arguments for the findUnique operation.
         * @returns {Promise<Prisma.Result<T, A, 'findUnique'>>} - The found record.
         * @throws {NotFoundException} - If the record is not found.
         */
        async findUniqueOrThrow<T, A>(
          this: T,
          args: Prisma.Exact<A, Prisma.Args<T, 'findUnique'>>,
        ): Promise<Prisma.Result<T, A, 'findUnique'>> {
          const context = Prisma.getExtensionContext(this);
          const result = await (context as any).findUnique(args);

          if (!result) {
            throw new NotFoundException(`${context.$name} not found`);
          }

          return result;
        },

        /**
         * Finds the first record in the database that matches the criteria or throws a NotFoundException if not found.
         * @template T - The model type.
         * @template A - The arguments type for the findFirst operation.
         * @param {Prisma.Exact<A, Prisma.Args<T, 'findFirst'>>} args - The arguments for the findFirst operation.
         * @returns {Promise<Prisma.Result<T, A, 'findFirst'>>} - The first found record.
         * @throws {NotFoundException} - If no record is found.
         */
        async findFirstOrThrow<T, A>(
          this: T,
          args: Prisma.Exact<A, Prisma.Args<T, 'findFirst'>>,
        ): Promise<Prisma.Result<T, A, 'findFirst'>> {
          const context = Prisma.getExtensionContext(this);
          const result = await (context as any).findFirst(args);

          if (!result) {
            throw new NotFoundException(`${context.$name} not found`);
          }

          return result;
        },
      },
    },
    query: {
      $allModels: {
        async $allOperations({ model, args, query }) {
          try {
            return await query(args);
          } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              if (error.code === 'P2025') {
                throw new NotFoundException(`${model || 'Record'} not found`);
              }

              if (error.code === 'P2002') {
                throw new ConflictException(`Duplicate entry for ${model}`);
              }
            }

            throw error;
          }
        },
      },
    },
  });
};
