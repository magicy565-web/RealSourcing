/**
 * Admin User Management Router
 * 管理员用户管理路由
 */

import { z } from "zod";
import { router, adminProcedure } from "../../_core/trpc.js";
import { getDb } from "../../db.js";
import { users, userProfiles, buyerProfiles, userBehaviorEvents } from "../../../drizzle/schema.js";
import { eq, and, or, like, desc, sql, count } from "drizzle-orm";

export const adminUserRouter = router({
  /**
   * 获取用户列表 (分页、筛选、搜索)
   */
  list: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        role: z.enum(["user", "buyer", "factory", "admin"]).optional(),
        status: z.enum(["active", "suspended", "deleted"]).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const { page, pageSize, role, status, search } = input;
      const offset = (page - 1) * pageSize;

      // 构建查询条件
      const conditions = [];
      if (role) {
        conditions.push(eq(users.role, role));
      }
      if (status) {
        conditions.push(eq(users.status, status));
      }
      if (search) {
        conditions.push(
          or(
            like(users.name, `%${search}%`),
            like(users.email, `%${search}%`)
          )
        );
      }

      // 查询用户列表
      const userList = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
        })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(pageSize)
        .offset(offset);

      // 查询总数
      const [{ total }] = await db
        .select({ total: count() })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        items: userList,
        total: Number(total),
        page,
        pageSize,
        totalPages: Math.ceil(Number(total) / pageSize),
      };
    }),

  /**
   * 获取用户详情 (含画像和行为数据)
   */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      // 获取用户基础信息
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id));

      if (!user) {
        throw new Error("User not found");
      }

      // 获取用户资料
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, input.id));

      // 如果是买家,获取买家画像
      let buyerProfile = null;
      if (user.role === "buyer") {
        [buyerProfile] = await db
          .select()
          .from(buyerProfiles)
          .where(eq(buyerProfiles.userId, input.id));
      }

      // 获取最近行为事件 (最近 50 条)
      const recentEvents = await db
        .select()
        .from(userBehaviorEvents)
        .where(eq(userBehaviorEvents.userId, input.id))
        .orderBy(desc(userBehaviorEvents.timestamp))
        .limit(50);

      // 统计行为数据
      const [behaviorStats] = await db
        .select({
          totalEvents: count(),
          pageViews: sql<number>`SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END)`,
          productViews: sql<number>`SUM(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END)`,
          webinarJoins: sql<number>`SUM(CASE WHEN event_type = 'webinar_join' THEN 1 ELSE 0 END)`,
        })
        .from(userBehaviorEvents)
        .where(eq(userBehaviorEvents.userId, input.id));

      return {
        user,
        profile,
        buyerProfile,
        recentEvents,
        behaviorStats,
      };
    }),

  /**
   * 更新用户状态
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["active", "suspended", "deleted"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const { id, status, reason } = input;

      // 更新用户状态
      await db
        .update(users)
        .set({ status })
        .where(eq(users.id, id));

      // TODO: 记录审计日志
      // await db.insert(auditLogs).values({
      //   userId: ctx.user.id,
      //   action: 'update_user_status',
      //   entityType: 'user',
      //   entityId: id,
      //   changes: { status, reason },
      // });

      return { success: true };
    }),

  /**
   * 批量更新用户状态
   */
  batchUpdate: adminProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        action: z.enum(["activate", "suspend", "delete"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const { ids, action } = input;

      const statusMap = {
        activate: "active",
        suspend: "suspended",
        delete: "deleted",
      } as const;

      const status = statusMap[action];

      // 批量更新
      for (const id of ids) {
        await db
          .update(users)
          .set({ status })
          .where(eq(users.id, id));
      }

      return { success: true, updated: ids.length };
    }),

  /**
   * 获取用户统计
   */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    // 按角色统计
    const byRole = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role);

    // 按状态统计
    const byStatus = await db
      .select({
        status: users.status,
        count: count(),
      })
      .from(users)
      .groupBy(users.status);

    // 最近 30 天新用户
    const [{ newUsers }] = await db
      .select({
        newUsers: count(),
      })
      .from(users)
      .where(sql`${users.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);

    // 最近 7 天活跃用户
    const [{ activeUsers }] = await db
      .select({
        activeUsers: count(),
      })
      .from(users)
      .where(sql`${users.lastLoginAt} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);

    return {
      byRole: byRole.map((r) => ({ role: r.role, count: Number(r.count) })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
      newUsersLast30Days: Number(newUsers),
      activeUsersLast7Days: Number(activeUsers),
    };
  }),
});
