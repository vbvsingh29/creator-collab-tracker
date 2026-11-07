import { Router, Response } from 'express';
import { db } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const statsRouter = Router();

// Protect stats with authentication
statsRouter.use(requireAuth);

// GET /api/stats (Tenant isolated to logged in creator)
statsRouter.get('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const collabs = db.prepare('SELECT * FROM collabs WHERE user_id = ?').all(userId) as any[];

    let total_deals = collabs.length;
    let total_revenue_inr = 0;
    let total_revenue_usd = 0;
    let total_paid_inr = 0;
    let total_paid_usd = 0;
    let total_pending_inr = 0;
    let total_pending_usd = 0;
    let overdue_count = 0;
    let overdue_amount_inr = 0;
    let overdue_amount_usd = 0;
    let barter_total_value_inr = 0;
    let barter_total_value_usd = 0;
    let whitelisting_active_count = 0;

    const deals_by_platform = {
      instagram: 0,
      youtube: 0,
      both: 0,
    };

    const deals_by_format: Record<string, number> = {};
    const deals_by_stage: Record<string, number> = {
      pitch_inquiry: 0,
      negotiating: 0,
      script_approved: 0,
      content_production: 0,
      brand_review: 0,
      scheduled: 0,
      posted_live: 0,
      completed: 0,
    };

    const deals_by_commercial = {
      paid: 0,
      barter: 0,
      affiliate: 0,
      hybrid: 0,
    };

    for (const c of collabs) {
      if (c.platform in deals_by_platform) {
        deals_by_platform[c.platform as keyof typeof deals_by_platform]++;
      }

      deals_by_format[c.deliverable_format] = (deals_by_format[c.deliverable_format] || 0) + 1;

      if (c.pipeline_stage in deals_by_stage) {
        deals_by_stage[c.pipeline_stage]++;
      }

      if (c.commercial_type in deals_by_commercial) {
        deals_by_commercial[c.commercial_type as keyof typeof deals_by_commercial]++;
      }

      if (c.has_ads_whitelisting) {
        whitelisting_active_count++;
      }

      const USD_RATE = 86.0;
      const isUsd = c.currency === 'USD';
      const amount = Number(c.deal_amount) || 0;
      const paid = Number(c.amount_paid) || 0;
      const pending = Math.max(0, amount - paid);
      const barterVal = Number(c.barter_estimated_value) || 0;

      const amountInr = isUsd ? Math.round(amount * USD_RATE) : amount;
      const amountUsd = isUsd ? amount : Math.round(amount / USD_RATE);
      const paidInr = isUsd ? Math.round(paid * USD_RATE) : paid;
      const paidUsd = isUsd ? paid : Math.round(paid / USD_RATE);
      const pendingInr = isUsd ? Math.round(pending * USD_RATE) : pending;
      const pendingUsd = isUsd ? pending : Math.round(pending / USD_RATE);
      const barterInr = isUsd ? Math.round(barterVal * USD_RATE) : barterVal;
      const barterUsd = isUsd ? barterVal : Math.round(barterVal / USD_RATE);

      total_revenue_inr += amountInr;
      total_revenue_usd += amountUsd;
      total_paid_inr += paidInr;
      total_paid_usd += paidUsd;
      total_pending_inr += pendingInr;
      total_pending_usd += pendingUsd;
      barter_total_value_inr += barterInr;
      barter_total_value_usd += barterUsd;

      if (c.payment_status === 'overdue') {
        overdue_count++;
        overdue_amount_inr += pendingInr;
        overdue_amount_usd += pendingUsd;
      }
    }

    res.json({
      success: true,
      data: {
        total_deals,
        total_revenue_inr,
        total_revenue_usd,
        total_paid_inr,
        total_paid_usd,
        total_pending_inr,
        total_pending_usd,
        overdue_count,
        overdue_amount_inr,
        overdue_amount_usd,
        barter_total_value_inr,
        barter_total_value_usd,
        whitelisting_active_count,
        deals_by_platform,
        deals_by_format,
        deals_by_stage,
        deals_by_commercial,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
