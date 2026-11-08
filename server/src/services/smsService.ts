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

  const postParams: Record<string, string> = {
    To: to,
    Body: message
  };

  // If fromNumber starts with MG, it's a Twilio Messaging Service SID
  if (fromNumber.startsWith('MG')) {
    postParams.MessagingServiceSid = fromNumber;
  } else {
    postParams.From = fromNumber;
  }

  const postData = querystring.stringify(postParams);

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

export async function sendFast2Sms(to: string, otp: string): Promise<boolean> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    throw new Error('FAST2SMS_API_KEY is not configured in environment.');
  }

  // Fast2SMS expects 10-digit Indian numbers without +91 or leading 0
  let cleanNumber = to.replace(/[^\d]/g, '');
  if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
    cleanNumber = cleanNumber.slice(2);
  } else if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
    cleanNumber = cleanNumber.slice(1);
  }

  if (cleanNumber.length !== 10) {
    throw new Error(`Fast2SMS requires a valid 10-digit Indian mobile number (got ${cleanNumber.length} digits).`);
  }

  // Fast2SMS dedicated OTP route (delivers instant 6-digit numeric OTP without custom DLT template)
  const payload = JSON.stringify({
    route: 'otp',
    variables_values: otp,
    numbers: cleanNumber
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.fast2sms.com',
      port: 443,
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': apiKey.trim(),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.return) {
            console.log(`📱 [Fast2SMS] OTP sent successfully to ${cleanNumber}`);
            resolve(true);
          } else {
            console.error(`⚠️ [Fast2SMS Error]:`, parsed);
            const errDetail = Array.isArray(parsed.message) ? parsed.message.join(', ') : (parsed.message || JSON.stringify(parsed));
            reject(new Error(errDetail || 'Fast2SMS dispatch rejected'));
          }
        } catch {
          reject(new Error(`Fast2SMS responded with HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('⚠️ [Fast2SMS Network Error]:', err);
      reject(new Error('Fast2SMS dispatch failed due to network error.'));
    });

    req.write(payload);
    req.end();
  });
}

export async function generateAndSendPhoneOtp(rawPhone: string): Promise<{
  success: boolean;
  message: string;
  normalized_phone: string;
  preview_code?: string;
  trial_mode?: boolean;
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

  const smsText = `Collabio: Your verification code is ${otp}. Valid for 5 minutes. Do not share this with anyone.`;

  const hasFast2Sms = Boolean(process.env.FAST2SMS_API_KEY);
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );

  const preferredProvider = (process.env.SMS_PROVIDER || '').toLowerCase().trim(); // 'fast2sms' or 'twilio'
  const isIndianNumber = phone.startsWith('+91');

  // Intelligent SMS routing:
  // Prefer Fast2SMS if FAST2SMS_API_KEY is configured and:
  // - preferredProvider is explicitly 'fast2sms', OR
  // - Twilio is not configured, OR
  // - recipient is an Indian number (+91) and preferredProvider is not explicitly locked to 'twilio'
  const useFast2Sms = hasFast2Sms && (
    preferredProvider === 'fast2sms' ||
    !hasTwilio ||
    (isIndianNumber && preferredProvider !== 'twilio')
  );

  // 1. FAST2SMS DISPATCH (Instant Indian Mobile SMS)
  if (useFast2Sms) {
    try {
      await sendFast2Sms(phone, otp);
      logCommunication({
        recipient: phone,
        channel: 'sms',
        purpose: 'phone_verification',
        status: 'delivered',
        provider: 'fast2sms',
        details: 'Successfully dispatched via Fast2SMS OTP route'
      });
      return {
        success: true,
        message: `Verification code sent via Fast2SMS to ${phone}. Please check your messages.`,
        normalized_phone: phone
      };
    } catch (fastErr: any) {
      console.warn(`⚠️ [Fast2SMS Dispatch Error]: ${fastErr.message}`);
      logCommunication({
        recipient: phone,
        channel: 'sms',
        purpose: 'phone_verification',
        status: 'failed',
        provider: 'fast2sms',
        details: fastErr.message || 'Fast2SMS dispatch failed'
      });
      // If Twilio is available, failover to Twilio below, else fall back to trial/preview mode
      if (!hasTwilio) {
        return {
          success: true,
          message: `Fast2SMS notice (${fastErr.message}). For testing, your verification code is: ${otp}`,
          preview_code: otp,
          trial_mode: true,
          normalized_phone: phone
        };
      }
    }
  }

  // 2. TWILIO DISPATCH (Global SMS with Trial Fallback)
  if (hasTwilio) {
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
      return {
        success: true,
        message: `Verification code sent via Twilio SMS to ${phone}. Please check your messages.`,
        normalized_phone: phone
      };
    } catch (smsErr: any) {
      const errMsg = smsErr.message || 'Twilio delivery failed';
      const isTrialRestriction = /template|trial|unverified|geo|permission|whitelist/i.test(errMsg);

      logCommunication({
        recipient: phone,
        channel: 'sms',
        purpose: 'phone_verification',
        status: isTrialRestriction ? 'simulated' : 'failed',
        provider: 'twilio',
        details: isTrialRestriction 
          ? `Twilio Trial Account Limitation (${errMsg}). Test OTP: ${otp}`
          : errMsg
      });

      if (isTrialRestriction) {
        console.warn(`⚠️ [Twilio Trial Account] ${errMsg}. Active OTP for testing: ${otp}`);
        return {
          success: true,
          message: `Twilio Trial Account Limitation: Twilio trial accounts require pre-approved templates or a paid upgrade to send custom SMS. For testing, your verification code is: ${otp}`,
          preview_code: otp,
          trial_mode: true,
          normalized_phone: phone
        };
      }

      throw smsErr;
    }
  }

  // 3. ZERO-CONFIG / DEV CONSOLE MODE (No SMS providers configured)
  console.log(`📱 [DEV-ONLY OTP] ${phone}: ${otp} (valid 5 min — no SMS provider configured)`);
  logCommunication({
    recipient: phone,
    channel: 'sms',
    purpose: 'phone_verification',
    status: 'simulated',
    provider: 'console',
    details: 'Neither Fast2SMS nor Twilio configured; OTP written to console'
  });
  return {
    success: true,
    message: `Verification code generated for ${phone}. Check console or test code below.`,
    normalized_phone: phone,
    preview_code: otp,
    trial_mode: true
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
