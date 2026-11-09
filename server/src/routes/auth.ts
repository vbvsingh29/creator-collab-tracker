import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { hashPassword, verifyPassword, signToken } from '../utils/security';
import { generateAndSendPhoneOtp, verifyPhoneOtp, normalizePhoneNumber } from '../services/smsService';

// Helper: Find user by phone number across E.164, raw 10-digit, and prefixed formats
export async function findUserByPhone(phoneInput: string): Promise<any> {
  if (!phoneInput || typeof phoneInput !== 'string') return null;
  const clean = normalizePhoneNumber(phoneInput);
  const rawDigits = phoneInput.replace(/[^\d]/g, '');
  const tenDigits = rawDigits.slice(-10);

  // Search by normalized E.164 (+91...), raw 10 digits, or prefixed digits
  // Prioritize primary admin/creator accounts over auto-generated ghost accounts
  const user = await db.prepare(`
    SELECT * FROM users 
    WHERE phone = ? 
       OR phone = ? 
       OR phone = ? 
       OR phone LIKE ?
    ORDER BY (CASE WHEN email = 'vbvsingh2905@gmail.com' THEN 0 WHEN email NOT LIKE '%@phone.collabflow.app' THEN 1 ELSE 2 END), created_at ASC
    LIMIT 1
  `).get(clean, tenDigits, `91${tenDigits}`, `%${tenDigits}`) as any;

  // Auto-normalize stored phone number to standardized format
  if (user && user.phone !== clean) {
    try {
      await db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(clean, user.id);
      user.phone = clean;
    } catch {
      // Non-fatal if already indexed
    }
  }

  return user;
}

// Clean up any orphan auto-created ghost phone accounts
async function cleanupGhostPhoneAccounts(realUserId: string, phone: string) {
  try {
    const clean = normalizePhoneNumber(phone);
    const tenDigits = phone.replace(/[^\d]/g, '').slice(-10);
    await db.prepare(`
      DELETE FROM users 
      WHERE (phone = ? OR phone = ? OR phone = ? OR phone LIKE ?)
        AND id != ?
        AND email LIKE 'user_%@phone.collabflow.app'
    `).run(clean, tenDigits, `91${tenDigits}`, `%${tenDigits}`, realUserId);
  } catch (err: any) {
    console.warn('⚠️ [CleanupGhost] Non-fatal cleanup warning:', err.message);
  }
}
import { sendEmailOtp } from '../services/emailService';

