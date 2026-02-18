/**
 * 统一的日志系统
 * 使用 pino 库记录结构化的 JSON 日志
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
});

/**
 * 记录 API 请求
 */
export function logApiRequest(data: {
  path: string;
  type: string;
  durationMs: number;
  userId?: number;
}) {
  logger.info(data, 'API Request');
}

/**
 * 记录 API 错误
 */
export function logApiError(data: {
  path: string;
  type: string;
  error: any;
  userId?: number;
}) {
  logger.error(data, 'API Error');
}

/**
 * 记录数据库查询
 */
export function logDbQuery(data: {
  query: string;
  durationMs: number;
  error?: any;
}) {
  if (data.error) {
    logger.error(data, 'Database Query Error');
  } else {
    logger.debug(data, 'Database Query');
  }
}

/**
 * 记录认证事件
 */
export function logAuthEvent(data: {
  event: 'login' | 'logout' | 'register' | 'token_verify';
  userId?: number;
  email?: string;
  success: boolean;
  error?: any;
}) {
  if (data.success) {
    logger.info(data, 'Auth Event');
  } else {
    logger.warn(data, 'Auth Event Failed');
  }
}
