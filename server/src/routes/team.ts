import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { sendTeamInviteEmail } from '../services/emailService';
import { createNotification } from './notifications';

export const teamRouter = Router();

// GET /api/team: List active team members and pending invites for creator workspace
teamRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    let teamMembers: any[] = [];
    try {
      teamMembers = JSON.parse(user?.team_members_json || '[]');
    } catch {
      teamMembers = [];
    }

    const pendingInvites = await db.prepare(`
      SELECT * FROM team_invites 
      WHERE workspace_id = ? AND status = 'pending'
      ORDER BY created_at DESC
    `).all(userId) as any[];

    return res.json({
      members: teamMembers,
      pendingInvites: pendingInvites.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        canViewFinancials: Boolean(inv.can_view_financials),
        assignedAccounts: JSON.parse(inv.assigned_accounts_json || '[]'),
        token: inv.token,
        status: inv.status,
        createdAt: inv.created_at
      }))
    });
  } catch (error: any) {
    console.error('❌ [Team] List error:', error);
    return res.status(500).json({ error: 'Failed to retrieve team members' });
  }
});

// POST /api/team/invite: Invite a manager (handles both existing user and new user)
teamRouter.post('/invite', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const creatorId = req.userId;
    if (!creatorId) return res.status(401).json({ error: 'Unauthorized' });

    const { email, role = 'manager', canViewFinancials = false, assignedAccounts = ['all'] } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const creator = await db.prepare('SELECT * FROM users WHERE id = ?').get(creatorId) as any;
    const creatorName = creator?.name || 'Creator';

    // 1. Fetch account labels for the email notification
    let accountsLabel = 'All Channels';
    if (Array.isArray(assignedAccounts) && assignedAccounts.length > 0 && !assignedAccounts.includes('all')) {
      const accounts = await db.prepare(`
        SELECT handle FROM creator_accounts 
        WHERE user_id = ? AND id IN (${assignedAccounts.map(() => '?').join(',')})
      `).all(creatorId, ...assignedAccounts) as any[];
      if (accounts.length > 0) {
        accountsLabel = accounts.map(a => a.handle).join(', ');
      }
    }

    // 2. Check if user already exists in the system
    const existingUser = await db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (existingUser) {
      // User exists! Link them directly to this creator's workspace
      let creatorTeam: any[] = [];
      try {
        creatorTeam = JSON.parse(creator?.team_members_json || '[]');
      } catch {
        creatorTeam = [];
      }

      // Check if already in team
      const existingMemberIndex = creatorTeam.findIndex(m => m.user_id === existingUser.id || m.email === cleanEmail);
      const memberRecord = {
        id: existingMemberIndex >= 0 ? creatorTeam[existingMemberIndex].id : uuidv4(),
        user_id: existingUser.id,
        name: existingUser.name,
        email: cleanEmail,
        role,
        can_view_financials: Boolean(canViewFinancials),
        assigned_accounts: assignedAccounts,
        joined_at: new Date().toISOString()
      };

      if (existingMemberIndex >= 0) {
        creatorTeam[existingMemberIndex] = memberRecord;
      } else {
        creatorTeam.push(memberRecord);
      }

      await db.prepare('UPDATE users SET team_members_json = ? WHERE id = ?')
        .run(JSON.stringify(creatorTeam), creatorId);

      // Also update the manager's managed_workspaces_json
      let managedWorkspaces: any[] = [];
      try {
        managedWorkspaces = JSON.parse(existingUser.managed_workspaces_json || '[]');
      } catch {
        managedWorkspaces = [];
      }

      const wsIndex = managedWorkspaces.findIndex(w => w.workspace_id === creatorId);
      const wsRecord = {
        workspace_id: creatorId,
        creator_name: creatorName,
        role,
        can_view_financials: Boolean(canViewFinancials),
        assigned_accounts: assignedAccounts,
        updated_at: new Date().toISOString()
      };

      if (wsIndex >= 0) {
        managedWorkspaces[wsIndex] = wsRecord;
      } else {
        managedWorkspaces.push(wsRecord);
      }

      // Set user role to manager if not already an admin/creator
      const newRole = existingUser.role === 'creator' ? 'creator' : 'manager';
      await db.prepare('UPDATE users SET managed_workspaces_json = ?, role = ? WHERE id = ?')
        .run(JSON.stringify(managedWorkspaces), newRole, existingUser.id);

      // Create in-app notification for the invited user
      await createNotification({
        userId: existingUser.id,
        type: 'team_invite',
        title: `Added to ${creatorName}'s Team`,
        message: `${creatorName} granted you manager access for ${accountsLabel}.`,
        actionUrl: '/workspace'
      });

      // Send email alert to existing user
      const appUrl = process.env.CLIENT_URL || 'https://creator-collab-tracker-six.vercel.app';
      await sendTeamInviteEmail({
        to: cleanEmail,
        creatorName,
        isExistingUser: true,
        canViewFinancials: Boolean(canViewFinancials),
        assignedAccountsLabel: accountsLabel,
        inviteLink: `${appUrl}/workspace`
      });

      return res.status(200).json({
        status: 'added_existing',
        message: `Added existing user ${existingUser.name} as manager`,
        member: memberRecord
      });
    }

    // 3. User does NOT exist: Create pending invitation
    const inviteToken = uuidv4();
    const inviteId = uuidv4();
    const now = new Date().toISOString();

    // Check if there was an existing pending invite for this email
    await db.prepare('DELETE FROM team_invites WHERE workspace_id = ? AND email = ?').run(creatorId, cleanEmail);

    await db.prepare(`
      INSERT INTO team_invites (id, workspace_id, creator_name, email, role, can_view_financials, assigned_accounts_json, token, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(
      inviteId,
      creatorId,
      creatorName,
      cleanEmail,
      role,
      canViewFinancials ? 1 : 0,
      JSON.stringify(assignedAccounts),
      inviteToken,
      now,
      now
    );

    const appUrl = process.env.CLIENT_URL || 'https://creator-collab-tracker-six.vercel.app';
    const inviteLink = `${appUrl}/?invite=${inviteToken}`;

    await sendTeamInviteEmail({
      to: cleanEmail,
      creatorName,
      isExistingUser: false,
      canViewFinancials: Boolean(canViewFinancials),
      assignedAccountsLabel: accountsLabel,
      inviteLink
    });

    return res.status(201).json({
      status: 'invite_sent',
      message: `Invitation email sent to ${cleanEmail}`,
      invite: {
        id: inviteId,
        email: cleanEmail,
        role,
        canViewFinancials: Boolean(canViewFinancials),
        assignedAccounts,
        token: inviteToken,
        createdAt: now
      }
    });
  } catch (error: any) {
    console.error('❌ [Team] Invite error:', error);
    return res.status(500).json({ error: 'Failed to process team invitation' });
  }
});

// POST /api/team/accept-invite: Accept an invite via token (called after signup/login)
teamRouter.post('/accept-invite', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    const { token } = req.body;
    if (!userId || !token) return res.status(400).json({ error: 'Token and authentication required' });

    const invite = await db.prepare('SELECT * FROM team_invites WHERE token = ? AND status = "pending"').get(token) as any;
    if (!invite) {
      return res.status(404).json({ error: 'Invalid or expired invitation token' });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    const creator = await db.prepare('SELECT * FROM users WHERE id = ?').get(invite.workspace_id) as any;

    if (!creator) {
      return res.status(404).json({ error: 'Inviting workspace no longer exists' });
    }

    // 1. Add manager to creator's team_members_json
    let creatorTeam: any[] = [];
    try {
      creatorTeam = JSON.parse(creator.team_members_json || '[]');
    } catch {
      creatorTeam = [];
    }

    const memberRecord = {
      id: uuidv4(),
      user_id: user.id,
      name: user.name,
      email: user.email,
      role: invite.role,
      can_view_financials: Boolean(invite.can_view_financials),
      assigned_accounts: JSON.parse(invite.assigned_accounts_json || '[]'),
      joined_at: new Date().toISOString()
    };

    creatorTeam.push(memberRecord);
    await db.prepare('UPDATE users SET team_members_json = ? WHERE id = ?')
      .run(JSON.stringify(creatorTeam), invite.workspace_id);

    // 2. Add creator's workspace to user's managed_workspaces_json
    let managedWorkspaces: any[] = [];
    try {
      managedWorkspaces = JSON.parse(user.managed_workspaces_json || '[]');
    } catch {
      managedWorkspaces = [];
    }

    managedWorkspaces.push({
      workspace_id: invite.workspace_id,
      creator_name: invite.creator_name || creator.name,
      role: invite.role,
      can_view_financials: Boolean(invite.can_view_financials),
      assigned_accounts: JSON.parse(invite.assigned_accounts_json || '[]'),
      joined_at: new Date().toISOString()
    });

    await db.prepare('UPDATE users SET managed_workspaces_json = ?, role = "manager" WHERE id = ?')
      .run(JSON.stringify(managedWorkspaces), user.id);

    // 3. Mark invite as accepted
    await db.prepare('UPDATE team_invites SET status = "accepted", updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), invite.id);

    // 4. Notify creator
    await createNotification({
      userId: invite.workspace_id,
      type: 'team_invite_accepted',
      title: 'Manager Joined Your Team',
      message: `${user.name} (${user.email}) accepted your invitation to manage deals.`,
      actionUrl: '/workspace'
    });

    return res.json({ success: true, message: 'Invitation accepted successfully' });
  } catch (error: any) {
    console.error('❌ [Team] Accept error:', error);
    return res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// DELETE /api/team/members/:memberId: Remove a manager from creator's workspace
teamRouter.delete('/members/:memberId', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const creatorId = req.userId;
    const { memberId } = req.params;
    if (!creatorId) return res.status(401).json({ error: 'Unauthorized' });

    const creator = await db.prepare('SELECT * FROM users WHERE id = ?').get(creatorId) as any;
    let creatorTeam: any[] = [];
    try {
      creatorTeam = JSON.parse(creator?.team_members_json || '[]');
    } catch {
      creatorTeam = [];
    }

    const removedMember = creatorTeam.find(m => m.id === memberId || m.user_id === memberId);
    creatorTeam = creatorTeam.filter(m => m.id !== memberId && m.user_id !== memberId);

    await db.prepare('UPDATE users SET team_members_json = ? WHERE id = ?')
      .run(JSON.stringify(creatorTeam), creatorId);

    // Also remove from manager's managed_workspaces_json if found
    if (removedMember?.user_id) {
      const managerUser = await db.prepare('SELECT * FROM users WHERE id = ?').get(removedMember.user_id) as any;
      if (managerUser) {
        let managed: any[] = [];
        try {
          managed = JSON.parse(managerUser.managed_workspaces_json || '[]');
        } catch {
          managed = [];
        }
        managed = managed.filter(w => w.workspace_id !== creatorId);
        await db.prepare('UPDATE users SET managed_workspaces_json = ? WHERE id = ?')
          .run(JSON.stringify(managed), managerUser.id);
      }
    }

    return res.json({ success: true, message: 'Member removed from team' });
  } catch (error: any) {
    console.error('❌ [Team] Remove member error:', error);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
});

// DELETE /api/team/invites/:inviteId: Revoke a pending invite
teamRouter.delete('/invites/:inviteId', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const creatorId = req.userId;
    const { inviteId } = req.params;
    if (!creatorId) return res.status(401).json({ error: 'Unauthorized' });

    await db.prepare('DELETE FROM team_invites WHERE id = ? AND workspace_id = ?').run(inviteId, creatorId);
    return res.json({ success: true, message: 'Invite revoked' });
  } catch (error: any) {
    console.error('❌ [Team] Revoke invite error:', error);
    return res.status(500).json({ error: 'Failed to revoke invite' });
  }
});
