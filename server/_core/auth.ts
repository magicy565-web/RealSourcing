import { sdk } from './sdk.js';

/**
 * 为用户生成 JWT 会话令牌
 */
export async function signToken(payload: { openId: string; name?: string }): Promise<string> {
  // signSession returns a Promise<string>, so we need to await it
  return await (sdk as any).signSession({
    openId: payload.openId,
    appId: sdk.appId,
    name: payload.name || 'User'
  });
}
