import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { hashPassword, verifyPassword, signToken } from '../utils/security';

export const authRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, handle, platform = 'both' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanHandle = handle 
      ? (handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`) 
      : `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.'
      });
    }

    const passwordHash = hashPassword(password);
    const userId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, handle, platform, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name.trim(),
      cleanEmail,
      passwordHash,
      cleanHandle,
      platform,
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      now
    );

    const token = signToken({ userId, email: cleanEmail, handle: cleanHandle });

    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      handle: cleanHandle,
      platform,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      created_at: now
    };

    res.status(201).json({
      success: true,
      token,
      user: newUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Both email and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const token = signToken({ userId: user.id, email: user.email, handle: user.handle });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      handle: user.handle,
      platform: user.platform,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    };

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/me (Current creator session)
authRouter.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, name, email, handle, platform, avatar_url, created_at FROM users WHERE id = ?').get(req.userId) as any;

    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/demo-creators (Sanitized list for 1-click test logins)
authRouter.get('/demo-creators', (_req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT id, name, email, handle, platform, avatar_url FROM users LIMIT 5').all();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
