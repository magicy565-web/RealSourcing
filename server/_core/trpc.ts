import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '../../shared/const.js';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context.js";
import { logger, logApiRequest, logApiError } from '../logger.js';

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // 增强错误信息
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
        message: error.message,
        // 在开发环境下返回堆栈信息
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
    };
  },
});

/**
 * 日志中间件：记录所有 API 请求和错误
 */
const loggingMiddleware = t.middleware(async ({ path, type, ctx, next }) => {
  const start = Date.now();
  
  try {
    const result = await next();
    const durationMs = Date.now() - start;

    // 记录成功的请求
    logApiRequest({
      path,
      type,
      durationMs,
      userId: ctx.user?.id,
    });

    return result;
  } catch (error) {
    const durationMs = Date.now() - start;

    // 记录失败的请求
    logApiError({
      path,
      type,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        code: error instanceof TRPCError ? error.code : 'UNKNOWN',
      } : error,
      userId: ctx.user?.id,
    });

    throw error;
  }
});

export const router = t.router;

/**
 * 公开的 procedure，任何人都可以访问
 * 包含日志中间件
 */
export const publicProcedure = t.procedure.use(loggingMiddleware);

/**
 * 需要认证的中间件
 */
const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * 受保护的 procedure，需要用户登录
 * 包含日志中间件和认证中间件
 */
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(requireUser);

/**
 * 管理员 procedure，需要管理员权限
 * 包含日志中间件和管理员认证中间件
 */
export const adminProcedure = t.procedure
  .use(loggingMiddleware)
  .use(
    t.middleware(async opts => {
      const { ctx, next } = opts;

      if (!ctx.user || ctx.user.role !== 'admin') {
        throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
      }

      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    }),
  );
