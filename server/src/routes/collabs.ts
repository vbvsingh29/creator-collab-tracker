import { Router, Response } from 'express';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';
import { Collab } from '../types';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const collabsRouter = Router();

// Protect all collab routes with authentication
collabsRouter.use(requireAuth);

interface WorkspaceContext {
  ownerId: string;
  isManager: boolean;
  canViewFinancials: boolean;
  allowedAccountIds: string[] | 'all';
}

async function getWorkspaceContext(userId: string): Promise<WorkspaceContext> {
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  let managedWorkspaces: any[] = [];
  try {
    managedWorkspaces = JSON.parse(user?.managed_workspaces_json || '[]');
  } catch {
    managedWorkspaces = [];
  }

  if (managedWorkspaces.length > 0 && user?.role === 'manager') {
    const ws = managedWorkspaces[0];
    return {
      ownerId: ws.workspace_id,
      isManager: true,
      canViewFinancials: Boolean(ws.can_view_financials),
      allowedAccountIds: ws.assigned_accounts || 'all'
    };
  }

  return {
    ownerId: userId,
    isManager: false,
    canViewFinancials: true,
    allowedAccountIds: 'all'
  };
}

// Helper to deserialize database row into clean Collab object (with financial masking if restricted)
function mapCollabRow(row: any, canViewFinancials: boolean = true): Collab {
  const mapped: any = {
    ...row,
    has_ads_whitelisting: Boolean(row.has_ads_whitelisting),
    has_category_exclusivity: Boolean(row.has_category_exclusivity),
    deliverables_checklist: row.deliverables_checklist ? JSON.parse(row.deliverables_checklist) : [],
    agency_cut_percentage: row.agency_cut_percentage !== undefined ? Number(row.agency_cut_percentage) : 0,
    tds_percentage: row.tds_percentage !== undefined ? Number(row.tds_percentage) : 0,
    is_financial_masked: !canViewFinancials
  };

  if (!canViewFinancials) {
    mapped.deal_amount = 0;
    mapped.amount_paid = 0;
    mapped.barter_estimated_value = 0;
    mapped.agency_cut_percentage = 0;
    mapped.tds_percentage = 0;
  }

  return mapped;
}

