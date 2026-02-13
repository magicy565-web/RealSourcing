import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { recordUsage, getMonthlyUsage } from "../db";

export const usageRouter = router({
  // Record usage
  record: protectedProcedure
    .input(
      z.object({
        resourceType: z.enum([
          "webinar_created",
          "product_uploaded",
          "inquiry_received",
        ]),
        count: z.number().optional().default(1),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const usageId = await recordUsage({
        userId: ctx.user.id,
        resourceType: input.resourceType,
        count: input.count,
        periodStart,
        periodEnd,
        metadata: input.metadata,
      });

      return { usageId };
    }),

  // Get monthly usage statistics
  monthly: protectedProcedure.query(async ({ ctx }) => {
    const webinarUsage = await getMonthlyUsage(ctx.user.id, "webinar_created");
    const productUsage = await getMonthlyUsage(
      ctx.user.id,
      "product_uploaded"
    );
    const inquiryUsage = await getMonthlyUsage(
      ctx.user.id,
      "inquiry_received"
    );

    return {
      webinarCreated: webinarUsage,
      productUploaded: productUsage,
      inquiryReceived: inquiryUsage,
    };
  }),

  // Get usage for a specific resource type
  byType: protectedProcedure
    .input(
      z.object({
        resourceType: z.enum([
          "webinar_created",
          "product_uploaded",
          "inquiry_received",
        ]),
      })
    )
    .query(async ({ ctx, input }) => {
      const usage = await getMonthlyUsage(ctx.user.id, input.resourceType);
      return { usage };
    }),
});
