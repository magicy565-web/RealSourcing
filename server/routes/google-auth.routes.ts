/**
 * Google OAuth 认证路由
 * 提供 Google 登录的完整流程
 */

import { Router } from 'express';
import { getGoogleOAuthService } from '../services/google-oauth.js';
import { upsertUser, getUserByEmail } from '../db.js';
import { signToken } from '../_core/auth.js';
import { setAuthCookie } from '../_core/cookies.js';

const router = Router();

/**
 * 发起 Google OAuth 登录
 * GET /api/auth/google
 */
router.get('/google', (req, res) => {
  try {
    const googleOAuth = getGoogleOAuthService();
    
    // 生成 state 参数用于防止 CSRF 攻击
    const state = Buffer.from(JSON.stringify({
      timestamp: Date.now(),
      returnUrl: req.query.returnUrl || '/',
    })).toString('base64');

    const authUrl = googleOAuth.getAuthorizationUrl(state);
    
    console.log('[Google Auth] Redirecting to Google OAuth:', authUrl);
    res.redirect(authUrl);
  } catch (error: any) {
    console.error('[Google Auth] Failed to initiate OAuth:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate Google login' 
    });
  }
});

/**
 * Google OAuth 回调处理
 * GET /api/auth/google/callback
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    // 处理用户拒绝授权的情况
    if (error) {
      console.error('[Google Auth] User denied access:', error);
      return res.redirect('/?error=access_denied');
    }

    if (!code || typeof code !== 'string') {
      console.error('[Google Auth] Missing authorization code');
      return res.redirect('/?error=missing_code');
    }

    const googleOAuth = getGoogleOAuthService();

    // 1. 交换授权码获取访问令牌
    console.log('[Google Auth] Exchanging code for token...');
    const tokenResponse = await googleOAuth.exchangeCodeForToken(code);

    // 2. 使用访问令牌获取用户信息
    console.log('[Google Auth] Fetching user info...');
    const userInfo = await googleOAuth.getUserInfo(tokenResponse.access_token);

    console.log('[Google Auth] User info received:', {
      email: userInfo.email,
      name: userInfo.name,
      verified: userInfo.verified_email,
    });

    // 3. 检查邮箱是否已验证
    if (!userInfo.verified_email) {
      console.warn('[Google Auth] Email not verified:', userInfo.email);
      return res.redirect('/?error=email_not_verified');
    }

    // 4. 在数据库中创建或更新用户
    const existingUser = await getUserByEmail(userInfo.email);
    
    const userData = {
      openId: `google_${userInfo.id}`,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.picture,
      loginMethod: 'google',
      status: 'active' as const,
      emailVerified: 1,
      role: existingUser?.role || 'buyer' as const, // 新用户默认为 buyer
    };

    const user = await upsertUser(userData);

    if (!user) {
      throw new Error('Failed to create or update user');
    }

    console.log('[Google Auth] User upserted:', user.email);

    // 5. 生成 JWT 令牌并设置 Cookie
    const token = await signToken({ 
      openId: user.openId, 
      name: user.name || undefined 
    });
    
    setAuthCookie(res, token);

    // 6. 解析 state 参数，重定向到原始页面
    let returnUrl = '/';
    if (state && typeof state === 'string') {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        returnUrl = stateData.returnUrl || '/';
      } catch (e) {
        console.warn('[Google Auth] Failed to parse state:', e);
      }
    }

    console.log('[Google Auth] Login successful, redirecting to:', returnUrl);
    res.redirect(returnUrl);
  } catch (error: any) {
    console.error('[Google Auth] Callback error:', error);
    res.redirect('/?error=login_failed');
  }
});

/**
 * 获取 Google OAuth 配置状态（用于前端检查）
 * GET /api/auth/google/status
 */
router.get('/google/status', (req, res) => {
  const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  
  res.json({
    success: true,
    configured: isConfigured,
    clientId: process.env.GOOGLE_CLIENT_ID ? '***' + process.env.GOOGLE_CLIENT_ID.slice(-4) : null,
  });
});

export default router;
