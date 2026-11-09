export type Platform = 'instagram' | 'youtube' | 'both';

export interface User {
  id: string;
  name: string;
  email: string;
  handle: string;
  platform: Platform;
  role?: 'creator' | 'admin' | 'owner';
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
  email_verified?: boolean;
  phone_verified?: boolean;
  social_accounts?: SocialAccount[];
  team_members?: TeamMember[];
  created_at?: string;
}

export interface SocialAccount {
  id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'x' | 'podcast';
  name: string;
  handle: string;
  url?: string;
  subscribers_or_followers?: string;
  niche?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Invited';
  can_view_finances: boolean;
  can_edit_deals: boolean;
  allowed_account_ids?: string[];
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
  | 'completed'
  | 'closed';

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
  agency_cut_percentage?: number;
  tds_percentage?: number;
  deliverables_checklist: DeliverableItem[];
  notes?: string;
  account_id?: string;
  account_label?: string;
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
  account_id?: string;
  account_label?: string;
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


export interface AnonymizedCreatorCohort {
  cohort_id: string;
  category: string;
  primary_platform: 'youtube' | 'instagram' | 'both';
  onboarded_at: string;
  last_active: string;
  active_deliverables: number;
  total_impressions: number;
  total_link_clicks: number;
  click_through_rate: number;
  pwa_installed: boolean;
  privacy_status: 'GDPR_PROTECTED';
}

export interface AdminTelemetryMetrics {
  total_onboarded_users: number;
  onboarded_growth_rate: number;
  active_users: {
    realtime_active: number;
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    dau_to_mau_stickiness: number;
  };
  click_through_rates: {
    overall_campaign_ctr: number;
    tracking_link_ctr: number;
    media_kit_views_ctr: number;
    pitch_generator_conversion_ctr: number;
    rate_card_quote_acceptance_ctr: number;
  };
  platform_distribution: {
    youtube_percentage: number;
    instagram_percentage: number;
    cross_platform_percentage: number;
  };
  deliverables_velocity: {
    total_campaigns_tracked: number;
    completed_deliverables: number;
    live_in_transit: number;
    completion_rate: number;
  };
  system_health: {
    uptime_percentage: number;
    avg_api_latency_ms: number;
    youtube_sync_health: 'healthy' | 'degraded';
    instagram_sync_health: 'healthy' | 'degraded';
    ai_pitch_pipeline_health: 'healthy' | 'degraded';
    gdpr_audit_status: string;
  };
  cohorts: AnonymizedCreatorCohort[];
}


export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'creator' | 'admin' | 'owner';
  handle: string;
  platform: Platform;
  avatar_url?: string;
  bio?: string;
  category?: string;
  email_verified: boolean;
  phone_verified: boolean;
  social_accounts?: Array<{
    id: string;
    platform: 'youtube' | 'instagram';
    account_name: string;
    handle_or_url: string;
    is_primary?: boolean;
  }>;
  collabs_count: number;
  created_at: string;
}

export interface CommunicationLog {
  id: string;
  user_id?: string;
  recipient: string;
  channel: 'sms' | 'email';
  purpose: 'phone_verification' | 'email_verification' | 'password_reset';
  status: 'delivered' | 'sent' | 'failed' | 'simulated';
  provider: 'twilio' | 'fast2sms' | 'resend' | 'smtp' | 'console';
  details?: string;
  created_at: string;
}

export interface CommunicationLogsResponse {
  success: boolean;
  summary: {
    total_sms: number;
    total_email: number;
    total_delivered: number;
    total_simulated: number;
    total_failed: number;
    total_dispatches: number;
  };
  logs: CommunicationLog[];
}
