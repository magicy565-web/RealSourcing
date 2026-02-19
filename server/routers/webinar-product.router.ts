import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { webinarProducts, factoryProducts, webinars } from "../../drizzle/schema.js";
import { eq, and, inArray } from "drizzle-orm";

export const webinarProductRouter = router({
  // 获取 Webinar 的产品列表（公开访问）
  listByWebinar: publicProcedure
    .input(
      z.object({
        webinarId: z.number(),
        includeDetails: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 获取 webinar_products 关联记录
      const webinarProductLinks = await db
        .select()
        .from(webinarProducts)
        .where(eq(webinarProducts.webinarId, input.webinarId))
        .orderBy(webinarProducts.displayOrder);

      if (!input.includeDetails || webinarProductLinks.length === 0) {
        return webinarProductLinks;
      }

      // 获取产品详情
      const productIds = webinarProductLinks.map((wp) => wp.productId);
      const products = await db
        .select()
        .from(factoryProducts)
        .where(
          and(
            inArray(factoryProducts.id, productIds),
            eq(factoryProducts.status, "published")
          )
        );

      // 合并数据
      return webinarProductLinks.map((wp) => {
        const product = products.find((p) => p.id === wp.productId);
        return {
          ...wp,
          product,
        };
      });
    }),

  // 添加产品到 Webinar（需要认证）
  addProduct: protectedProcedure
    .input(
      z.object({
        webinarId: z.number(),
        productId: z.number(),
        displayOrder: z.number().default(0),
        featured: z.boolean().default(false),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 验证 Webinar 是否存在且用户有权限
      const webinar = await db
        .select()
        .from(webinars)
        .where(eq(webinars.id, input.webinarId))
        .limit(1);

      if (webinar.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webinar 不存在" });
      }

      // 检查用户是否是 Webinar 创建者或管理员
      if (webinar[0].createdById !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权操作此 Webinar" });
      }

      // 验证产品是否存在
      const product = await db
        .select()
        .from(factoryProducts)
        .where(eq(factoryProducts.id, input.productId))
        .limit(1);

      if (product.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "产品不存在" });
      }

      // 检查是否已经关联
      const existing = await db
        .select()
        .from(webinarProducts)
        .where(
          and(
            eq(webinarProducts.webinarId, input.webinarId),
            eq(webinarProducts.productId, input.productId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "产品已添加到此 Webinar" });
      }

      // 插入关联记录
      const result = await db.insert(webinarProducts).values({
        webinarId: input.webinarId,
        productId: input.productId,
        displayOrder: input.displayOrder,
        featured: input.featured ? 1 : 0,
        notes: input.notes,
      });

      return {
        success: true,
        id: result[0].insertId,
      };
    }),

  // 批量添加产品到 Webinar
  addProducts: protectedProcedure
    .input(
      z.object({
        webinarId: z.number(),
        productIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 验证 Webinar 权限
      const webinar = await db
        .select()
        .from(webinars)
        .where(eq(webinars.id, input.webinarId))
        .limit(1);

      if (webinar.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webinar 不存在" });
      }

      if (webinar[0].createdById !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权操作此 Webinar" });
      }

      // 获取已存在的关联
      const existing = await db
        .select()
        .from(webinarProducts)
        .where(eq(webinarProducts.webinarId, input.webinarId));

      const existingProductIds = new Set(existing.map((wp) => wp.productId));

      // 过滤出需要新增的产品
      const newProductIds = input.productIds.filter((id) => !existingProductIds.has(id));

      if (newProductIds.length === 0) {
        return { success: true, added: 0, message: "所有产品已存在" };
      }

      // 批量插入
      const values = newProductIds.map((productId, index) => ({
        webinarId: input.webinarId,
        productId,
        displayOrder: existing.length + index,
        featured: 0,
      }));

      await db.insert(webinarProducts).values(values);

      return {
        success: true,
        added: newProductIds.length,
      };
    }),

  // 从 Webinar 移除产品
  removeProduct: protectedProcedure
    .input(
      z.object({
        webinarId: z.number(),
        productId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 验证权限
      const webinar = await db
        .select()
        .from(webinars)
        .where(eq(webinars.id, input.webinarId))
        .limit(1);

      if (webinar.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webinar 不存在" });
      }

      if (webinar[0].createdById !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权操作此 Webinar" });
      }

      // 删除关联
      await db
        .delete(webinarProducts)
        .where(
          and(
            eq(webinarProducts.webinarId, input.webinarId),
            eq(webinarProducts.productId, input.productId)
          )
        );

      return { success: true };
    }),

  // 更新产品在 Webinar 中的显示顺序
  updateDisplayOrder: protectedProcedure
    .input(
      z.object({
        webinarId: z.number(),
        productOrders: z.array(
          z.object({
            productId: z.number(),
            displayOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 验证权限
      const webinar = await db
        .select()
        .from(webinars)
        .where(eq(webinars.id, input.webinarId))
        .limit(1);

      if (webinar.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webinar 不存在" });
      }

      if (webinar[0].createdById !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权操作此 Webinar" });
      }

      // 批量更新显示顺序
      for (const item of input.productOrders) {
        await db
          .update(webinarProducts)
          .set({ displayOrder: item.displayOrder })
          .where(
            and(
              eq(webinarProducts.webinarId, input.webinarId),
              eq(webinarProducts.productId, item.productId)
            )
          );
      }

      return { success: true };
    }),

  // 设置/取消产品为精选
  toggleFeatured: protectedProcedure
    .input(
      z.object({
        webinarId: z.number(),
        productId: z.number(),
        featured: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });

      // 验证权限
      const webinar = await db
        .select()
        .from(webinars)
        .where(eq(webinars.id, input.webinarId))
        .limit(1);

      if (webinar.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webinar 不存在" });
      }

      if (webinar[0].createdById !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权操作此 Webinar" });
      }

      // 更新 featured 状态
      await db
        .update(webinarProducts)
        .set({ featured: input.featured ? 1 : 0 })
        .where(
          and(
            eq(webinarProducts.webinarId, input.webinarId),
            eq(webinarProducts.productId, input.productId)
          )
        );

      return { success: true };
    }),
});