export const authRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, handle, platform = 'both', phone } = req.body;

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
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.'
      });
    }

    // Validate phone number uniqueness if provided
    let cleanPhone: string | null = null;
    if (phone && phone.trim()) {
      cleanPhone = normalizePhoneNumber(phone.trim());
      const existingPhoneUser = await findUserByPhone(cleanPhone);
      if (existingPhoneUser) {
        return res.status(400).json({
          success: false,
          error: 'An account with this mobile phone number already exists. Please log in.'
        });
      }
    }

    const passwordHash = hashPassword(password);
    const userId = uuidv4();
    const now = new Date().toISOString();

    const initialRole = (cleanEmail === 'vbvsingh2905@gmail.com' || cleanEmail.includes('admin')) ? 'admin' : 'creator';

    await db.prepare(`
      INSERT INTO users (id, name, email, password_hash, handle, platform, avatar_url, role, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name.trim(),
      cleanEmail,
      passwordHash,
      cleanHandle,
      platform,
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      initialRole,
      cleanPhone,
      now
    );

    const token = signToken({ userId, email: cleanEmail, handle: cleanHandle });

    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      handle: cleanHandle,
      platform,
      phone: cleanPhone || '',
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
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      return res.status(400).json({
        success: false,
        not_registered: true,
        error: 'No account found with this email. Please register your creator profile first.'
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
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category, rates_json, social_links_json, role, email_verified, phone_verified, social_accounts_json, team_members_json, created_at FROM users WHERE id = ?').get(req.userId) as any;

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
authRouter.put('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
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

    const existingUser = await db.prepare('SELECT email, email_verified, phone_verified, social_accounts_json, team_members_json FROM users WHERE id = ?').get(userId) as any;

    // Enforce email lock once email is verified
    let finalEmail = existingUser?.email;
    if (req.body.email && req.body.email.trim().toLowerCase() !== existingUser?.email?.toLowerCase()) {
      if (existingUser?.email_verified) {
        return res.status(400).json({
          success: false,
          error: 'Verified email address is locked for account security and cannot be changed.'
        });
      }
      finalEmail = req.body.email.trim().toLowerCase();
    }

    // Normalize phone number and enforce uniqueness
    let finalPhone = existingUser?.phone || '';
    if (phone !== undefined) {
      if (phone && phone.trim()) {
        const normalized = normalizePhoneNumber(phone.trim());
        const existingPhoneUser = await findUserByPhone(normalized);
        if (existingPhoneUser && existingPhoneUser.id !== userId) {
          if (!existingPhoneUser.email?.includes('@phone.collabflow.app')) {
            return res.status(400).json({
              success: false,
              error: 'This mobile phone number is already registered to another account.'
            });
          }
        }
        finalPhone = normalized;
        await cleanupGhostPhoneAccounts(userId!, finalPhone);
      } else {
        finalPhone = '';
      }
    }

    const finalSocialAccounts = social_accounts !== undefined ? JSON.stringify(social_accounts) : (existingUser?.social_accounts_json || '[]');
    const finalTeamMembers = team_members !== undefined ? JSON.stringify(team_members) : (existingUser?.team_members_json || '[]');

    await db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, handle = ?, platform = ?, avatar_url = ?, bio = ?, phone = ?, category = ?, rates_json = ?, social_links_json = ?, social_accounts_json = ?, team_members_json = ?
      WHERE id = ?
    `).run(
      name.trim(),
      finalEmail,
      cleanHandle,
      platform || 'both',
      avatar_url || '',
      bio.trim(),
      finalPhone,
      category.trim(),
      JSON.stringify(rates),
      JSON.stringify(social_links),
      finalSocialAccounts,
      finalTeamMembers,
      userId
    );

    const updatedUser = await db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category, rates_json, social_links_json, email_verified, phone_verified, social_accounts_json, team_members_json, created_at FROM users WHERE id = ?').get(userId) as any;

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
authRouter.get('/demo-creators', async (_req: Request, res: Response) => {
  try {
    const users = await db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category FROM users LIMIT 5').all();
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
    const user = await db.prepare('SELECT id, name FROM users WHERE email = ?').get(cleanEmail) as { id: string; name: string } | undefined;

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
    await db.prepare('DELETE FROM password_resets WHERE email = ?').run(cleanEmail);

    // Save new reset record
    await db.prepare(`
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
authRouter.post('/verify-reset-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();

    const record = await db.prepare(`
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

    const record = await db.prepare(`
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
    await db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(newHash, cleanEmail);

    // Delete used reset code
    await db.prepare('DELETE FROM password_resets WHERE email = ?').run(cleanEmail);

    // Fetch updated user to automatically log them in
    const user = await db.prepare('SELECT id, name, email, handle, platform, avatar_url, bio, phone, category, rates_json, social_links_json, created_at FROM users WHERE email = ?').get(cleanEmail) as any;
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
    const { phone, purpose = 'verify' } = req.body;
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'Please provide a valid mobile phone number.' });
    }

    const cleanPhone = normalizePhoneNumber(phone.trim());

    // Strict account check for login purpose (do not auto-create on login)
    if (purpose === 'login') {
      const existingUser = await findUserByPhone(cleanPhone);
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          not_registered: true,
          error: 'No account found with this mobile number. Please register your creator profile first.'
        });
      }
    }

    const result = await generateAndSendPhoneOtp(cleanPhone);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || 'Failed to send SMS code.' });
  }
});

// POST /api/auth/verify-sms-otp
authRouter.post('/verify-sms-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone number and 6-digit OTP code are required.' });
    }

    const cleanPhone = normalizePhoneNumber(phone.trim());
    const isValid = verifyPhoneOtp(cleanPhone, otp.toString().trim());

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code. Please try again.' });
    }

    // Check if user already exists with this phone
    const user = await findUserByPhone(cleanPhone);

    if (!user) {
      return res.status(400).json({
        success: false,
        not_registered: true,
        error: 'No account found with this mobile number. Please register your creator profile first.'
      });
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
    const user = await db.prepare('SELECT email FROM users WHERE id = ?').get(req.userId) as any;
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = hashPassword(code);
    const id = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    await db.prepare("DELETE FROM verifications WHERE target = ? AND type = 'email'").run(user.email);
    await db.prepare(`
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
authRouter.post('/verify-email-code', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: '6-digit code is required' });

    const user = await db.prepare('SELECT email FROM users WHERE id = ?').get(req.userId) as any;
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const now = new Date().toISOString();
    const record = await db.prepare(`
      SELECT * FROM verifications 
      WHERE target = ? AND type = 'email' AND expires_at > ?
      ORDER BY created_at DESC LIMIT 1
    `).get(user.email, now) as any;

    if (!record || !verifyPassword(code.toString().trim(), record.code_hash)) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
    }

    await db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(req.userId);
    await db.prepare("DELETE FROM verifications WHERE target = ? AND type = 'email'").run(user.email);

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
authRouter.post('/verify-account-phone', requireAuth, async (req: AuthRequest, res: Response) => {
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

    // Check if phone belongs to another real user (uniqueness check)
    const existingUserWithPhone = await findUserByPhone(cleanPhone);
    if (existingUserWithPhone && existingUserWithPhone.id !== req.userId) {
      if (existingUserWithPhone.email && !existingUserWithPhone.email.includes('@phone.collabflow.app')) {
        return res.status(400).json({
          success: false,
          error: 'This mobile phone number is already verified on another account.'
        });
      }
    }

    // Clean up any ghost account holding this number
    await cleanupGhostPhoneAccounts(req.userId!, cleanPhone);

    await db.prepare('UPDATE users SET phone = ?, phone_verified = 1 WHERE id = ?').run(cleanPhone, req.userId);

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
