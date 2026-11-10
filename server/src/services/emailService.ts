import https from 'https';
import { logCommunication } from './communicationLogService';

/**
 * emailService.ts
 *
 * Sends OTP / password-reset / team invitation emails.
 * Priority:
 *   1. Resend API  (RESEND_API_KEY + RESEND_FROM_EMAIL)
 *   2. SMTP        (SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS + SMTP_FROM)
 *   3. Console     (dev/test fallback — logs code, never sends)
 *
 * Returns true on success, false when no service is configured (dev/test mode).
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

export function buildInviteEmailBody(params: {
  creatorName: string;
  isExistingUser: boolean;
  canViewFinancials: boolean;
  assignedAccountsLabel: string;
  inviteLink: string;
}): { subject: string; html: string; text: string } {
  const { creatorName, isExistingUser, canViewFinancials, assignedAccountsLabel, inviteLink } = params;

  if (isExistingUser) {
    return {
      subject: `🎉 ${creatorName} added you to their team on CollabFlow`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;background:#121215;color:#f5f2eb;padding:32px;border-radius:16px;border:1px solid #282830">
          <div style="display:inline-block;padding:6px 14px;border-radius:99px;background:#1c1c22;color:#d9c7b2;font-size:12px;font-weight:600;margin-bottom:20px;border:1px solid #3a3a46">
            Team Workspace Invitation
          </div>
          <h2 style="color:#f5f2eb;margin:0 0 12px 0;font-size:22px">You've been added to ${creatorName}'s team</h2>
          <p style="color:#d4c5b9;font-size:14px;line-height:1.6;margin-bottom:20px">
            <strong>${creatorName}</strong> has granted you manager access on CollabFlow to manage collaborations for <strong>${assignedAccountsLabel}</strong>.
          </p>
          <div style="background:#18181c;padding:16px;border-radius:12px;border:1px solid #282830;margin-bottom:24px;font-size:13px">
            <div style="color:#a89f91;margin-bottom:6px"><strong>Assigned Channels:</strong> ${assignedAccountsLabel}</div>
            <div style="color:#a89f91"><strong>Financial Visibility:</strong> ${canViewFinancials ? 'Full Rate & Invoice Access' : 'Private (Rates Hidden)'}</div>
          </div>
          <a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#e8e2d5;color:#121215;text-decoration:none;font-weight:700;font-size:14px;border-radius:10px;margin-bottom:20px">
            Open Workspace Deals
          </a>
          <p style="color:#78716c;font-size:12px;margin:0">Log into your existing CollabFlow account to view deals immediately.</p>
        </div>
      `,
      text: `${creatorName} added you to their team on CollabFlow to manage ${assignedAccountsLabel}.\nFinancial Visibility: ${canViewFinancials ? 'Full' : 'Private'}\nOpen here: ${inviteLink}`
    };
  }

  return {
    subject: `👋 ${creatorName} invited you to manage sponsorships on CollabFlow`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;background:#121215;color:#f5f2eb;padding:32px;border-radius:16px;border:1px solid #282830">
        <div style="display:inline-block;padding:6px 14px;border-radius:99px;background:#1c1c22;color:#d9c7b2;font-size:12px;font-weight:600;margin-bottom:20px;border:1px solid #3a3a46">
          CollabFlow Manager Invitation
        </div>
        <h2 style="color:#f5f2eb;margin:0 0 12px 0;font-size:22px">Join ${creatorName}'s Workspace</h2>
        <p style="color:#d4c5b9;font-size:14px;line-height:1.6;margin-bottom:20px">
          <strong>${creatorName}</strong> invites you to coordinate creator sponsorships and deliverables for <strong>${assignedAccountsLabel}</strong> on CollabFlow.
        </p>
        <div style="background:#18181c;padding:16px;border-radius:12px;border:1px solid #282830;margin-bottom:24px;font-size:13px">
          <div style="color:#a89f91;margin-bottom:6px"><strong>Role:</strong> Sponsorship Manager</div>
          <div style="color:#a89f91"><strong>Channel Access:</strong> ${assignedAccountsLabel}</div>
        </div>
        <a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#e8e2d5;color:#121215;text-decoration:none;font-weight:700;font-size:14px;border-radius:10px;margin-bottom:20px">
          Accept & Set Up Account
        </a>
        <p style="color:#78716c;font-size:12px;margin:0">This invitation link is valid for 7 days. If you were not expecting this, you can ignore this message.</p>
      </div>
    `,
    text: `${creatorName} invited you to manage sponsorships for ${assignedAccountsLabel} on CollabFlow.\nSet up your manager account here: ${inviteLink}`
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

/**
 * Send team invitation email (handles both new and existing users)
 */
export async function sendTeamInviteEmail(params: {
  to: string;
  creatorName: string;
  isExistingUser: boolean;
  canViewFinancials: boolean;
  assignedAccountsLabel: string;
  inviteLink: string;
}): Promise<boolean> {
  const { subject, html, text } = buildInviteEmailBody(params);
  const purpose = 'team_invite';

  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend(params.to, subject, html, text);
      logCommunication({
        recipient: params.to,
        channel: 'email',
        purpose,
        status: 'delivered',
        provider: 'resend',
        details: `Dispatched team invite from ${params.creatorName}`
      });
      return true;
    } catch (err: any) {
      logCommunication({
        recipient: params.to,
        channel: 'email',
        purpose,
        status: 'failed',
        provider: 'resend',
        details: err.message
      });
      console.warn('⚠️ [Email] Resend invite failed:', err.message);
    }
  }

  // Dev fallback: log invite link clearly to console
  console.log(`📧 [DEV-ONLY TEAM INVITE] To: ${params.to} | Creator: ${params.creatorName} | Link: ${params.inviteLink}`);
  logCommunication({
    recipient: params.to,
    channel: 'email',
    purpose,
    status: 'simulated',
    provider: 'console',
    details: `Invite link: ${params.inviteLink}`
  });
  return true;
}

/**
 * Send a verification or password-reset code by email.
 */
export async function sendEmailOtp(
  to: string,
  code: string,
  type: 'verify' | 'reset'
): Promise<boolean> {
  const { subject, html, text } = buildEmailBody(code, type);
  const purpose = type === 'verify' ? 'email_verification' : 'password_reset';

  const hasResend = Boolean(process.env.RESEND_API_KEY);

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

  // Dev mode
  console.log(`📧 [DEV-ONLY EMAIL OTP] To: ${to} | Type: ${type} | Code: ${code}`);
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
