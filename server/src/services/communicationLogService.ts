import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';

export interface CommunicationLogEntry {
  userId?: string;
  recipient: string;
  channel: 'sms' | 'email';
  purpose: 'phone_verification' | 'email_verification' | 'password_reset';
  status: 'delivered' | 'sent' | 'failed' | 'simulated';
  provider: 'twilio' | 'resend' | 'smtp' | 'console';
  details?: string;
}

/**
 * Persist an outbound communication audit record (SMS or Email) to the database.
 * Enables platform administrators to monitor verification volume, delivery success rates,
 * and track communication health.
 */
export function logCommunication(entry: CommunicationLogEntry): void {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO communication_logs (
        id, user_id, recipient, channel, purpose, status, provider, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      entry.userId || null,
      entry.recipient,
      entry.channel,
      entry.purpose,
      entry.status,
      entry.provider,
      entry.details || '',
      now
    );
  } catch (err: any) {
    // Fail silently in telemetry without interrupting primary user auth flows
    console.warn('⚠️ [CommLog] Unable to persist communication event:', err.message);
  }
}
