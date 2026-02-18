/**
 * 健康检查路由
 * 用于监控后端服务状态
 */

import { router, publicProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { config } from "../config.js";

export const healthRouter = router({
  /**
   * 基础健康检查
   */
  check: publicProcedure.query(async () => {
    const startTime = Date.now();
    
    // 检查数据库连接
    let dbStatus = 'unknown';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      const db = await getDb();
      if (db) {
        await db.execute('SELECT 1' as any);
        dbLatency = Date.now() - dbStart;
        dbStatus = 'healthy';
      } else {
        dbStatus = 'unavailable';
      }
    } catch (error) {
      dbStatus = 'error';
    }
    
    const totalLatency = Date.now() - startTime;
    
    return {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || 'unknown',
      checks: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
      },
      latency: `${totalLatency}ms`,
    };
  }),
  
  /**
   * 详细的系统信息
   */
  info: publicProcedure.query(() => {
    return {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
      uptime: `${Math.round(process.uptime() / 60)}m`,
    };
  }),
});
