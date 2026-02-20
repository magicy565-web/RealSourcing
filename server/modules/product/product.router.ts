import { router, publicProcedure } from '../../trpc/trpc';
import { prisma } from '../../shared/prisma/client';
import { z } from 'zod';

export const productRouter = router({
  list: publicProcedure
    .input(
      z.object({
        factoryId: z.number().optional(),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const products = await prisma.product.findMany({
        where: {
          ...(input?.factoryId && { factoryId: input.factoryId }),
          ...(input?.category && { category: input.category }),
        },
        include: {
          factory: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return products;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const product = await prisma.product.findUnique({
        where: { id: input.id },
        include: {
          factory: true,
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    }),

  listByFactory: publicProcedure
    .input(z.object({ factoryId: z.number() }))
    .query(async ({ input }) => {
      return prisma.product.findMany({
        where: { factoryId: input.factoryId },
        orderBy: { createdAt: 'desc' },
      });
    }),
});
