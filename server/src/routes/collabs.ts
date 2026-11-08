import { Router, Response } from 'express';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';
import { Collab } from '../types';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const collabsRouter = Router();

// Protect all collab routes with authentication
collabsRouter.use(requireAuth);

// Helper to deserialize database row into clean Collab object
function mapCollabRow(row: any): Collab {
  return {
    ...row,
    has_ads_whitelisting: Boolean(row.has_ads_whitelisting),
    has_category_exclusivity: Boolean(row.has_category_exclusivity),
    deliverables_checklist: row.deliverables_checklist ? JSON.parse(row.deliverables_checklist) : []
  };
}

// GET /api/collabs with user tenant isolation & filters
collabsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      platform,
      commercial_type,
      payment_status,
      pipeline_stage,
      deliverable_format,
      search,
      sort_by = 'updated_at',
      sort_order = 'DESC'
    } = req.query;

    let query = 'SELECT * FROM collabs WHERE user_id = ?';
    const params: any[] = [userId];

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
    const collabs = rows.map(mapCollabRow);

    res.json({ success: true, count: collabs.length, data: collabs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/collabs/:id (Tenant isolated)
collabsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const row = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }
    res.json({ success: true, data: mapCollabRow(row) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/collabs (Always associates created record with req.userId)
collabsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const id = uuidv4();
    const userId = req.userId;
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
        views_count, likes_count, deliverables_checklist, notes, account_id, account_label, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    await insertStmt.run(
      id,
      userId,
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
      body.deal_amount || 0,
      body.barter_estimated_value || 0,
      body.payment_terms || 'net_30',
      body.payment_status || (body.commercial_type === 'barter' ? 'barter_delivered' : 'unbilled'),
      body.amount_paid || 0,
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
      now,
      now
    );

    const created = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    res.status(201).json({ success: true, data: mapCollabRow(created) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT & PATCH /api/collabs/:id (Tenant isolated partial & full update)
const handleUpdateCollab = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const userId = req.userId;
    const now = new Date().toISOString();

    const existing = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId) as any;
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
      deal_amount: body.deal_amount !== undefined ? Number(body.deal_amount) : existing.deal_amount,
      barter_estimated_value: body.barter_estimated_value !== undefined ? Number(body.barter_estimated_value) : existing.barter_estimated_value,
      payment_terms: body.payment_terms !== undefined ? body.payment_terms : existing.payment_terms,
      payment_status: body.payment_status !== undefined ? body.payment_status : existing.payment_status,
      amount_paid: body.amount_paid !== undefined ? Number(body.amount_paid) : existing.amount_paid,
      invoice_number: body.invoice_number !== undefined ? body.invoice_number : existing.invoice_number,
      invoice_date: body.invoice_date !== undefined ? body.invoice_date : existing.invoice_date,
      payment_due_date: body.payment_due_date !== undefined ? body.payment_due_date : existing.payment_due_date,
      payment_received_date: body.payment_received_date !== undefined ? body.payment_received_date : existing.payment_received_date,
      has_ads_whitelisting: body.has_ads_whitelisting !== undefined ? (body.has_ads_whitelisting ? 1 : 0) : existing.has_ads_whitelisting,
      whitelisting_duration_days: body.whitelisting_duration_days !== undefined ? Number(body.whitelisting_duration_days) : existing.whitelisting_duration_days,
      whitelisting_expiry_date: body.whitelisting_expiry_date !== undefined ? body.whitelisting_expiry_date : existing.whitelisting_expiry_date,
      has_category_exclusivity: body.has_category_exclusivity !== undefined ? (body.has_category_exclusivity ? 1 : 0) : existing.has_category_exclusivity,
      exclusivity_days: body.exclusivity_days !== undefined ? Number(body.exclusivity_days) : existing.exclusivity_days,
      promo_code: body.promo_code !== undefined ? body.promo_code : existing.promo_code,
      tracking_link: body.tracking_link !== undefined ? body.tracking_link : existing.tracking_link,
      pipeline_stage: body.pipeline_stage !== undefined ? body.pipeline_stage : existing.pipeline_stage,
      scheduled_post_date: body.scheduled_post_date !== undefined ? body.scheduled_post_date : existing.scheduled_post_date,
      actual_posted_date: body.actual_posted_date !== undefined ? body.actual_posted_date : existing.actual_posted_date,
      live_post_url: body.live_post_url !== undefined ? body.live_post_url : existing.live_post_url,
      views_count: body.views_count !== undefined ? Number(body.views_count) : existing.views_count,
      likes_count: body.likes_count !== undefined ? Number(body.likes_count) : existing.likes_count,
      deliverables_checklist: body.deliverables_checklist !== undefined 
        ? (typeof body.deliverables_checklist === 'string' ? body.deliverables_checklist : JSON.stringify(body.deliverables_checklist))
        : existing.deliverables_checklist,
      notes: body.notes !== undefined ? body.notes : existing.notes,
      account_id: body.account_id !== undefined ? body.account_id : (existing.account_id || ''),
      account_label: body.account_label !== undefined ? body.account_label : (existing.account_label || ''),
    };

    const updateStmt = db.prepare(`
      UPDATE collabs SET
        title = ?,
        brand_id = ?,
        brand_name = ?,
        brand_category = ?,
        contact_person = ?,
        contact_email = ?,
        platform = ?,
        deliverable_format = ?,
        format_label = ?,
        commercial_type = ?,
        currency = ?,
        deal_amount = ?,
        barter_estimated_value = ?,
        payment_terms = ?,
        payment_status = ?,
        amount_paid = ?,
        invoice_number = ?,
        invoice_date = ?,
        payment_due_date = ?,
        payment_received_date = ?,
        has_ads_whitelisting = ?,
        whitelisting_duration_days = ?,
        whitelisting_expiry_date = ?,
        has_category_exclusivity = ?,
        exclusivity_days = ?,
        promo_code = ?,
        tracking_link = ?,
        pipeline_stage = ?,
        scheduled_post_date = ?,
        actual_posted_date = ?,
        live_post_url = ?,
        views_count = ?,
        likes_count = ?,
        deliverables_checklist = ?,
        notes = ?,
        account_id = ?,
        account_label = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    await updateStmt.run(
      merged.title,
      merged.brand_id || null,
      merged.brand_name,
      merged.brand_category,
      merged.contact_person || '',
      merged.contact_email || '',
      merged.platform,
      merged.deliverable_format,
      merged.format_label || '',
      merged.commercial_type,
      merged.currency,
      merged.deal_amount,
      merged.barter_estimated_value,
      merged.payment_terms,
      merged.payment_status,
      merged.amount_paid,
      merged.invoice_number || '',
      merged.invoice_date || null,
      merged.payment_due_date || null,
      merged.payment_received_date || null,
      merged.has_ads_whitelisting,
      merged.whitelisting_duration_days,
      merged.whitelisting_expiry_date || null,
      merged.has_category_exclusivity,
      merged.exclusivity_days,
      merged.promo_code || '',
      merged.tracking_link || '',
      merged.pipeline_stage,
      merged.scheduled_post_date || null,
      merged.actual_posted_date || null,
      merged.live_post_url || '',
      merged.views_count,
      merged.likes_count,
      merged.deliverables_checklist,
      merged.notes || '',
      merged.account_id || '',
      merged.account_label || '',
      now,
      id,
      userId
    );

    const updated = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    res.json({ success: true, data: mapCollabRow(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

collabsRouter.put('/:id', handleUpdateCollab);
collabsRouter.patch('/:id', handleUpdateCollab);

// PATCH /api/collabs/:id/stage (Strictly tenant isolated)
collabsRouter.patch('/:id/stage', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const userId = req.userId;
    const now = new Date().toISOString();

    const result = await db.prepare('UPDATE collabs SET pipeline_stage = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(stage, now, id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }

    const updated = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    res.json({ success: true, data: mapCollabRow(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/collabs/:id/payment (Strictly tenant isolated)
collabsRouter.patch('/:id/payment', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_status, amount_paid, payment_received_date, invoice_number } = req.body;
    const userId = req.userId;
    const now = new Date().toISOString();

    const result = await db.prepare(`
      UPDATE collabs SET
        payment_status = COALESCE(?, payment_status),
        amount_paid = COALESCE(?, amount_paid),
        payment_received_date = COALESCE(?, payment_received_date),
        invoice_number = COALESCE(?, invoice_number),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(payment_status, amount_paid, payment_received_date, invoice_number, now, id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }

    const updated = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    res.json({ success: true, data: mapCollabRow(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/collabs/:id/live (Strictly tenant isolated)
collabsRouter.patch('/:id/live', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { live_post_url, actual_posted_date } = req.body;
    const userId = req.userId;
    const now = new Date().toISOString();
    const postDate = actual_posted_date || now.split('T')[0];

    const result = await db.prepare(`
      UPDATE collabs SET
        live_post_url = ?,
        actual_posted_date = ?,
        pipeline_stage = 'posted_live',
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(live_post_url, postDate, now, id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }

    const updated = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    res.json({ success: true, data: mapCollabRow(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/collabs/preview-url (Free auto-fetch YouTube or Instagram media details with validation)
collabsRouter.post('/preview-url', async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid content link.' 
      });
    }

    const trimmedUrl = url.trim();
    const cleanUrl = trimmedUrl.toLowerCase();

    // Validate protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        error: 'URL must begin with https:// or http://'
      });
    }

    const { getYouTubeMediaDetails, getInstagramMediaDetails } = require('../services/mediaIntegrations');

    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      try {
        const details = await getYouTubeMediaDetails(trimmedUrl);
        return res.json({ 
          success: true, 
          data: details,
          message: `Successfully detected YouTube content: "${details.title}"`
        });
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          error: `Could not parse YouTube link. Please make sure the link is in the format https://youtube.com/watch?v=... or https://youtu.be/...`
        });
      }
    } else if (cleanUrl.includes('instagram.com')) {
      try {
        const details = await getInstagramMediaDetails(trimmedUrl);
        return res.json({ 
          success: true, 
          data: details,
          message: `Successfully detected Instagram Reel.`
        });
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          error: `Could not parse Instagram link. Please make sure the link is an Instagram Reel or post (e.g. https://instagram.com/reel/...)`
        });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported platform link. Collabio currently supports YouTube videos/Shorts and Instagram Reels.' 
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/collabs/:id/sync-metrics (Fetch live views & likes with detailed status message)
collabsRouter.post('/:id/sync-metrics', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const collab = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!collab) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }

    if (!collab.live_post_url || !collab.live_post_url.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'No live post URL is saved for this collaboration. Please enter a valid URL first.' 
      });
    }

    const { getYouTubeMediaDetails, getInstagramMediaDetails } = require('../services/mediaIntegrations');
    const url = collab.live_post_url.toLowerCase();
    let details: any = null;
    let integrationName = '';
    let modeUsed = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      integrationName = 'YouTube';
      modeUsed = process.env.YOUTUBE_API_KEY ? 'Official YouTube Data API v3' : 'Public Interaction Scraper';
      details = await getYouTubeMediaDetails(collab.live_post_url);
    } else if (url.includes('instagram.com')) {
      integrationName = 'Instagram';
      modeUsed = process.env.INSTAGRAM_ACCESS_TOKEN ? 'Meta Graph API' : 'Public Open Graph Crawler';
      details = await getInstagramMediaDetails(collab.live_post_url);
    } else {
      return res.status(400).json({
        success: false,
        error: 'The saved link does not match YouTube or Instagram.'
      });
    }

    const views = (details && details.viewsCount > 0) ? details.viewsCount : collab.views_count;
    const likes = (details && details.likesCount > 0) ? details.likesCount : collab.likes_count;

    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE collabs SET
        views_count = ?,
        likes_count = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(views, likes, now, id, userId);

    const updated = await db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    
    res.json({ 
      success: true, 
      data: mapCollabRow(updated), 
      mediaDetails: details,
      integration: {
        platform: integrationName,
        mode: modeUsed,
        viewsSynced: views,
        likesSynced: likes,
        hasAdDisclosure: details?.hasAdDisclosure || false,
        message: `✓ Successfully synced live metrics via ${integrationName} (${modeUsed})! Views: ${views.toLocaleString()}, Likes: ${likes.toLocaleString()}`
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/collabs/:id (Strictly tenant isolated)
collabsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = await db.prepare('DELETE FROM collabs WHERE id = ? AND user_id = ?').run(id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }
    res.json({ success: true, message: 'Collaboration deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
