import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const cmsRouter = Router();

export interface CmsBanner {
  enabled: boolean;
  badgeText: string;
  messageText: string;
  ctaText: string;
  ctaUrl: string;
  variant: 'gold' | 'emerald' | 'amber' | 'charcoal';
}

export interface CmsHero {
  badgeText: string;
  titleHighlight: string;
  titleMain: string;
  subtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
}

export interface CmsPricingPackage {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  isPopular: boolean;
  badge?: string;
  ctaText: string;
  ctaUrl: string;
  features: string[];
}

export interface CmsFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface CmsContent {
  banner: CmsBanner;
  hero: CmsHero;
  pricing: {
    badgeText: string;
    title: string;
    subtitle: string;
    billingDiscountBadge: string;
    packages: CmsPricingPackage[];
  };
  faqs: CmsFaqItem[];
}

export const DEFAULT_CMS_CONTENT: CmsContent = {
  banner: {
    enabled: true,
    badgeText: 'EARLY ACCESS',
    messageText: 'Claim 30% off Creator Pro with code FOUNDER30 for a limited time.',
    ctaText: 'Claim Offer →',
    ctaUrl: '#pricing',
    variant: 'gold'
  },
  hero: {
    badgeText: 'Private Beta Available',
    titleHighlight: 'Run Your Creator Career',
    titleMain: 'Like a Fortune 500 Enterprise',
    subtitle: 'Stop juggling messy WhatsApp threads and delayed invoices. Collabio is the bespoke operating system for elite YouTube and Instagram creators to track deliverables, automate follow-ups, and get paid faster.',
    primaryCtaText: 'Start 14-Day Private Access',
    secondaryCtaText: 'Explore Rate Calculator'
  },
  pricing: {
    badgeText: 'Transparent Pricing',
    title: 'Simple, transparent tiers.',
    subtitle: 'Free to get started. Upgrade only when your multi-channel sponsor volume and team scale.',
    billingDiscountBadge: 'Save 20%',
    packages: [
      {
        id: 'solo-creator',
        name: 'Solo Creator',
        tagline: 'Essential deal tracking for individual creators managing brand sponsorships.',
        priceMonthly: 0,
        priceAnnual: 0,
        currency: 'USD',
        isPopular: false,
        badge: 'Free Forever',
        ctaText: 'Get Started Free',
        ctaUrl: '#auth',
        features: [
          'Up to 10 active brand collaborations',
          'Pipeline board (Kanban & Table view)',
          'YouTube & Instagram deliverable formats',
          'Mobile SMS OTP & passwordless login',
          'Basic deliverables & contract checklist'
        ]
      },
      {
        id: 'pro-teams',
        name: 'Pro & Teams',
        tagline: 'Multi-account management, manager invites with financial privacy, and automated sync.',
        priceMonthly: 19,
        priceAnnual: 15,
        currency: 'USD',
        isPopular: true,
        badge: 'Most Popular',
        ctaText: 'Start 14-Day Free Trial',
        ctaUrl: '#auth',
        features: [
          'Unlimited brand deals & historical archives',
          'Multi-Account Creator Hub (IG & YT profiles)',
          'Team Manager invites with Financial Privacy masking',
          'Live views & likes performance sync',
          'Tax-ready PDF invoices (GST / TDS / VAT)',
          'Automated WhatsApp & Email follow-up alerts'
        ]
      }
    ]
  },
  faqs: [
    {
      id: 'faq-1',
      question: 'How does Multi-Account management work for creators?',
      answer: 'If you run multiple YouTube channels or Instagram accounts (e.g., Tech and Lifestyle), Collabio lets you connect them all under one workspace. You can switch accounts with 1 click or view your combined sponsorship pipeline.'
    },
    {
      id: 'faq-2',
      question: 'Can my managers have access without seeing my financial rates?',
      answer: 'Yes. When inviting a manager, you can toggle "Financial Privacy". Managers can manage deliverables, scripts, and schedules, but all deal rates, earnings, and invoices remain completely hidden and masked.'
    },
    {
      id: 'faq-3',
      question: 'How does the Exclusivity Scanner work?',
      answer: 'When you log a deal, you tag the brand industry (e.g. VPN, Energy Drinks, Smartphones) and any lock window. If an upcoming sponsor proposal overlaps within that window, Collabio warns you before you commit.'
    },
    {
      id: 'faq-4',
      question: 'Can I generate tax-ready PDF invoices?',
      answer: 'Yes. The built-in invoice tool automatically formats your studio details, tax ID (GSTIN/PAN/VAT), and bank wire or UPI details into clean printable PDF invoices.'
    }
  ]
};

// Admin authorization guard
async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.userId;
  const userEmail = (req.userEmail || '').toLowerCase();

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  // Master admin override
  if (userEmail === 'vbvsingh2905@gmail.com') {
    return next();
  }

  try {
    const user = await db.prepare('SELECT role, email FROM users WHERE id = ?').get(userId) as any;
    if (user && (user.role === 'admin' || (user.email && user.email.toLowerCase() === 'vbvsingh2905@gmail.com'))) {
      return next();
    }
    return res.status(403).json({ success: false, error: 'Admin privileges required to access CMS Studio.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Permission check failed' });
  }
}

/**
 * GET /api/cms/public
 * Zero-auth public endpoint used by Landing Page visitors.
 * Returns the published content, with fallback to default seed.
 */
