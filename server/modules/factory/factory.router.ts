import { router, publicProcedure, protectedProcedure } from '../../trpc/trpc';
import { prisma } from '../../shared/prisma/client';
import { z } from 'zod';

export const factoryRouter = router({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const factories = await prisma.factory.findMany({
        where: {
          ...(input?.search && {
            OR: [
              { name: { contains: input.search } },
              { description: { contains: input.search } },
            ],
          }),
          ...(input?.category && { category: input.category }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return factories;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const factory = await prisma.factory.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          products: {
            take: 10,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!factory) {
        throw new Error('Factory not found');
      }

      return factory;
    }),
});
