/**
 * Admin Analytics Router
 * 管理员数据分析路由
 */

import { z } from "zod";
import { router, adminProcedure } from "../../_core/trpc.js";
import { getDb } from "../../db.js";
import { 
  users, 
  webinars, 
  factoryProducts,
  orders,
  userBehaviorEvents,
} from "../../../drizzle/schema.js";
import { eq, and, desc, count, sql } from "drizzle-orm";

export const adminAnalyticsRouter = router({
  /**
   * 获取综合数据面板
   */
  getDashboard: adminProcedure
    .input(
      z.object({
        dateRange: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const { dateRange } = input;

      // 计算日期范围
      const daysMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
      const days = daysMap[dateRange];

      // 核心指标
      const [{ totalUsers }] = await db
        .select({ totalUsers: count() })
        .from(users);

      const [{ totalWebinars }] = await db
        .select({ totalWebinars: count() })
        .from(webinars);

      const [{ totalProducts }] = await db
        .select({ totalProducts: count() })
        .from(factoryProducts);

      const [{ totalRevenue }] = await db
        .select({ 
          totalRevenue: sql<number>`COALESCE(SUM(total_amount), 0)` 
        })
        .from(orders)
        .where(eq(orders.status, "completed"));

      const [{ activeUsers }] = await db
        .select({ activeUsers: count() })
        .from(users)
        .where(sql`${users.lastLoginAt} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);

      const [{ liveWebinars }] = await db
        .select({ liveWebinars: count() })
        .from(webinars)
        .where(eq(webinars.status, "live"));

      // 趋势数据 - 用户增长
      const userGrowth = await db
        .select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: count(),
        })
        .from(users)
        .where(sql`${users.createdAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`)
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);

      // 趋势数据 - 会议增长
      const webinarGrowth = await db
        .select({
          date: sql<string>`DATE(${webinars.createdAt})`,
          count: count(),
        })
        .from(webinars)
        .where(sql`${webinars.createdAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`)
        .groupBy(sql`DATE(${webinars.createdAt})`)
        .orderBy(sql`DATE(${webinars.createdAt})`);

      // 趋势数据 - 收入趋势
      const revenueTrend = await db
        .select({
          date: sql<string>`DATE(${orders.createdAt})`,
          revenue: sql<number>`SUM(total_amount)`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.status, "completed"),
            sql`${orders.createdAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`
          )
        )
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      // 漏斗数据 - 需要基于 user_behavior_events 表
      // 这里使用简化版本
      const [{ registered }] = await db
        .select({ registered: count() })
        .from(users)
        .where(sql`${users.createdAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`);

      // TODO: 完善漏斗数据
      const funnel = {
        registered: Number(registered),
        attended: Math.floor(Number(registered) * 0.8), // 示例数据
        favorited: Math.floor(Number(registered) * 0.4),
        inquired: Math.floor(Number(registered) * 0.2),
        ordered: Math.floor(Number(registered) * 0.05),
      };

      return {
        metrics: {
          totalUsers: Number(totalUsers),
          totalWebinars: Number(totalWebinars),
          totalProducts: Number(totalProducts),
          totalRevenue: Number(totalRevenue) || 0,
          activeUsers: Number(activeUsers),
          liveWebinars: Number(liveWebinars),
        },
        trends: {
          userGrowth: userGrowth.map((item) => ({
            date: item.date,
            count: Number(item.count),
          })),
          webinarGrowth: webinarGrowth.map((item) => ({
            date: item.date,
            count: Number(item.count),
          })),
          revenueTrend: revenueTrend.map((item) => ({
            date: item.date,
            revenue: Number(item.revenue) || 0,
          })),
        },
        funnel,
      };
    }),

  /**
   * 获取用户分析
   */
  getUserAnalytics: adminProcedure.query(async () => {
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
      .select({ newUsers: count() })
      .from(users)
      .where(sql`${users.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);

    // 最近 7 天活跃用户
    const [{ activeUsers }] = await db
      .select({ activeUsers: count() })
      .from(users)
      .where(sql`${users.lastLoginAt} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);

    return {
      byRole: byRole.map((r) => ({ role: r.role, count: Number(r.count) })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
      newUsersLast30Days: Number(newUsers),
      activeUsersLast7Days: Number(activeUsers),
    };
  }),

  /**
   * 获取会议分析
   */
  getWebinarAnalytics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    // 按状态统计
    const byStatus = await db
      .select({
        status: webinars.status,
        count: count(),
      })
      .from(webinars)
      .groupBy(webinars.status);

    // 平均注册人数
    const [{ avgRegistrations }] = await db
      .select({
        avgRegistrations: sql<number>`AVG(registration_count)`,
      })
      .from(webinars);

    // 平均出席人数
    const [{ avgAttendance }] = await db
      .select({
        avgAttendance: sql<number>`AVG(attendance_count)`,
      })
      .from(webinars);

    // 平均评分
    const [{ avgRating }] = await db
      .select({
        avgRating: sql<number>`AVG(average_rating)`,
      })
      .from(webinars)
      .where(sql`average_rating > 0`);

    // 按行业统计
    const byIndustry = await db
      .select({
        industry: webinars.industry,
        count: count(),
      })
      .from(webinars)
      .where(sql`industry IS NOT NULL`)
      .groupBy(webinars.industry)
      .orderBy(desc(count()))
      .limit(10);

    return {
      byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
      avgRegistrations: Number(avgRegistrations) || 0,
      avgAttendance: Number(avgAttendance) || 0,
      avgRating: Number(avgRating) || 0,
      topIndustries: byIndustry.map((i) => ({
        industry: i.industry,
        count: Number(i.count),
      })),
    };
  }),

  /**
   * 获取产品分析
   */
  getProductAnalytics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    // 按状态统计
    const byStatus = await db
      .select({
        status: factoryProducts.status,
        count: count(),
      })
      .from(factoryProducts)
      .groupBy(factoryProducts.status);

    // 总浏览量
    const [{ totalViews }] = await db
      .select({
        totalViews: sql<number>`SUM(view_count)`,
      })
      .from(factoryProducts);

    // 总收藏量
    const [{ totalFavorites }] = await db
      .select({
        totalFavorites: sql<number>`SUM(favorite_count)`,
      })
      .from(factoryProducts);

    // 总询价量
    const [{ totalInquiries }] = await db
      .select({
        totalInquiries: sql<number>`SUM(inquiry_count)`,
      })
      .from(factoryProducts);

    return {
      byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
      totalViews: Number(totalViews) || 0,
      totalFavorites: Number(totalFavorites) || 0,
      totalInquiries: Number(totalInquiries) || 0,
    };
  }),
});
