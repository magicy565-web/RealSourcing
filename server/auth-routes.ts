import { Router } from 'express';
import { hashPassword, verifyPassword } from './_core/password.js';
import { signToken } from './_core/auth.js';
import { setAuthCookie } from './_core/cookies.js';
import { getUserByEmail, upsertUser } from './db.js';
import { requireAuth } from './middleware/auth.js';
import { COOKIE_NAME } from '../shared/const.js';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  console.log('[Auth] Register request received:', { email: req.body.email, name: req.body.name });
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user
    const user = await upsertUser({
      openId: email,
      email,
      name,
      role,
      passwordHash,
      status: 'active',
      emailVerified: 0,
    });

    if (!user) {
      throw new Error('Failed to create user record');
    }

    // Generate token and set cookie
    const token = await signToken({ openId: user.openId, name: user.name || undefined });
    setAuthCookie(res, token);

    console.log('[Auth] Register success:', user.email);
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Register error:', error);
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await getUserByEmail(email);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token and set cookie
    const token = await signToken({ openId: user.openId, name: user.name || undefined });
    setAuthCookie(res, token);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
});

// Get current user endpoint (protected)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Get user error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get user info' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('[Auth] Logout error:', error);
    return res.status(500).json({ message: error.message || 'Logout failed' });
  }
});

export default router;
