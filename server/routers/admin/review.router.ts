/**
 * Admin Review (Content Moderation) Router
 * 管理员内容审核路由
 */

import { z } from "zod";
import { router, adminProcedure } from "../../_core/trpc.js";
import { getDb } from "../../db.js";
import { 
  factories, 
  factoryProducts, 
  factoryCertifications 
} from "../../../drizzle/schema.js";
import { eq, and, desc, count } from "drizzle-orm";

export const adminReviewRouter = router({
  /**
   * 获取待审核列表
   */
  getPendingList: adminProcedure
    .input(
      z.object({
        type: z.enum(["factory", "product", "certification"]),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const { type, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      if (type === "factory") {
        // 查询待审核工厂
        const pendingFactories = await db
          .select()
          .from(factories)
          .where(eq(factories.status, "pending"))
          .orderBy(desc(factories.createdAt))
          .limit(pageSize)
          .offset(offset);

        const [{ total }] = await db
          .select({ total: count() })
          .from(factories)
          .where(eq(factories.status, "pending"));

        return {
          items: pendingFactories,
          total: Number(total),
          page,
          pageSize,
        };
      } else if (type === "product") {
        // 查询待审核产品
        const pendingProducts = await db
          .select()
          .from(factoryProducts)
          .where(eq(factoryProducts.status, "draft"))
          .orderBy(desc(factoryProducts.createdAt))
          .limit(pageSize)
          .offset(offset);

        const [{ total }] = await db
          .select({ total: count() })
          .from(factoryProducts)
          .where(eq(factoryProducts.status, "draft"));

        return {
          items: pendingProducts,
          total: Number(total),
          page,
          pageSize,
        };
      } else {
        // 查询待审核认证
        const pendingCerts = await db
          .select()
          .from(factoryCertifications)
          .where(eq(factoryCertifications.status, "pending"))
          .orderBy(desc(factoryCertifications.createdAt))
          .limit(pageSize)
          .offset(offset);

        const [{ total }] = await db
          .select({ total: count() })
          .from(factoryCertifications)
          .where(eq(factoryCertifications.status, "pending"));

        return {
          items: pendingCerts,
          total: Number(total),
          page,
          pageSize,
        };
      }
    }),

  /**
   * 审核通过
   */
  approve: adminProcedure
    .input(
      z.object({
        type: z.enum(["factory", "product", "certification"]),
        id: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const { type, id, notes } = input;

      if (type === "factory") {
        await db
          .update(factories)
          .set({ 
            status: "verified",
            verifiedAt: new Date(),
          })
          .where(eq(factories.id, id));
      } else if (type === "product") {
        await db
          .update(factoryProducts)
          .set({ status: "published" })
          .where(eq(factoryProducts.id, id));
      } else {
        await db
          .update(factoryCertifications)
          .set({ 
            status: "verified",
            verifiedAt: new Date(),
          })
          .where(eq(factoryCertifications.id, id));
      }

      // TODO: 记录审计日志
      // TODO: 发送通知给用户

      return { success: true };
    }),

  /**
   * 审核拒绝
   */
  reject: adminProcedure
    .input(
      z.object({
        type: z.enum(["factory", "product", "certification"]),
        id: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const { type, id, reason } = input;

      if (type === "factory") {
        await db
          .update(factories)
          .set({ 
            status: "rejected",
            // rejectionReason: reason, // 需要在 schema 中添加此字段
          })
          .where(eq(factories.id, id));
      } else if (type === "product") {
        await db
          .update(factoryProducts)
          .set({ status: "archived" })
          .where(eq(factoryProducts.id, id));
      } else {
        await db
          .update(factoryCertifications)
          .set({ status: "expired" }) // 使用 expired 表示被拒绝
          .where(eq(factoryCertifications.id, id));
      }

      // TODO: 记录审计日志
      // TODO: 发送通知给用户

      return { success: true };
    }),

  /**
   * 批量审核通过
   */
  batchApprove: adminProcedure
    .input(
      z.object({
        type: z.enum(["factory", "product", "certification"]),
        ids: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const { type, ids } = input;

      if (type === "factory") {
        for (const id of ids) {
          await db
            .update(factories)
            .set({ 
              status: "verified",
              verifiedAt: new Date(),
            })
            .where(eq(factories.id, id));
        }
      } else if (type === "product") {
        for (const id of ids) {
          await db
            .update(factoryProducts)
            .set({ status: "published" })
            .where(eq(factoryProducts.id, id));
        }
      } else {
        for (const id of ids) {
          await db
            .update(factoryCertifications)
            .set({ 
              status: "verified",
              verifiedAt: new Date(),
            })
            .where(eq(factoryCertifications.id, id));
        }
      }

      return { success: true, approved: ids.length };
    }),

  /**
   * 获取审核统计
   */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    // 待审核工厂数量
    const [{ pendingFactories }] = await db
      .select({ pendingFactories: count() })
      .from(factories)
      .where(eq(factories.status, "pending"));

    // 待审核产品数量
    const [{ pendingProducts }] = await db
      .select({ pendingProducts: count() })
      .from(factoryProducts)
      .where(eq(factoryProducts.status, "draft"));

    // 待审核认证数量
    const [{ pendingCertifications }] = await db
      .select({ pendingCertifications: count() })
      .from(factoryCertifications)
      .where(eq(factoryCertifications.status, "pending"));

    // 已验证工厂数量
    const [{ verifiedFactories }] = await db
      .select({ verifiedFactories: count() })
      .from(factories)
      .where(eq(factories.status, "verified"));

    return {
      pendingFactories: Number(pendingFactories),
      pendingProducts: Number(pendingProducts),
      pendingCertifications: Number(pendingCertifications),
      verifiedFactories: Number(verifiedFactories),
    };
  }),
});
