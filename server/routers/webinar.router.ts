import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { webinars, webinarParticipants, webinarFactories, factories, subscriptions, subscriptionPlans } from "../../drizzle/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";

// 订阅套餐的时长限制（分钟）
const DURATION_LIMITS: Record<string, number> = {
  free: 30,
  basic: 30,
  professional: 60,
  enterprise: 120,
  annual: 120, // 年费服务
};

// 检查用户是否有权限创建指定时长的 Webinar
async function checkDurationPermission(userId: number, requestedDuration: number) {
  // 查询用户的订阅
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
  
  const userSubscription = await db
    .select({
      subscription: subscriptions,
      plan: subscriptionPlans,
    })
    .from(subscriptions)
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);

  // 如果没有订阅，使用免费版限制
  let maxDuration = DURATION_LIMITS.free;
  let planName = "free";

  if (userSubscription.length > 0 && userSubscription[0].plan) {
    const plan = userSubscription[0].plan;
    planName = plan.name.toLowerCase();
    
    // 根据套餐名称获取时长限制
    if (planName.includes("enterprise") || planName.includes("年费")) {
      maxDuration = DURATION_LIMITS.enterprise;
    } else if (planName.includes("professional") || planName.includes("专业")) {
      maxDuration = DURATION_LIMITS.professional;
    } else if (planName.includes("basic") || planName.includes("基础")) {
      maxDuration = DURATION_LIMITS.basic;
    }
  }

  if (requestedDuration > maxDuration) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `您的套餐最多支持 ${maxDuration} 分钟的 Webinar。当前请求: ${requestedDuration} 分钟。请升级套餐以获得更长时长。`,
    });
  }

  return { maxDuration, planName };
}

