import { router, publicProcedure, protectedProcedure } from '../../trpc/trpc';
import { webinarService } from './webinar.service';
import { z } from 'zod';

export const webinarRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        scheduledAt: z.string().optional(),
        duration: z.number().default(60),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return webinarService.create({
        ...input,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        hostId: ctx.user.id,
      });
    }),

  list: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return webinarService.list(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return webinarService.getById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        coverImage: z.string().optional(),
        status: z.string().optional(),
        scheduledAt: z.string().optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      return webinarService.update(id, {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return webinarService.delete(input.id);
    }),

  addParticipant: protectedProcedure
    .input(
      z.object({
        webinarId: z.number(),
        userId: z.number().optional(),
        factoryId: z.number().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return webinarService.addParticipant(input.webinarId, input);
    }),

  addProducts: protectedProcedure
    .input(
      z.object({
        webinarId: z.number(),
        productIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      return webinarService.addProducts(input.webinarId, input.productIds);
    }),
});
