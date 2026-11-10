import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const notificationsRouter = Router();

// Helper to create notifications from anywhere on server
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionPayload?: any;
}) {
  try {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const payloadStr = params.actionPayload ? JSON.stringify(params.actionPayload) : '{}';

    await db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, action_url, action_payload_json, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      id,
      params.userId,
      params.type,
      params.title,
      params.message,
      params.actionUrl || '',
      payloadStr,
      createdAt
    );
    return id;
  } catch (err: any) {
    console.error('❌ [Notifications] Create notification warning:', err.message);
    return null;
  }
}

// GET /api/notifications: Fetch latest notifications & unread count
notificationsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = await db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(userId) as any[];

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return res.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        actionUrl: n.action_url,
        actionPayload: JSON.parse(n.action_payload_json || '{}'),
        isRead: Boolean(n.is_read),
        createdAt: n.created_at
      })),
      unreadCount
    });
  } catch (error: any) {
    console.error('❌ [Notifications] Fetch error:', error);
    return res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// PATCH /api/notifications/:id/read: Mark single notification read
notificationsRouter.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    return res.json({ success: true });
  } catch (error: any) {
    console.error('❌ [Notifications] Mark read error:', error);
    return res.status(500).json({ error: 'Failed to mark notification read' });
  }
});

// POST /api/notifications/read-all: Mark all notifications read
notificationsRouter.post('/read-all', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ? AND is_read = 0
    `).run(userId);

    return res.json({ success: true });
  } catch (error: any) {
    console.error('❌ [Notifications] Mark all read error:', error);
    return res.status(500).json({ error: 'Failed to mark all read' });
  }
});
