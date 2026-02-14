import { sdk } from './sdk';

/**
 * 为用户生成 JWT 会话令牌
 */
export function signToken(payload: { userId: number; role?: string | null }) {
  // 注意：sdk.createSessionToken 接收 openId，这里由于 OAuth 流程中已经有了 user 对象，
  // 我们使用 user.id 作为 openId 的占位符或者直接调用 sdk 的内部签名方法。
  // 为了兼容性，我们直接使用 sdk.signSession
  return (sdk as any).signSession({
    openId: payload.userId.toString(),
    appId: (process.env as any).APP_ID || 'realsourcing',
    name: 'User'
  });
}
