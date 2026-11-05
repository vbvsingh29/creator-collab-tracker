import crypto from 'crypto';
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
      bio: user.bio || '',
      phone: user.phone || '',
      category: user.category || '',
      rates: user.rates_json ? JSON.parse(user.rates_json) : {},
      social_links: user.social_links_json ? JSON.parse(user.social_links_json) : {},
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
    const user = db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category, rates_json, social_links_json, created_at FROM users WHERE id = ?').get(req.userId) as any;

    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    res.json({
      success: true,
      user: {
        ...user,
        rates: user.rates_json ? JSON.parse(user.rates_json) : {},
        social_links: user.social_links_json ? JSON.parse(user.social_links_json) : {}
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/auth/profile (Update creator profile details)
authRouter.put('/profile', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      name,
      handle,
      platform,
      avatar_url,
      bio = '',
      phone = '',
      category = '',
      rates = {},
      social_links = {}
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const cleanHandle = handle ? (handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`) : '';

    db.prepare(`
      UPDATE users 
      SET name = ?, handle = ?, platform = ?, avatar_url = ?, bio = ?, phone = ?, category = ?, rates_json = ?, social_links_json = ?
      WHERE id = ?
    `).run(
      name.trim(),
      cleanHandle,
      platform || 'both',
      avatar_url || '',
      bio.trim(),
      phone.trim(),
      category.trim(),
      JSON.stringify(rates),
      JSON.stringify(social_links),
      userId
    );

    const updatedUser = db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category, rates_json, social_links_json, created_at FROM users WHERE id = ?').get(userId) as any;

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        ...updatedUser,
        rates: updatedUser.rates_json ? JSON.parse(updatedUser.rates_json) : {},
        social_links: updatedUser.social_links_json ? JSON.parse(updatedUser.social_links_json) : {}
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/demo-creators (Sanitized list for 1-click test logins)
authRouter.get('/demo-creators', (_req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category FROM users LIMIT 5').all();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT id, name FROM users WHERE email = ?').get(cleanEmail) as { id: string; name: string } | undefined;

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a 6-digit reset code has been sent.',
        preview_mode: false
      });
    }

    // Generate cryptographically secure 6-digit OTP code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = hashPassword(resetCode);
    const resetId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins validity

    // Invalidate any older reset codes for this email
    db.prepare('DELETE FROM password_resets WHERE email = ?').run(cleanEmail);

    // Save new reset record
    db.prepare(`
      INSERT INTO password_resets (id, email, code_hash, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(resetId, cleanEmail, codeHash, expiresAt, now.toISOString());

    console.log(`🔑 [CollabFlow Auth] Password reset OTP generated for ${cleanEmail}: ${resetCode} (valid for 15 mins)`);

    const hasEmailService = Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS));

    return res.json({
      success: true,
      message: hasEmailService 
        ? 'A 6-digit password reset code has been sent to your email.'
        : 'A 6-digit reset code has been generated. (Free Tier instant preview below)',
      preview_code: hasEmailService ? undefined : resetCode,
      preview_mode: !hasEmailService,
      expires_in_minutes: 15
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/verify-reset-code
authRouter.post('/verify-reset-code', (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();

    const record = db.prepare(`
      SELECT * FROM password_resets 
      WHERE email = ? AND expires_at > ?
      ORDER BY created_at DESC LIMIT 1
    `).get(cleanEmail, now) as any;

    if (!record || !verifyPassword(code.trim(), record.code_hash)) {
      return res.status(400).json({ success: false, error: 'Invalid or expired 6-digit reset code.' });
    }

    return res.json({ success: true, valid: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();

    const record = db.prepare(`
      SELECT * FROM password_resets 
      WHERE email = ? AND expires_at > ?
      ORDER BY created_at DESC LIMIT 1
    `).get(cleanEmail, now) as any;

    if (!record || !verifyPassword(code.trim(), record.code_hash)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset code. Please request a new code.'
      });
    }

    // Hash new password with scrypt NIST-compliant security
    const newHash = hashPassword(newPassword);

    // Update user password
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(newHash, cleanEmail);

    // Delete used reset code
    db.prepare('DELETE FROM password_resets WHERE email = ?').run(cleanEmail);

    // Fetch updated user to automatically log them in
    const user = db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category, rates_json, social_links_json, created_at FROM users WHERE email = ?').get(cleanEmail) as any;
    const token = signToken({ userId: user.id, email: user.email, handle: user.handle });

    console.log(`✓ Password successfully reset for user: ${cleanEmail}`);

    return res.json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      token,
      user: {
        ...user,
        rates: user.rates_json ? JSON.parse(user.rates_json) : {},
        social_links: user.social_links_json ? JSON.parse(user.social_links_json) : {}
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
