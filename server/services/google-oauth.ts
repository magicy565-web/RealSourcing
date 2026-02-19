/**
 * Google OAuth 2.0 服务
 * 提供稳定的 Google 登录集成
 */

import axios from 'axios';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

export class GoogleOAuthService {
  private config: GoogleOAuthConfig;

  constructor(config: GoogleOAuthConfig) {
    this.config = config;
  }

  /**
   * 生成 Google OAuth 授权 URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state }),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * 使用授权码交换访问令牌
   */
  async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    try {
      const response = await axios.post<GoogleTokenResponse>(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('[Google OAuth] Token exchange failed:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get<GoogleUserInfo>(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('[Google OAuth] Get user info failed:', error.response?.data || error.message);
      throw new Error('Failed to get user information from Google');
    }
  }

  /**
   * 验证 ID Token（可选，用于额外的安全验证）
   */
  async verifyIdToken(idToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      );

      if (response.data.aud !== this.config.clientId) {
        throw new Error('Invalid ID token audience');
      }

      return response.data;
    } catch (error: any) {
      console.error('[Google OAuth] ID token verification failed:', error.response?.data || error.message);
      throw new Error('Failed to verify ID token');
    }
  }
}

// 创建单例实例
let googleOAuthService: GoogleOAuthService | null = null;

export function getGoogleOAuthService(): GoogleOAuthService {
  if (!googleOAuthService) {
    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    };

    if (!config.clientId || !config.clientSecret) {
      console.warn('[Google OAuth] Missing configuration. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }

    googleOAuthService = new GoogleOAuthService(config);
  }

  return googleOAuthService;
}
