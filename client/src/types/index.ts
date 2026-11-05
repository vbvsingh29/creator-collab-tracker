export type Platform = 'instagram' | 'youtube' | 'both';

export interface User {
  id: string;
  name: string;
  email: string;
  handle: string;
  platform: Platform;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  category?: string;
  rates?: {
    reel_rate?: number;
    video_rate?: number;
    story_rate?: number;
    whitelisting_monthly_rate?: number;
  };
  social_links?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
  };
  created_at?: string;
}

export type DeliverableFormat =
  // Instagram formats
  | 'ig_mention'             // Soft shoutout / Name drop in reel or caption
  | 'ig_story'               // Story sequence with link sticker & promo code
  | 'ig_integrated_reel'     // 30s branded integration in organic Reel
  | 'ig_dedicated_reel'      // 100% brand focus dedicated Reel
  | 'ig_carousel_post'       // Multi-slide carousel review / photoshoot
  | 'ig_collab_post'         // Co-authored Instagram collaboration post
  // YouTube formats
  | 'yt_mention'             // Quick verbal credit / pinned comment & link in description
  | 'yt_short'               // YouTube Short (integrated or dedicated)
  | 'yt_integrated_midroll'  // 30-60s mid-roll sponsor segment
  | 'yt_integrated_preroll'  // 15-30s pre-roll sponsor segment
  | 'yt_dedicated_video'     // Full dedicated 8-15 min product video/review
  | 'yt_community_post'      // Community tab graphic + sponsor link
  // Multi platform
  | 'multi_bundle';          // Cross-platform package

export type CommercialType = 'paid' | 'barter' | 'affiliate' | 'hybrid';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type PaymentTerms =
  | '100_upfront'
  | '50_advance_50_post'
  | 'net_15'
  | 'net_30'
  | 'net_45'
  | 'net_60'
  | 'milestone'
  | 'barter_only';

export type PaymentStatus =
  | 'unbilled'
  | 'invoiced'
  | 'overdue'
  | 'partially_paid'
  | 'paid'
  | 'barter_delivered';

export type PipelineStage =
  | 'pitch_inquiry'
  | 'negotiating'
  | 'script_approved'
  | 'content_production'
  | 'brand_review'
  | 'scheduled'
  | 'posted_live'
  | 'completed';

export interface DeliverableItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface Collab {
  id: string;
  user_id?: string;
  title: string;
  brand_id?: string;
  brand_name: string;
  brand_category: string;
  contact_person: string;
  contact_email: string;
  platform: Platform;
  deliverable_format: DeliverableFormat;
  format_label?: string;
  commercial_type: CommercialType;
  currency: Currency;
  deal_amount: number;
  barter_estimated_value: number;
  payment_terms: PaymentTerms;
  payment_status: PaymentStatus;
  amount_paid: number;
  invoice_number?: string;
  invoice_date?: string;
  payment_due_date?: string;
  payment_received_date?: string;
  has_ads_whitelisting: boolean;
  whitelisting_duration_days?: number;
  whitelisting_expiry_date?: string;
  has_category_exclusivity: boolean;
  exclusivity_days?: number;
  promo_code?: string;
  tracking_link?: string;
  pipeline_stage: PipelineStage;
  scheduled_post_date?: string;
  actual_posted_date?: string;
  live_post_url?: string;
  views_count?: number;
  likes_count?: number;
  deliverables_checklist: DeliverableItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  contact_person: string;
  contact_email: string;
  contact_phone?: string;
  avg_payment_speed_days?: number;
  rating: number;
  notes?: string;
  collabs_count?: number;
  total_spent?: number;
  created_at: string;
}

export interface StatsSummary {
  total_deals: number;
  total_revenue_inr: number;
  total_revenue_usd: number;
  total_paid_inr: number;
  total_paid_usd: number;
  total_pending_inr: number;
  total_pending_usd: number;
  overdue_count: number;
  overdue_amount_inr: number;
  overdue_amount_usd: number;
  barter_total_value_inr: number;
  barter_total_value_usd: number;
  whitelisting_active_count: number;
  deals_by_platform: {
    instagram: number;
    youtube: number;
    both: number;
  };
  deals_by_format: Record<string, number>;
  deals_by_stage: Record<PipelineStage, number>;
  deals_by_commercial: {
    paid: number;
    barter: number;
    affiliate: number;
    hybrid: number;
  };
}
