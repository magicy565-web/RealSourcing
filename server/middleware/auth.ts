import { Request, Response, NextFunction } from 'express';
import { sdk } from '../_core/sdk.js';

/**
 * 认证中间件 - 要求用户必须登录
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await sdk.authenticateRequest(req);
    
    if (!user) {
      return (res as any).status(401).json({ error: 'Authentication required' });
    }
    
    // 将用户信息附加到request对象上
    (req as any).user = user;
    (next as any)();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return (res as any).status(401).json({ error: 'Invalid or expired session' });
  }
};

/**
 * 可选认证中间件 - 如果有token则验证，但不强制要求登录
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await sdk.authenticateRequest(req);
    (req as any).user = user || null;
  } catch (error) {
    (req as any).user = null;
  }
  (next as any)();
};
