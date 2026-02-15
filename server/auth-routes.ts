import { Router } from 'express';
import { hashPassword, verifyPassword } from './_core/password';
import { signToken } from './_core/auth';
import { setAuthCookie } from './_core/cookies';
import { getUserByOpenId, upsertUser } from './db';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await getUserByOpenId(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
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

    // Generate token and set cookie
    const token = signToken({ userId: user.id, role: user.role });
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
    console.error('Register error:', error);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await getUserByOpenId(email);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token and set cookie
    const token = signToken({ userId: user.id, role: user.role });
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
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

export default router;
