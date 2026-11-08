import https from 'https';
import { logCommunication } from './communicationLogService';

/**
 * emailService.ts
 *
 * Sends OTP / password-reset emails.
 * Priority:
 *   1. Resend API  (RESEND_API_KEY + RESEND_FROM_EMAIL)
 *   2. SMTP        (SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS + SMTP_FROM)
 *   3. Console     (dev/test fallback — logs code, never sends)
 *
 * Returns true on success, false when no service is configured (dev/test mode).
 * Throws on configuration error or delivery failure.
 */

function buildEmailBody(code: string, type: 'verify' | 'reset'): { subject: string; html: string; text: string } {
  if (type === 'verify') {
    return {
      subject: 'Verify your Collabio email',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#111">Email Verification</h2>
  <p>Use the code below to verify your email on Collabio. It expires in 15 minutes.</p>
  <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111;margin:24px 0">${code}</div>
  <p style="color:#666;font-size:13px">If you didn't request this, please ignore this email.</p>
</div>`,
      text: `Collabio email verification code: ${code}\n\nExpires in 15 minutes. If you didn't request this, ignore this email.`
    };
  }
  return {
    subject: 'Reset your Collabio password',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <h2 style="color:#111">Password Reset</h2>
  <p>Use the code below to reset your Collabio password. It expires in 15 minutes.</p>
  <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111;margin:24px 0">${code}</div>
  <p style="color:#666;font-size:13px">If you didn't request a password reset, please ignore this email.</p>
</div>`,
    text: `Collabio password reset code: ${code}\n\nExpires in 15 minutes. If you didn't request this, ignore this email.`
  };
}

async function sendViaResend(to: string, subject: string, html: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY!;
  const from = process.env.RESEND_FROM_EMAIL || 'Collabio <noreply@collabflow.app>';

  const payload = JSON.stringify({ from, to, subject, html, text });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`📧 [Resend] Email sent to ${to}`);
          resolve();
        } else {
          try {
            const parsed = JSON.parse(data);
            reject(new Error(parsed.message || `Resend error ${res.statusCode}`));
          } catch {
            reject(new Error(`Email delivery failed (HTTP ${res.statusCode})`));
          }
        }
      });
    });
    req.on('error', (err) => reject(new Error(`Resend network error: ${err.message}`)));
    req.write(payload);
    req.end();
  });
}

async function sendViaSMTP(to: string, subject: string, text: string): Promise<void> {
  // Raw HTTPS SMTP relay: uses Gmail App Password or any SMTP provider
  // We use a simple base64 AUTH LOGIN approach via a direct SMTP TCP connection.
  // For simplicity, we keep this as a stub — Resend free tier (3k emails/mo) is recommended.
  // To use SMTP, install nodemailer: cd server && npm install nodemailer @types/nodemailer
  // Then replace this stub with the nodemailer implementation.
  console.warn(
    `📧 [SMTP] SMTP stub — configure RESEND_API_KEY instead, or install nodemailer.\n` +
    `  Recipient: ${to}\n  Subject: ${subject}`
  );
  throw new Error('SMTP not implemented without nodemailer. Use RESEND_API_KEY instead (free: resend.com).');
}

/**
 * Send a verification or password-reset code by email.
 * Returns true if actually sent, false if running without an email service (dev/test mode).
 */
export async function sendEmailOtp(
  to: string,
  code: string,
  type: 'verify' | 'reset'
): Promise<boolean> {
  const { subject, html, text } = buildEmailBody(code, type);
  const purpose = type === 'verify' ? 'email_verification' : 'password_reset';

  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSMTP = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (hasResend) {
    try {
      await sendViaResend(to, subject, html, text);
      logCommunication({
        recipient: to,
        channel: 'email',
        purpose,
        status: 'delivered',
        provider: 'resend',
        details: 'Dispatched via Resend API'
      });
      return true;
    } catch (resendErr: any) {
      logCommunication({
        recipient: to,
        channel: 'email',
        purpose,
        status: 'failed',
        provider: 'resend',
        details: resendErr.message || 'Resend delivery failed'
      });
      throw resendErr;
    }
  }

  if (hasSMTP) {
    try {
      await sendViaSMTP(to, subject, text);
      logCommunication({
        recipient: to,
        channel: 'email',
        purpose,
        status: 'delivered',
        provider: 'smtp',
        details: 'Dispatched via SMTP relay'
      });
      return true;
    } catch (smtpErr: any) {
      logCommunication({
        recipient: to,
        channel: 'email',
        purpose,
        status: 'failed',
        provider: 'smtp',
        details: smtpErr.message || 'SMTP delivery failed'
      });
      console.error('⚠️ [SMTP] Failed:', smtpErr.message, '— falling through to console log');
    }
  }

  // No email service configured — log to console only (dev/test mode)
  console.log(`📧 [DEV-ONLY EMAIL OTP] To: ${to} | Type: ${type} | Code: ${code} (not sent, no email service configured)`);
  logCommunication({
    recipient: to,
    channel: 'email',
    purpose,
    status: 'simulated',
    provider: 'console',
    details: 'Email service not configured; OTP written to console'
  });
  return false;
}
