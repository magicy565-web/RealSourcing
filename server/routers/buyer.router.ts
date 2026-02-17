import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";

import { buyerProfiles, liveInteractions } from "../../drizzle/schema.js";
import { eq, and, desc } from "drizzle-orm";

const db = getDb();

export const buyerRouter = router({
  // 获取买家画像
  getProfile: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId || ctx.user.id;
      
      const profile = await db.query.buyerProfiles.findFirst({
        where: eq(buyerProfiles.userId, userId),
      });

      return profile;
    }),

  // 更新买家画像
  updateProfile: protectedProcedure
    .input(z.object({
      shopType: z.string().optional(),
      shopName: z.string().optional(),
      mainCategories: z.array(z.string()).optional(),
      priceRangeMin: z.number().optional(),
      priceRangeMax: z.number().optional(),
      preferredMoqMin: z.number().optional(),
      preferredMoqMax: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.buyerProfiles.findFirst({
        where: eq(buyerProfiles.userId, ctx.user.id),
      });

      if (existing) {
        await db.update(buyerProfiles)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(buyerProfiles.userId, ctx.user.id));
      } else {
        await db.insert(buyerProfiles).values({
          userId: ctx.user.id,
          ...input,
        });
      }

      return { success: true };
    }),

  // 记录用户行为
  trackInteraction: protectedProcedure
    .input(z.object({
      webinarId: z.number(),
      interactionType: z.enum([
        "join", "leave", "product_view", "product_favorite",
        "inquiry", "chat", "question", "poll_vote"
      ]),
      productId: z.number().optional(),
      metadata: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.insert(liveInteractions).values({
        userId: ctx.user.id,
        ...input,
      });

      return { success: true };
    }),

  // 获取用户互动历史
  getInteractionHistory: protectedProcedure
    .input(z.object({
      webinarId: z.number().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(liveInteractions.userId, ctx.user.id)];
      
      if (input.webinarId) {
        conditions.push(eq(liveInteractions.webinarId, input.webinarId));
      }

      const interactions = await db.query.liveInteractions.findMany({
        where: and(...conditions),
        orderBy: [desc(liveInteractions.timestamp)],
        limit: input.limit,
      });

      return interactions;
    }),

  // 获取买家统计数据
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await db.query.buyerProfiles.findFirst({
        where: eq(buyerProfiles.userId, ctx.user.id),
      });

      if (!profile) {
        return {
          webinarsAttended: 0,
          productsViewed: 0,
          productsFavorited: 0,
          inquiriesSent: 0,
          totalOrders: 0,
          totalSpent: 0,
          creditScore: 50,
        };
      }

      return {
        webinarsAttended: profile.webinarsAttended,
        productsViewed: profile.productsViewed,
        productsFavorited: profile.productsFavorited,
        inquiriesSent: profile.inquiriesSent,
        totalOrders: profile.totalOrders,
        totalSpent: Number(profile.totalSpent),
        creditScore: profile.creditScore,
      };
    }),
});
