import { getUserByOpenId, upsertUser } from '../db.js';
import { signToken } from './auth.js';
import { setAuthCookie } from './cookies.js';

export function registerOAuthRoutes(app: any) {
  // GitHub OAuth Callback
  app.get('/api/auth/github/callback', async (req: any, res: any) => {
    const githubClientId = process.env.GITHUB_CLIENT_ID || '';
    const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || '';
    const frontendUrl = process.env.FRONTEND_URL || '/';

    const { code } = req.query;
    if (!code) {
      return res.status(400).send('Missing code');
    }

    try {
      // 1. Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code,
        }),
      });

      const tokenData: any = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return res.status(401).send('Failed to get access token');
      }

      // 2. Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${accessToken}`,
          'User-Agent': 'RealSourcing-App'
        },
      });

      const githubUser: any = await userResponse.json();
      const openId = `github:${githubUser.id}`;

      // 3. Upsert user in database
      let user = await getUserByOpenId(openId);
      const userData = {
        openId,
        name: githubUser.name || githubUser.login,
        email: githubUser.email,
        loginMethod: 'github' as const,
      };

      await upsertUser(userData);
      user = await getUserByOpenId(openId);

      if (!user) {
        return res.status(500).send('Failed to create user');
      }

      // 4. Sign token and set cookie
      const token = await signToken({ openId: user.openId, name: user.name || undefined });
      setAuthCookie(res, token);

      // 5. Redirect back to frontend
      res.redirect(frontendUrl);
    } catch (error) {
      console.error('OAuth Error:', error);
      res.status(500).send('Authentication failed');
    }
  });
}

// 保持旧函数名兼容性（如果其他地方用到）
export const setupOAuth = registerOAuthRoutes;
