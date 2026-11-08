import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { hashPassword, verifyPassword, signToken } from '../utils/security';
import { generateAndSendPhoneOtp, verifyPhoneOtp, normalizePhoneNumber } from '../services/smsService';
import { sendEmailOtp } from '../services/emailService';

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

    const initialRole = (cleanEmail === 'vbvsingh2905@gmail.com' || cleanEmail.includes('admin')) ? 'admin' : 'creator';

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, handle, platform, avatar_url, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name.trim(),
      cleanEmail,
      passwordHash,
      cleanHandle,
      platform,
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      initialRole,
      now
    );

    const token = signToken({ userId, email: cleanEmail, handle: cleanHandle });

    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      handle: cleanHandle,
      platform,
      role: initialRole,
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
      role: (user.role === 'admin' || user.email.toLowerCase() === 'vbvsingh2905@gmail.com' || user.email.toLowerCase().includes('admin')) ? 'admin' : (user.role || 'creator'),
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
    const user = db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category, rates_json, social_links_json, role, email_verified, phone_verified, social_accounts_json, team_members_json, created_at FROM users WHERE id = ?').get(req.userId) as any;

    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    res.json({
      success: true,
      user: {
        ...user,
        role: (user.role === 'admin' || user.email?.toLowerCase() === 'vbvsingh2905@gmail.com' || user.email?.toLowerCase().includes('admin')) ? 'admin' : (user.role || 'creator'),
        email_verified: Boolean(user.email_verified),
        phone_verified: Boolean(user.phone_verified),
        rates: user.rates_json ? JSON.parse(user.rates_json) : {},
        social_links: user.social_links_json ? JSON.parse(user.social_links_json) : {},
        social_accounts: user.social_accounts_json ? JSON.parse(user.social_accounts_json) : [],
        team_members: user.team_members_json ? JSON.parse(user.team_members_json) : []
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

    const {
      social_accounts,
      team_members
    } = req.body;

    const existingUser = db.prepare('SELECT social_accounts_json, team_members_json FROM users WHERE id = ?').get(userId) as any;
    const finalSocialAccounts = social_accounts !== undefined ? JSON.stringify(social_accounts) : (existingUser?.social_accounts_json || '[]');
    const finalTeamMembers = team_members !== undefined ? JSON.stringify(team_members) : (existingUser?.team_members_json || '[]');

    db.prepare(`
      UPDATE users 
      SET name = ?, handle = ?, platform = ?, avatar_url = ?, bio = ?, phone = ?, category = ?, rates_json = ?, social_links_json = ?, social_accounts_json = ?, team_members_json = ?
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
      finalSocialAccounts,
      finalTeamMembers,
      userId
    );

    const updatedUser = db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category, rates_json, social_links_json, email_verified, phone_verified, social_accounts_json, team_members_json, created_at FROM users WHERE id = ?').get(userId) as any;

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        ...updatedUser,
        email_verified: Boolean(updatedUser.email_verified),
        phone_verified: Boolean(updatedUser.phone_verified),
        rates: updatedUser.rates_json ? JSON.parse(updatedUser.rates_json) : {},
        social_links: updatedUser.social_links_json ? JSON.parse(updatedUser.social_links_json) : {},
        social_accounts: updatedUser.social_accounts_json ? JSON.parse(updatedUser.social_accounts_json) : [],
        team_members: updatedUser.team_members_json ? JSON.parse(updatedUser.team_members_json) : []
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

    // Dispatch real email via emailService
    try {
      await sendEmailOtp(cleanEmail, resetCode, 'reset');
    } catch (emailErr: any) {
      console.error('⚠️ [Auth Forgot Password] Failed to dispatch email:', emailErr.message);
    }

    console.log(`🔑 [Collabio Auth] Password reset code generated for ${cleanEmail} (valid for 15 mins)`);

    return res.json({
      success: true,
      message: 'If this email is registered, a 6-digit reset code has been sent to your inbox.',
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

// POST /api/auth/send-sms-otp
authRouter.post('/send-sms-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'Please provide a valid mobile phone number.' });
    }

    const result = await generateAndSendPhoneOtp(phone.trim());
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || 'Failed to send SMS code.' });
  }
});

// POST /api/auth/verify-sms-otp
authRouter.post('/verify-sms-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone number and 6-digit OTP code are required.' });
    }

    const cleanPhone = normalizePhoneNumber(phone.trim());
    const isValid = verifyPhoneOtp(cleanPhone, otp.toString().trim());

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code. Please try again.' });
    }

    // Check if user already exists with this phone
    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone) as any;

    if (!user) {
      // Auto-register creator via phone
      const userId = uuidv4();
      const displayName = (name && name.trim()) ? name.trim() : 'Creator ' + cleanPhone.slice(-4);
      const generatedEmail = 'user_' + cleanPhone.replace(/[^0-9]/g, '') + '@phone.collabflow.app';
      const dummyPassHash = hashPassword(uuidv4());
      const handle = '@creator_' + cleanPhone.slice(-4);
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, handle, phone, platform, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        displayName,
        generatedEmail,
        dummyPassHash,
        handle,
        cleanPhone,
        'both',
        'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(displayName),
        now
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    }

    const token = signToken({ userId: user.id, email: user.email, handle: user.handle });

    return res.json({
      success: true,
      message: 'Phone verified successfully! You are logged in.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        platform: user.platform,
        avatar_url: user.avatar_url,
        bio: user.bio || '',
        phone: user.phone || cleanPhone,
        category: user.category || '',
        rates: user.rates_json ? JSON.parse(user.rates_json) : {},
        social_links: user.social_links_json ? JSON.parse(user.social_links_json) : {},
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || 'Verification failed.' });
  }
});

// POST /api/auth/send-email-verify (Generate and send 6-digit email verification OTP)
authRouter.post('/send-email-verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.userId) as any;
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = hashPassword(code);
    const id = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    db.prepare("DELETE FROM verifications WHERE target = ? AND type = 'email'").run(user.email);
    db.prepare(`
      INSERT INTO verifications (id, target, type, code_hash, expires_at, created_at)
      VALUES (?, ?, 'email', ?, ?, ?)
    `).run(id, user.email, codeHash, expiresAt, now.toISOString());

    const isTestMode = process.env.NODE_ENV === 'test';

    // Send real email (or log in dev) — non-blocking: don't fail the request if email fails
    let emailSent = false;
    try {
      emailSent = await sendEmailOtp(user.email, code, 'verify');
    } catch (emailErr: any) {
      console.error('⚠️ [Email OTP] Delivery failed:', emailErr.message);
    }

    return res.json({
      success: true,
      message: emailSent
        ? `Verification code sent to ${user.email}`
        : 'Verification code generated. Check server logs (email service not configured).',
      // Only expose code in test mode so automated tests can call verify-email-code
      ...(isTestMode ? { preview_code: code } : {})
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/verify-email-code
authRouter.post('/verify-email-code', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: '6-digit code is required' });

    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.userId) as any;
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const now = new Date().toISOString();
    const record = db.prepare(`
      SELECT * FROM verifications 
      WHERE target = ? AND type = 'email' AND expires_at > ?
      ORDER BY created_at DESC LIMIT 1
    `).get(user.email, now) as any;

    if (!record || !verifyPassword(code.toString().trim(), record.code_hash)) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
    }

    db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(req.userId);
    db.prepare("DELETE FROM verifications WHERE target = ? AND type = 'email'").run(user.email);

    return res.json({
      success: true,
      message: 'Email verified successfully!',
      email_verified: true
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/verify-account-phone
authRouter.post('/verify-account-phone', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone and 6-digit OTP code are required' });
    }

    const cleanPhone = normalizePhoneNumber(phone.trim());
    const isValid = verifyPhoneOtp(cleanPhone, otp.toString().trim());
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code' });
    }

    db.prepare('UPDATE users SET phone = ?, phone_verified = 1 WHERE id = ?').run(cleanPhone, req.userId);

    return res.json({
      success: true,
      message: 'Phone verified successfully!',
      phone_verified: true,
      phone: cleanPhone
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