// GET /api/collabs with user tenant isolation & filters
collabsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const ctx = await getWorkspaceContext(userId);

    const {
      platform,
      commercial_type,
      payment_status,
      pipeline_stage,
      deliverable_format,
      account_id,
      search,
      sort_by = 'updated_at',
      sort_order = 'DESC'
    } = req.query;

    let query = 'SELECT * FROM collabs WHERE user_id = ?';
    const params: any[] = [ctx.ownerId];

    // Filter by specific account if requested
    if (account_id && account_id !== 'all') {
      query += ' AND account_id = ?';
      params.push(account_id);
    } else if (ctx.allowedAccountIds !== 'all' && Array.isArray(ctx.allowedAccountIds)) {
      if (ctx.allowedAccountIds.length === 0) {
        return res.json({ success: true, count: 0, data: [] });
      }
      query += ` AND (account_id IN (${ctx.allowedAccountIds.map(() => '?').join(',')}) OR account_id = '' OR account_id IS NULL)`;
      params.push(...ctx.allowedAccountIds);
    }

    if (platform && platform !== 'all') {
      query += ' AND (platform = ? OR platform = "both")';
      params.push(platform);
    }

    if (commercial_type && commercial_type !== 'all') {
      query += ' AND commercial_type = ?';
      params.push(commercial_type);
    }

    if (payment_status && payment_status !== 'all') {
      query += ' AND payment_status = ?';
      params.push(payment_status);
    }

    if (pipeline_stage && pipeline_stage !== 'all') {
      query += ' AND pipeline_stage = ?';
      params.push(pipeline_stage);
    }

    if (deliverable_format && deliverable_format !== 'all') {
      query += ' AND deliverable_format = ?';
      params.push(deliverable_format);
    }

    if (search) {
      query += ' AND (title LIKE ? OR brand_name LIKE ? OR notes LIKE ? OR promo_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const allowedSortFields = ['created_at', 'updated_at', 'payment_due_date', 'deal_amount', 'scheduled_post_date', 'views_count'];
    const safeSortBy = allowedSortFields.includes(sort_by as string) ? sort_by : 'updated_at';
    const safeSortOrder = (sort_order as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    const rows = await db.prepare(query).all(...params);
    const collabs = rows.map(r => mapCollabRow(r, ctx.canViewFinancials));

    res.json({ success: true, count: collabs.length, data: collabs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/collabs/:id (Tenant isolated)
collabsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const ctx = await getWorkspaceContext(userId);

    const row = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(req.params.id, ctx.ownerId);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }
    res.json({ success: true, data: mapCollabRow(row, ctx.canViewFinancials) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/collabs (Associates record with workspace owner)
collabsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const id = uuidv4();
    const userId = req.userId!;
    const ctx = await getWorkspaceContext(userId);
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO collabs (
        id, user_id, title, brand_id, brand_name, brand_category, contact_person, contact_email,
        platform, deliverable_format, format_label, commercial_type, currency,
        deal_amount, barter_estimated_value, payment_terms, payment_status, amount_paid,
        invoice_number, invoice_date, payment_due_date, payment_received_date,
        has_ads_whitelisting, whitelisting_duration_days, whitelisting_expiry_date,
        has_category_exclusivity, exclusivity_days, promo_code, tracking_link,
        pipeline_stage, scheduled_post_date, actual_posted_date, live_post_url,
        views_count, likes_count, deliverables_checklist, notes, account_id, account_label, agency_cut_percentage, tds_percentage, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    // Mask financial input if manager lacks financial view permission
    const safeDealAmount = ctx.canViewFinancials ? (body.deal_amount || 0) : 0;
    const safeBarterValue = ctx.canViewFinancials ? (body.barter_estimated_value || 0) : 0;
    const safeAmountPaid = ctx.canViewFinancials ? (body.amount_paid || 0) : 0;
    const safeAgencyCut = ctx.canViewFinancials ? (body.agency_cut_percentage || 0) : 0;
    const safeTds = ctx.canViewFinancials ? (body.tds_percentage || 0) : 0;

    await insertStmt.run(
      id,
      ctx.ownerId,
      body.title || 'Untitled Collaboration',
      body.brand_id || null,
      body.brand_name || 'Brand Partner',
      body.brand_category || 'General',
      body.contact_person || '',
      body.contact_email || '',
      body.platform || 'instagram',
      body.deliverable_format || 'ig_integrated_reel',
      body.format_label || '',
      body.commercial_type || 'paid',
      body.currency || 'INR',
      safeDealAmount,
      safeBarterValue,
      body.payment_terms || 'net_30',
      body.payment_status || (body.commercial_type === 'barter' ? 'barter_delivered' : 'unbilled'),
      safeAmountPaid,
      body.invoice_number || '',
      body.invoice_date || null,
      body.payment_due_date || null,
      body.payment_received_date || null,
      body.has_ads_whitelisting ? 1 : 0,
      body.whitelisting_duration_days || 0,
      body.whitelisting_expiry_date || null,
      body.has_category_exclusivity ? 1 : 0,
      body.exclusivity_days || 0,
      body.promo_code || '',
      body.tracking_link || '',
      body.pipeline_stage || 'pitch_inquiry',
      body.scheduled_post_date || null,
      body.actual_posted_date || null,
      body.live_post_url || '',
      body.views_count || 0,
      body.likes_count || 0,
      JSON.stringify(body.deliverables_checklist || []),
      body.notes || '',
      body.account_id || '',
      body.account_label || '',
      safeAgencyCut,
      safeTds,
      now,
      now
    );

    const created = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, ctx.ownerId);
    res.status(201).json({ success: true, data: mapCollabRow(created, ctx.canViewFinancials) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT & PATCH /api/collabs/:id (Tenant isolated partial & full update)
const handleUpdateCollab = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const userId = req.userId!;
    const ctx = await getWorkspaceContext(userId);
    const now = new Date().toISOString();

    const existing = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, ctx.ownerId) as any;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }

    const merged = {
      title: body.title !== undefined ? body.title : existing.title,
      brand_id: body.brand_id !== undefined ? body.brand_id : existing.brand_id,
      brand_name: body.brand_name !== undefined ? body.brand_name : existing.brand_name,
      brand_category: body.brand_category !== undefined ? body.brand_category : existing.brand_category,
      contact_person: body.contact_person !== undefined ? body.contact_person : existing.contact_person,
      contact_email: body.contact_email !== undefined ? body.contact_email : existing.contact_email,
      platform: body.platform !== undefined ? body.platform : existing.platform,
      deliverable_format: body.deliverable_format !== undefined ? body.deliverable_format : existing.deliverable_format,
      format_label: body.format_label !== undefined ? body.format_label : existing.format_label,
      commercial_type: body.commercial_type !== undefined ? body.commercial_type : existing.commercial_type,
      currency: body.currency !== undefined ? body.currency : existing.currency,
      deal_amount: ctx.canViewFinancials && body.deal_amount !== undefined ? body.deal_amount : existing.deal_amount,
      barter_estimated_value: ctx.canViewFinancials && body.barter_estimated_value !== undefined ? body.barter_estimated_value : existing.barter_estimated_value,
      payment_terms: body.payment_terms !== undefined ? body.payment_terms : existing.payment_terms,
      payment_status: body.payment_status !== undefined ? body.payment_status : existing.payment_status,
      amount_paid: ctx.canViewFinancials && body.amount_paid !== undefined ? body.amount_paid : existing.amount_paid,
      invoice_number: body.invoice_number !== undefined ? body.invoice_number : existing.invoice_number,
      invoice_date: body.invoice_date !== undefined ? body.invoice_date : existing.invoice_date,
      payment_due_date: body.payment_due_date !== undefined ? body.payment_due_date : existing.payment_due_date,
      payment_received_date: body.payment_received_date !== undefined ? body.payment_received_date : existing.payment_received_date,
      has_ads_whitelisting: body.has_ads_whitelisting !== undefined ? (body.has_ads_whitelisting ? 1 : 0) : existing.has_ads_whitelisting,
      whitelisting_duration_days: body.whitelisting_duration_days !== undefined ? body.whitelisting_duration_days : existing.whitelisting_duration_days,
      whitelisting_expiry_date: body.whitelisting_expiry_date !== undefined ? body.whitelisting_expiry_date : existing.whitelisting_expiry_date,
      has_category_exclusivity: body.has_category_exclusivity !== undefined ? (body.has_category_exclusivity ? 1 : 0) : existing.has_category_exclusivity,
      exclusivity_days: body.exclusivity_days !== undefined ? body.exclusivity_days : existing.exclusivity_days,
      promo_code: body.promo_code !== undefined ? body.promo_code : existing.promo_code,
      tracking_link: body.tracking_link !== undefined ? body.tracking_link : existing.tracking_link,
      pipeline_stage: body.pipeline_stage !== undefined ? body.pipeline_stage : existing.pipeline_stage,
      scheduled_post_date: body.scheduled_post_date !== undefined ? body.scheduled_post_date : existing.scheduled_post_date,
      actual_posted_date: body.actual_posted_date !== undefined ? body.actual_posted_date : existing.actual_posted_date,
      live_post_url: body.live_post_url !== undefined ? body.live_post_url : existing.live_post_url,
      views_count: body.views_count !== undefined ? body.views_count : existing.views_count,
      likes_count: body.likes_count !== undefined ? body.likes_count : existing.likes_count,
      deliverables_checklist: body.deliverables_checklist !== undefined ? JSON.stringify(body.deliverables_checklist) : existing.deliverables_checklist,
      notes: body.notes !== undefined ? body.notes : existing.notes,
      account_id: body.account_id !== undefined ? body.account_id : existing.account_id,
      account_label: body.account_label !== undefined ? body.account_label : existing.account_label,
      agency_cut_percentage: ctx.canViewFinancials && body.agency_cut_percentage !== undefined ? body.agency_cut_percentage : existing.agency_cut_percentage,
      tds_percentage: ctx.canViewFinancials && body.tds_percentage !== undefined ? body.tds_percentage : existing.tds_percentage
    };

    const updateStmt = db.prepare(`
      UPDATE collabs SET
        title = ?, brand_id = ?, brand_name = ?, brand_category = ?, contact_person = ?, contact_email = ?,
        platform = ?, deliverable_format = ?, format_label = ?, commercial_type = ?, currency = ?,
        deal_amount = ?, barter_estimated_value = ?, payment_terms = ?, payment_status = ?, amount_paid = ?,
        invoice_number = ?, invoice_date = ?, payment_due_date = ?, payment_received_date = ?,
        has_ads_whitelisting = ?, whitelisting_duration_days = ?, whitelisting_expiry_date = ?,
        has_category_exclusivity = ?, exclusivity_days = ?, promo_code = ?, tracking_link = ?,
        pipeline_stage = ?, scheduled_post_date = ?, actual_posted_date = ?, live_post_url = ?,
        views_count = ?, likes_count = ?, deliverables_checklist = ?, notes = ?, account_id = ?, account_label = ?,
        agency_cut_percentage = ?, tds_percentage = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    await updateStmt.run(
      merged.title, merged.brand_id, merged.brand_name, merged.brand_category, merged.contact_person, merged.contact_email,
      merged.platform, merged.deliverable_format, merged.format_label, merged.commercial_type, merged.currency,
      merged.deal_amount, merged.barter_estimated_value, merged.payment_terms, merged.payment_status, merged.amount_paid,
      merged.invoice_number, merged.invoice_date, merged.payment_due_date, merged.payment_received_date,
      merged.has_ads_whitelisting, merged.whitelisting_duration_days, merged.whitelisting_expiry_date,
      merged.has_category_exclusivity, merged.exclusivity_days, merged.promo_code, merged.tracking_link,
      merged.pipeline_stage, merged.scheduled_post_date, merged.actual_posted_date, merged.live_post_url,
      merged.views_count, merged.likes_count, merged.deliverables_checklist, merged.notes, merged.account_id, merged.account_label,
      merged.agency_cut_percentage, merged.tds_percentage, now,
      id, ctx.ownerId
    );

    const updated = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, ctx.ownerId);
    res.json({ success: true, data: mapCollabRow(updated, ctx.canViewFinancials) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

collabsRouter.put('/:id', handleUpdateCollab);
collabsRouter.patch('/:id', handleUpdateCollab);

// DELETE /api/collabs/:id (Tenant isolated)
collabsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const ctx = await getWorkspaceContext(userId);

    const result = await db.prepare('DELETE FROM collabs WHERE id = ? AND user_id = ?').run(req.params.id, ctx.ownerId);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }
    res.json({ success: true, message: 'Collaboration deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
