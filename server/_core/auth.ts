import { sdk } from './sdk.js';

/**
 * 为用户生成 JWT 会话令牌
 */
export async function signToken(payload: { openId: string; name?: string }): Promise<string> {
  // signSession returns a Promise<string>, so we need to await it
  return await (sdk as any).signSession({
    openId: payload.openId,
    appId: (process.env as any).APP_ID || 'realsourcing',
    name: payload.name || 'User'
  });
}
