/**
 * 数据库错误处理工具
 * 统一处理数据库查询错误，提供友好的错误信息
 */

import { TRPCError } from "@trpc/server";
import { logger } from "../logger.js";

/**
 * 包装数据库查询，自动处理错误
 */
export async function safeDbQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    operation: string;
    fallback?: T;
    throwError?: boolean;
  }
): Promise<T> {
  const { operation, fallback, throwError = false } = options;

  try {
    return await queryFn();
  } catch (error) {
    logger.error({ operation, error }, 'Database query failed');

    if (throwError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `${operation}失败，请稍后重试`,
        cause: error,
      });
    }

    if (fallback !== undefined) {
      return fallback;
    }

    throw error;
  }
}

/**
 * 批量查询，支持部分失败
 */
export async function batchDbQuery<T>(
  queries: Array<{
    fn: () => Promise<T>;
    fallback: T;
    name: string;
  }>
): Promise<T[]> {
  return Promise.all(
    queries.map(async ({ fn, fallback, name }) => {
      try {
        return await fn();
      } catch (error) {
        logger.warn({ name, error }, 'Batch query item failed');
        return fallback;
      }
    })
  );
}

/**
 * 检查数据库连接
 */
export async function checkDbConnection(db: any): Promise<boolean> {
  try {
    await db.execute('SELECT 1' as any);
    return true;
  } catch (error) {
    logger.error({ error }, 'Database connection check failed');
    return false;
  }
}
