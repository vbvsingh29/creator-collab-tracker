import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchPublicCms, fetchAdminCms, saveDraftCms, publishCms, resetDraftCms } from '../services/api';
import { useAuth } from './AuthContext';

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

interface CmsContextType {
  content: CmsContent;              // Active content for public landing page
  draftContent: CmsContent | null;  // Current draft in admin studio
  isAdmin: boolean;
  previewMode: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  hasUnpublishedChanges: boolean;
  loading: boolean;
  setPreviewMode: (enabled: boolean) => void;
  updateDraft: (updater: (prev: CmsContent) => CmsContent) => void;
  saveDraft: () => Promise<boolean>;
  publishToLive: () => Promise<boolean>;
  discardDraft: () => Promise<boolean>;
  refreshCms: () => Promise<void>;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [publishedContent, setPublishedContent] = useState<CmsContent>(DEFAULT_CMS_CONTENT);
  const [draftContent, setDraftContent] = useState<CmsContent | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check admin role
  const isAdmin = Boolean(
    user && (
      (user as any).role === 'admin' ||
      user.email?.toLowerCase() === 'vbvsingh2905@gmail.com'
    )
  );

  // Load public CMS content
  const loadPublic = useCallback(async () => {
    try {
      const res = await fetchPublicCms();
      if (res && res.data) {
        setPublishedContent(res.data);
        setPublishedAt(res.publishedAt);
      }
    } catch (err) {
      console.warn('⚠️ [CMS] Public fetch error, using built-in defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load admin CMS content (draft + published)
  const loadAdmin = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await fetchAdminCms();
      if (res && res.data) {
        if (res.data.published) setPublishedContent(res.data.published);
        if (res.data.draft) setDraftContent(res.data.draft);
        setPublishedAt(res.data.publishedAt);
        setUpdatedAt(res.data.updatedAt);
      }
    } catch (err) {
      console.warn('⚠️ [CMS] Admin fetch error:', err);
    }
  }, [isAdmin]);

  const refreshCms = useCallback(async () => {
    setLoading(true);
    await loadPublic();
    if (isAdmin) {
      await loadAdmin();
    }
    setLoading(false);
  }, [loadPublic, loadAdmin, isAdmin]);

  useEffect(() => {
    refreshCms();
  }, [refreshCms]);

  // Update in-memory draft
  const updateDraft = useCallback((updater: (prev: CmsContent) => CmsContent) => {
    setDraftContent(prev => {
      const base = prev || publishedContent;
      return updater(base);
    });
  }, [publishedContent]);

  // Save draft to Turso
  const saveDraft = useCallback(async () => {
    if (!draftContent) return false;
    try {
      await saveDraftCms(draftContent);
      setUpdatedAt(new Date().toISOString());
      return true;
    } catch (err) {
      console.error('Failed to save draft:', err);
      return false;
    }
  }, [draftContent]);

  // Publish draft to live
  const publishToLive = useCallback(async () => {
    const toPublish = draftContent || publishedContent;
    try {
      const res = await publishCms(toPublish);
      if (res && res.success) {
        setPublishedContent(res.data || toPublish);
        setDraftContent(res.data || toPublish);
        setPublishedAt(res.publishedAt || new Date().toISOString());
        setPreviewMode(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to publish content:', err);
      return false;
    }
  }, [draftContent, publishedContent]);

  // Discard draft and revert to published
  const discardDraft = useCallback(async () => {
    try {
      const res = await resetDraftCms();
      if (res && res.draft) {
        setDraftContent(res.draft);
      } else {
        setDraftContent(publishedContent);
      }
      setPreviewMode(false);
      return true;
    } catch (err) {
      console.error('Failed to discard draft:', err);
      return false;
    }
  }, [publishedContent]);

  // Active content: if admin is in previewMode, show draft; else show published
  const activeContent = (previewMode && draftContent) ? draftContent : publishedContent;

  const hasUnpublishedChanges = Boolean(
    draftContent && JSON.stringify(draftContent) !== JSON.stringify(publishedContent)
  );

  return (
    <CmsContext.Provider
      value={{
        content: activeContent,
        draftContent: draftContent || publishedContent,
        isAdmin,
        previewMode,
        publishedAt,
        updatedAt,
        hasUnpublishedChanges,
        loading,
        setPreviewMode,
        updateDraft,
        saveDraft,
        publishToLive,
        discardDraft,
        refreshCms
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export function useCms(): CmsContextType {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
}