cmsRouter.get('/public', async (_req: Request, res: Response) => {
  try {
    const row = await db.prepare('SELECT published_content_json, published_at FROM site_cms WHERE id = ?').get('landing_page') as any;
    if (row && row.published_content_json) {
      try {
        const parsed = JSON.parse(row.published_content_json);
        return res.json({
          success: true,
          data: parsed,
          publishedAt: row.published_at
        });
      } catch (parseErr) {
        console.warn('Malformed published CMS JSON, returning default seed');
      }
    }

    return res.json({
      success: true,
      data: DEFAULT_CMS_CONTENT,
      publishedAt: null
    });
  } catch (error: any) {
    console.warn('[CMS Public API] Fallback to default content:', error.message);
    return res.json({
      success: true,
      data: DEFAULT_CMS_CONTENT,
      publishedAt: null
    });
  }
});

/**
 * GET /api/cms/admin
 * Requires Admin. Returns both draft and published states for the Admin Studio.
 */
cmsRouter.get('/admin', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const row = await db.prepare('SELECT * FROM site_cms WHERE id = ?').get('landing_page') as any;

    let draft = DEFAULT_CMS_CONTENT;
    let published = DEFAULT_CMS_CONTENT;
    let publishedAt = null;
    let updatedAt = null;

    if (row) {
      if (row.draft_content_json) {
        try { draft = JSON.parse(row.draft_content_json); } catch {}
      }
      if (row.published_content_json) {
        try { published = JSON.parse(row.published_content_json); } catch {}
      }
      publishedAt = row.published_at;
      updatedAt = row.updated_at;
    } else {
      // Auto-initialize row in database
      const now = new Date().toISOString();
      const initialJson = JSON.stringify(DEFAULT_CMS_CONTENT);
      await db.prepare(`
        INSERT INTO site_cms (id, draft_content_json, published_content_json, published_at, updated_at, updated_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('landing_page', initialJson, initialJson, now, now, 'system_init');
      publishedAt = now;
      updatedAt = now;
    }

    return res.json({
      success: true,
      data: {
        draft,
        published,
        publishedAt,
        updatedAt,
        hasUnpublishedChanges: JSON.stringify(draft) !== JSON.stringify(published)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/cms/draft
 * Requires Admin. Saves work-in-progress edits to the draft without affecting live visitors.
 */
cmsRouter.put('/draft', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { draft } = req.body;
    if (!draft || typeof draft !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid draft content payload' });
    }

    const now = new Date().toISOString();
    const draftJson = JSON.stringify(draft);
    const userId = req.userId || 'admin';

    const existing = await db.prepare('SELECT id, published_content_json FROM site_cms WHERE id = ?').get('landing_page') as any;

    if (existing) {
      await db.prepare(`
        UPDATE site_cms
        SET draft_content_json = ?, updated_at = ?, updated_by = ?
        WHERE id = ?
      `).run(draftJson, now, userId, 'landing_page');
    } else {
      const defaultPublished = JSON.stringify(DEFAULT_CMS_CONTENT);
      await db.prepare(`
        INSERT INTO site_cms (id, draft_content_json, published_content_json, published_at, updated_at, updated_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('landing_page', draftJson, defaultPublished, now, now, userId);
    }

    return res.json({
      success: true,
      message: 'Draft changes saved successfully.',
      updatedAt: now
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/cms/publish
 * Requires Admin. Copies draft content to published content, instantly going live.
 */
cmsRouter.post('/publish', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date().toISOString();
    const userId = req.userId || 'admin';

    // Optional direct content passed in body, or promote current draft
    const directContent = req.body.content;
    const existing = await db.prepare('SELECT * FROM site_cms WHERE id = ?').get('landing_page') as any;

    let contentToPublishJson: string;

    if (directContent && typeof directContent === 'object') {
      contentToPublishJson = JSON.stringify(directContent);
    } else if (existing && existing.draft_content_json) {
      contentToPublishJson = existing.draft_content_json;
    } else {
      contentToPublishJson = JSON.stringify(DEFAULT_CMS_CONTENT);
    }

    if (existing) {
      await db.prepare(`
        UPDATE site_cms
        SET published_content_json = ?, draft_content_json = ?, published_at = ?, updated_at = ?, updated_by = ?
        WHERE id = ?
      `).run(contentToPublishJson, contentToPublishJson, now, now, userId, 'landing_page');
    } else {
      await db.prepare(`
        INSERT INTO site_cms (id, draft_content_json, published_content_json, published_at, updated_at, updated_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('landing_page', contentToPublishJson, contentToPublishJson, now, now, userId);
    }

    return res.json({
      success: true,
      message: 'Content successfully published to live website!',
      publishedAt: now,
      data: JSON.parse(contentToPublishJson)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/cms/reset-draft
 * Requires Admin. Discards draft changes by restoring published content into draft.
 */
cmsRouter.post('/reset-draft', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date().toISOString();
    const existing = await db.prepare('SELECT published_content_json FROM site_cms WHERE id = ?').get('landing_page') as any;

    if (!existing || !existing.published_content_json) {
      return res.json({ success: true, message: 'Nothing to reset', draft: DEFAULT_CMS_CONTENT });
    }

    await db.prepare(`
      UPDATE site_cms
      SET draft_content_json = published_content_json, updated_at = ?
      WHERE id = ?
    `).run(now, 'landing_page');

    return res.json({
      success: true,
      message: 'Draft reset to currently published version.',
      draft: JSON.parse(existing.published_content_json)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