export const webinarRouter = router({
  // 获取用户的时长限制
  getDurationLimit: protectedProcedure.query(async ({ ctx }) => {
    const permission = await checkDurationPermission(ctx.user.id, 0);
    return {
      maxDuration: permission.maxDuration,
      planName: permission.planName,
      limits: DURATION_LIMITS,
    };
  }),

  // 创建 Webinar
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "标题不能为空").max(255),
        description: z.string().optional(),
        category: z.string().optional(),
        type: z.enum(["one_to_one", "group", "webinar"]).default("webinar"),
        language: z.string().default("zh"),
        scheduledAt: z.string().or(z.date()),
        duration: z.number().min(10, "时长至少10分钟").max(120, "时长最多120分钟"),
        maxParticipants: z.number().min(1).max(1000).default(100),
        coverImage: z.string().url().optional(),
        tags: z.array(z.string()).optional(),
        recordingEnabled: z.boolean().default(true),
        requireApproval: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查时长权限
      await checkDurationPermission(ctx.user.id, input.duration);

      // 生成 Agora 频道名称
      const channelName = `webinar_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 创建 Webinar
      const result = await db.insert(webinars).values({
        createdById: ctx.user.id,
        title: input.title,
        description: input.description,
        category: input.category,
        type: input.type,
        language: input.language,
        scheduledAt: new Date(input.scheduledAt),
        duration: input.duration,
        maxParticipants: input.maxParticipants,
        coverImage: input.coverImage,
        tags: input.tags,
        recordingEnabled: input.recordingEnabled ? 1 : 0,
        agoraChannelName: channelName,
        status: "draft",
      });

      const webinarId = result[0].insertId;

      // 自动添加创建者为主持人
      await db.insert(webinarParticipants).values({
        webinarId,
        userId: ctx.user.id,
        role: "host",
        status: "accepted",
        invitedAt: new Date(),
      });

      return {
        id: webinarId,
        channelName,
        message: "Webinar 创建成功",
      };
    }),

  // 获取所有 Webinar 列表（公开接口）
  listAll: publicProcedure
    .input(
      z.object({
        status: z.enum(["draft", "scheduled", "live", "completed", "cancelled"]).optional(),
        limit: z.number().min(1).max(100).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      const conditions = [];
      
      if (input.status) {
        conditions.push(eq(webinars.status, input.status));
      }

      const items = await db
        .select()
        .from(webinars)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(webinars.scheduledAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(webinars)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        items,
        total: total[0].count,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // 获取 Webinar 列表
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "scheduled", "live", "completed", "cancelled"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      const conditions = [eq(webinars.createdById, ctx.user.id)];
      
      if (input.status) {
        conditions.push(eq(webinars.status, input.status));
      }

      const items = await db
        .select()
        .from(webinars)
        .where(and(...conditions))
        .orderBy(desc(webinars.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(webinars)
        .where(and(...conditions));

      return {
        items,
        total: total[0].count,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // 获取 Webinar 详情（公开接口）
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      const webinar = await db
        .select()
        .from(webinars)
        .where(eq(webinars.id, input.id))
        .limit(1);

      if (!webinar.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webinar 不存在",
        });
      }

      // 获取参会者列表
      const participants = await db
        .select()
        .from(webinarParticipants)
        .where(eq(webinarParticipants.webinarId, input.id));

      // 获取参展工厂列表
      const exhibitingFactories = await db
        .select({
          factory: factories,
        })
        .from(webinarFactories)
        .leftJoin(factories, eq(webinarFactories.factoryId, factories.id))
        .where(eq(webinarFactories.webinarId, input.id));

      return {
        ...webinar[0],
        participants,
        exhibitingFactories: exhibitingFactories.map(f => f.factory).filter(Boolean),
      };
    }),

  // 更新 Webinar
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        language: z.string().optional(),
        scheduledAt: z.string().or(z.date()).optional(),
        duration: z.number().min(10).max(120).optional(),
        maxParticipants: z.number().min(1).max(1000).optional(),
        coverImage: z.string().url().optional(),
        tags: z.array(z.string()).optional(),
        recordingEnabled: z.boolean().optional(),
        status: z.enum(["draft", "scheduled", "live", "completed", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 检查 Webinar 是否存在且属于当前用户
      const existing = await db
        .select()
        .from(webinars)
        .where(eq(webinars.id, id))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webinar 不存在",
        });
      }

      if (existing[0].createdById !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "您没有权限修改此 Webinar",
        });
      }

      // 如果修改了时长，检查权限
      if (updateData.duration) {
        await checkDurationPermission(ctx.user.id, updateData.duration);
      }

      // 更新数据
      const updates: any = {};
      if (updateData.title) updates.title = updateData.title;
      if (updateData.description !== undefined) updates.description = updateData.description;
      if (updateData.category) updates.category = updateData.category;
      if (updateData.language) updates.language = updateData.language;
      if (updateData.scheduledAt) updates.scheduledAt = new Date(updateData.scheduledAt);
      if (updateData.duration) updates.duration = updateData.duration;
      if (updateData.maxParticipants) updates.maxParticipants = updateData.maxParticipants;
      if (updateData.coverImage) updates.coverImage = updateData.coverImage;
      if (updateData.tags) updates.tags = updateData.tags;
      if (updateData.recordingEnabled !== undefined) updates.recordingEnabled = updateData.recordingEnabled ? 1 : 0;
      if (updateData.status) updates.status = updateData.status;

      await db.update(webinars).set(updates).where(eq(webinars.id, id));

      return { message: "Webinar 更新成功" };
    }),

  // 删除 Webinar
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 检查 Webinar 是否存在且属于当前用户
      const existing = await db
        .select()
        .from(webinars)
        .where(eq(webinars.id, input.id))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webinar 不存在",
        });
      }

      if (existing[0].createdById !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "您没有权限删除此 Webinar",
        });
      }

      // 软删除
      await db
        .update(webinars)
        .set({ deletedAt: new Date() })
        .where(eq(webinars.id, input.id));

      return { message: "Webinar 删除成功" };
    }),

  // ─── 用户报名 Webinar ────────────────────────────────────────────────────
  register: protectedProcedure
    .input(z.object({ webinarId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 检查 Webinar 是否存在
      const webinar = await db
        .select()
        .from(webinars)
        .where(eq(webinars.id, input.webinarId))
        .limit(1);
      if (!webinar.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webinar 不存在" });
      }
      if (webinar[0].status === "completed" || webinar[0].status === "cancelled") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "该 Webinar 已结束，无法报名" });
      }

      // 检查是否已报名
      const existing = await db
        .select()
        .from(webinarParticipants)
        .where(
          and(
            eq(webinarParticipants.webinarId, input.webinarId),
            eq(webinarParticipants.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        if (existing[0].status === "declined") {
          // 重新激活
          await db
            .update(webinarParticipants)
            .set({ status: "accepted", invitedAt: new Date() })
            .where(eq(webinarParticipants.id, existing[0].id));
          return { success: true, message: "报名成功" };
        }
        throw new TRPCError({ code: "CONFLICT", message: "您已报名此 Webinar" });
      }

      // 检查人数上限
      if (webinar[0].maxParticipants) {
        const count = await db
          .select({ count: sql<number>`count(*)` })
          .from(webinarParticipants)
          .where(
            and(
              eq(webinarParticipants.webinarId, input.webinarId),
              sql`${webinarParticipants.status} IN ('accepted', 'joined')`
            )
          );
        if (count[0].count >= webinar[0].maxParticipants) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "该 Webinar 已满员" });
        }
      }

      // 插入报名记录
      await db.insert(webinarParticipants).values({
        webinarId: input.webinarId,
        userId: ctx.user.id,
        role: "participant",
        status: "accepted",
        invitedAt: new Date(),
      });

      // 更新 currentParticipants 计数
      await db
        .update(webinars)
        .set({ currentParticipants: sql`${webinars.currentParticipants} + 1` })
        .where(eq(webinars.id, input.webinarId));

      return { success: true, message: "报名成功" };
    }),

  // ─── 用户取消报名 Webinar ─────────────────────────────────────────────────
  unregister: protectedProcedure
    .input(z.object({ webinarId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      const existing = await db
        .select()
        .from(webinarParticipants)
        .where(
          and(
            eq(webinarParticipants.webinarId, input.webinarId),
            eq(webinarParticipants.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!existing.length || existing[0].status === "declined") {
        throw new TRPCError({ code: "NOT_FOUND", message: "您尚未报名此 Webinar" });
      }

      await db
        .update(webinarParticipants)
        .set({ status: "declined" })
        .where(eq(webinarParticipants.id, existing[0].id));

      await db
        .update(webinars)
        .set({ currentParticipants: sql`GREATEST(0, ${webinars.currentParticipants} - 1)` })
        .where(eq(webinars.id, input.webinarId));

      return { success: true, message: "已取消报名" };
    }),

  // ─── 检查用户是否已报名 ───────────────────────────────────────────────────
  checkRegistration: protectedProcedure
    .input(z.object({ webinarId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      const existing = await db
        .select()
        .from(webinarParticipants)
        .where(
          and(
            eq(webinarParticipants.webinarId, input.webinarId),
            eq(webinarParticipants.userId, ctx.user.id),
            sql`${webinarParticipants.status} IN ('accepted', 'joined')`
          )
        )
        .limit(1);

      return {
        isRegistered: existing.length > 0,
        participant: existing[0] || null,
      };
    }),
});
