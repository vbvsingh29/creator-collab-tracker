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
collabsRouter.get('/', (req: AuthRequest, res: Response) => {
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

    const rows = db.prepare(query).all(...params);
    const collabs = rows.map(mapCollabRow);

    res.json({ success: true, count: collabs.length, data: collabs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/collabs/:id (Tenant isolated)
collabsRouter.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }
    res.json({ success: true, data: mapCollabRow(row) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/collabs (Always associates created record with req.userId)
collabsRouter.post('/', (req: AuthRequest, res: Response) => {
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
        views_count, likes_count, deliverables_checklist, notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    insertStmt.run(
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
      now,
      now
    );

    const created = db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    res.status(201).json({ success: true, data: mapCollabRow(created) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/collabs/:id (Tenant isolated)
collabsRouter.put('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const userId = req.userId;
    const now = new Date().toISOString();

    const exists = db.prepare('SELECT id FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    if (!exists) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }

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
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    updateStmt.run(
      body.title,
      body.brand_id || null,
      body.brand_name,
      body.brand_category,
      body.contact_person || '',
      body.contact_email || '',
      body.platform,
      body.deliverable_format,
      body.format_label || '',
      body.commercial_type,
      body.currency,
      body.deal_amount,
      body.barter_estimated_value,
      body.payment_terms,
      body.payment_status,
      body.amount_paid,
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
      body.pipeline_stage,
      body.scheduled_post_date || null,
      body.actual_posted_date || null,
      body.live_post_url || '',
      body.views_count || 0,
      body.likes_count || 0,
      JSON.stringify(body.deliverables_checklist || []),
      body.notes || '',
      now,
      id,
      userId
    );

    const updated = db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    res.json({ success: true, data: mapCollabRow(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/collabs/:id/stage (Strictly tenant isolated)
collabsRouter.patch('/:id/stage', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const userId = req.userId;
    const now = new Date().toISOString();

    const result = db.prepare('UPDATE collabs SET pipeline_stage = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(stage, now, id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }

    const updated = db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    res.json({ success: true, data: mapCollabRow(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/collabs/:id/payment (Strictly tenant isolated)
collabsRouter.patch('/:id/payment', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_status, amount_paid, payment_received_date, invoice_number } = req.body;
    const userId = req.userId;
    const now = new Date().toISOString();

    const result = db.prepare(`
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

    const updated = db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    res.json({ success: true, data: mapCollabRow(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/collabs/:id/live (Strictly tenant isolated)
collabsRouter.patch('/:id/live', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { live_post_url, actual_posted_date } = req.body;
    const userId = req.userId;
    const now = new Date().toISOString();
    const postDate = actual_posted_date || now.split('T')[0];

    const result = db.prepare(`
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

    const updated = db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
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
        error: 'Unsupported platform link. CollabFlow currently supports YouTube videos/Shorts and Instagram Reels.' 
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

    const collab = db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId) as any;
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
    db.prepare(`
      UPDATE collabs SET
        views_count = ?,
        likes_count = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(views, likes, now, id, userId);

    const updated = db.prepare('SELECT * FROM collabs WHERE id = ? AND user_id = ?').get(id, userId);
    
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
collabsRouter.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = db.prepare('DELETE FROM collabs WHERE id = ? AND user_id = ?').run(id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Collaboration not found or unauthorized' });
    }
    res.json({ success: true, message: 'Collaboration deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
