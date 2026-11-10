import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const accountsRouter = Router();

// GET /api/accounts: List all creator channels/profiles for the active user/manager
accountsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Check if user is a manager of another workspace
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    let managedWorkspaces: any[] = [];
    try {
      managedWorkspaces = JSON.parse(user?.managed_workspaces_json || '[]');
    } catch {
      managedWorkspaces = [];
    }

    let targetUserId = userId;
    let allowedAccountIds: string[] | 'all' = 'all';

    if (managedWorkspaces.length > 0 && user?.role === 'manager') {
      const activeWorkspace = managedWorkspaces[0];
      targetUserId = activeWorkspace.workspace_id;
      allowedAccountIds = activeWorkspace.assigned_accounts || 'all';
    }

    // 2. Fetch all accounts for targetUserId
    let accounts = await db.prepare(`
      SELECT * FROM creator_accounts 
      WHERE user_id = ? 
      ORDER BY created_at ASC
    `).all(targetUserId) as any[];

    // 3. If zero accounts exist, seed a primary account from user's profile
    if (accounts.length === 0) {
      const primaryHandle = user?.handle || user?.name?.toLowerCase().replace(/\s+/g, '_') || 'creator_primary';
      const primaryPlatform = user?.platform === 'youtube' ? 'youtube' : 'instagram';
      const defaultAccount = {
        id: uuidv4(),
        user_id: targetUserId,
        platform: primaryPlatform,
        handle: primaryHandle.startsWith('@') ? primaryHandle : `@${primaryHandle}`,
        name: user?.name || 'Primary Channel',
        avatar_url: user?.avatar_url || '',
        created_at: new Date().toISOString()
      };

      try {
        await db.prepare(`
          INSERT INTO creator_accounts (id, user_id, platform, handle, name, avatar_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          defaultAccount.id,
          defaultAccount.user_id,
          defaultAccount.platform,
          defaultAccount.handle,
          defaultAccount.name,
          defaultAccount.avatar_url,
          defaultAccount.created_at
        );
        accounts = [defaultAccount];
      } catch (err: any) {
        console.warn('⚠️ [Accounts] Auto-seed warning:', err.message);
      }
    }

    // 4. Filter if restricted to specific accounts
    if (allowedAccountIds !== 'all' && Array.isArray(allowedAccountIds)) {
      accounts = accounts.filter(acc => allowedAccountIds.includes(acc.id));
    }

    return res.json({ accounts });
  } catch (error: any) {
    console.error('❌ [Accounts] Fetch error:', error);
    return res.status(500).json({ error: 'Failed to retrieve accounts' });
  }
});

// POST /api/accounts: Create a new creator account (Only workspace owner)
accountsRouter.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { platform, handle, name, avatar_url } = req.body;
    if (!platform || !handle) {
      return res.status(400).json({ error: 'Platform and handle are required' });
    }

    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    const newAccount = {
      id: uuidv4(),
      user_id: userId,
      platform: platform === 'youtube' ? 'youtube' : 'instagram',
      handle: cleanHandle,
      name: (name || cleanHandle).trim(),
      avatar_url: avatar_url || '',
      created_at: new Date().toISOString()
    };

    await db.prepare(`
      INSERT INTO creator_accounts (id, user_id, platform, handle, name, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      newAccount.id,
      newAccount.user_id,
      newAccount.platform,
      newAccount.handle,
      newAccount.name,
      newAccount.avatar_url,
      newAccount.created_at
    );

    return res.status(201).json({ account: newAccount });
  } catch (error: any) {
    console.error('❌ [Accounts] Create error:', error);
    return res.status(500).json({ error: 'Failed to create account profile' });
  }
});

// DELETE /api/accounts/:id: Delete an account profile
accountsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await db.prepare('DELETE FROM creator_accounts WHERE id = ? AND user_id = ?').run(id, userId);
    return res.json({ success: true, message: 'Account deleted' });
  } catch (error: any) {
    console.error('❌ [Accounts] Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});
