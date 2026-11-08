import crypto from 'crypto';
import https from 'https';
import querystring from 'querystring';
import { hashPassword, verifyPassword } from '../utils/security';
import { logCommunication } from './communicationLogService';

interface OtpRecord {
  codeHash: string;
  expiresAt: number; // timestamp in ms
  attempts: number;
}

// In-memory OTP storage with automatic expiry cleanup
const otpStore = new Map<string, OtpRecord>();

// Clean up expired OTPs periodically (unref so tests/processes exit cleanly)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}, 60 * 1000);
if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

export function normalizePhoneNumber(rawPhone: string): string {
  const cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  // If 10 digits (common Indian number), prefix with +91
  if (cleaned.length === 10) return `+91${cleaned}`;
  // If 11 digits starting with 1 (US), prefix with +
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
  return `+${cleaned}`;
}

export async function sendTwilioSms(to: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('SMS service is not configured. Please contact the platform administrator.');
  }

  const postData = querystring.stringify({
    To: to,
    From: fromNumber,
    Body: message
  });

  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`📱 [Twilio SMS] Message sent successfully to ${to}`);
          resolve(true);
        } else {
          console.error(`⚠️ [Twilio SMS Error] HTTP ${res.statusCode}: ${data}`);
          // Parse Twilio error message for better feedback
          try {
            const parsed = JSON.parse(data);
            reject(new Error(parsed.message || `Twilio error ${res.statusCode}`));
          } catch {
            reject(new Error(`SMS delivery failed (HTTP ${res.statusCode}). Check Twilio credentials.`));
          }
        }
      });
    });

    req.on('error', (err) => {
      console.error('⚠️ [Twilio SMS Network Error]:', err);
      reject(new Error('SMS delivery failed due to a network error. Please try again.'));
    });

    req.write(postData);
    req.end();
  });
}

export async function generateAndSendPhoneOtp(rawPhone: string): Promise<{
  success: boolean;
  message: string;
  normalized_phone: string;
}> {
  const phone = normalizePhoneNumber(rawPhone);
  if (phone.length < 10) {
    throw new Error('Please enter a valid phone number with country code (e.g. +91 98765 43210)');
  }

  // In test mode use a fixed OTP so automated tests can verify without reading logs
  const isTestMode = process.env.NODE_ENV === 'test';
  const otp = isTestMode ? '000000' : crypto.randomInt(100000, 999999).toString();
  const codeHash = hashPassword(otp);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Save to store before attempting delivery (so test-mode can still verify)
  otpStore.set(phone, {
    codeHash,
    expiresAt,
    attempts: 0
  });

  const smsText = `CollabFlow: Your verification code is ${otp}. Valid for 5 minutes. Do not share this with anyone.`;

  // In unit-test / local-dev mode (no Twilio env vars): log to console only
  const isConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );

  if (!isConfigured) {
    // Dev-only: log to server console, never expose in API response
    console.log(`📱 [DEV-ONLY OTP] ${phone}: ${otp} (valid 5 min — not sent, Twilio not configured)`);
    logCommunication({
      recipient: phone,
      channel: 'sms',
      purpose: 'phone_verification',
      status: 'simulated',
      provider: 'console',
      details: 'Twilio credentials not configured; OTP written to console'
    });
    return {
      success: true,
      message: `Verification code sent to ${phone}.`,
      normalized_phone: phone,
      // Only exposed in NODE_ENV=test for automated testing — never in production
      ...(isTestMode ? { preview_code: otp } : {})
    };
  }

  // Production: send real Twilio SMS (throws on failure)
  try {
    await sendTwilioSms(phone, smsText);
    logCommunication({
      recipient: phone,
      channel: 'sms',
      purpose: 'phone_verification',
      status: 'delivered',
      provider: 'twilio',
      details: 'Successfully dispatched via Twilio REST API'
    });
  } catch (smsErr: any) {
    logCommunication({
      recipient: phone,
      channel: 'sms',
      purpose: 'phone_verification',
      status: 'failed',
      provider: 'twilio',
      details: smsErr.message || 'Twilio delivery failed'
    });
    throw smsErr;
  }

  return {
    success: true,
    message: `Verification code sent via SMS to ${phone}. Please check your messages.`,
    normalized_phone: phone
  };
}

export function verifyPhoneOtp(rawPhone: string, otpCode: string): boolean {
  const phone = normalizePhoneNumber(rawPhone);
  const record = otpStore.get(phone);

  if (!record) {
    return false;
  }

  if (record.expiresAt < Date.now()) {
    otpStore.delete(phone);
    return false;
  }

  if (record.attempts >= 5) {
    otpStore.delete(phone);
    throw new Error('Too many failed attempts. Please request a new code.');
  }

  record.attempts += 1;

  const isValid = verifyPassword(otpCode.trim(), record.codeHash);
  if (isValid) {
    otpStore.delete(phone); // Burn OTP after single use
    return true;
  }

  return false;
}
