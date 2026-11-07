import { Collab, Brand, StatsSummary, User, PipelineStage, AdminTelemetryMetrics } from '../types';

export const DEMO_USER_AARAV: User = {
  id: 'user-aarav-tech-001',
  name: 'Aarav Sharma',
  email: 'aarav@tech.com',
  handle: '@aarav_tech',
  platform: 'both',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  bio: 'Top tech reviewer & digital creator sharing in-depth gadget breakdowns, smartphone camera tests, and setup builds.',
  phone: '+91 98200 12345',
  category: 'Tech & Consumer Electronics',
  rates: {
    reel_rate: 35000,
    video_rate: 75000,
    story_rate: 12000,
    whitelisting_monthly_rate: 15000
  },
  social_links: {
    instagram: 'https://instagram.com/aarav_tech',
    youtube: 'https://youtube.com/@aarav_tech',
    twitter: 'https://x.com/aarav_tech',
    website: 'https://aaravtech.com'
  },
  created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
};


export const DEMO_USER_PRIYA: User = {
  id: 'user-priya-lifestyle-002',
  name: 'Priya Mehta',
  email: 'priya@lifestyle.com',
  handle: '@priyastyle',
  platform: 'instagram',
  avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Mehta&backgroundColor=ffd5dc,ffdfba,d1d4f9',
  bio: 'Lifestyle & beauty content creator focusing on clean cosmetics, skincare routines, and daily fashion.',
  phone: '+91 98330 54321',
  category: 'Beauty & Lifestyle',
  role: 'creator',
  rates: {
    reel_rate: 45000,
    video_rate: 80000,
    story_rate: 15000,
    whitelisting_monthly_rate: 20000
  },
  social_links: {
    instagram: 'https://instagram.com/priyastyle',
    youtube: 'https://youtube.com/@priyastyle',
    twitter: 'https://x.com/priyastyle',
    website: 'https://priyamehta.com'
  },
  created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
};

export const INITIAL_DEMO_BRANDS: Brand[] = [];

export const INITIAL_DEMO_COLLABS: Collab[] = [];

const COLLABS_KEY = 'collabflow_mock_collabs';
const BRANDS_KEY = 'collabflow_mock_brands';
const USER_KEY = 'collabflow_mock_user';

export function getLocalCollabs(): Collab[] {
  const saved = localStorage.getItem(COLLABS_KEY);
  if (!saved) {
    localStorage.setItem(COLLABS_KEY, JSON.stringify([]));
    return [];
  }
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.some(c => c && typeof c.id === 'string' && c.id.startsWith('collab-demo-'))) {
      localStorage.setItem(COLLABS_KEY, JSON.stringify([]));
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function saveLocalCollabs(collabs: Collab[]) {
  localStorage.setItem(COLLABS_KEY, JSON.stringify(collabs));
}

export function getLocalBrands(): Brand[] {
  const saved = localStorage.getItem(BRANDS_KEY);
  if (!saved) {
    localStorage.setItem(BRANDS_KEY, JSON.stringify([]));
    return [];
  }
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.some(b => b && typeof b.id === 'string' && b.id.startsWith('brand-'))) {
      localStorage.setItem(BRANDS_KEY, JSON.stringify([]));
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function getLocalUser(): User {
  const saved = localStorage.getItem(USER_KEY);
  if (!saved) {
    localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER_AARAV));
    return DEMO_USER_AARAV;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return DEMO_USER_AARAV;
  }
}

export function saveLocalUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function computeLocalStats(collabs: Collab[]): StatsSummary {
  let totalRevenueInr = 0;
  let totalRevenueUsd = 0;
  let totalPaidInr = 0;
  let totalPaidUsd = 0;
  let totalPendingInr = 0;
  let totalPendingUsd = 0;
  let overdueCount = 0;
  let overdueAmountInr = 0;
  let overdueAmountUsd = 0;
  let barterTotalInr = 0;
  let barterTotalUsd = 0;
  let whitelistingActiveCount = 0;

  const dealsByPlatform = { instagram: 0, youtube: 0, both: 0 };
  const dealsByFormat: Record<string, number> = {};
  const dealsByStage: Record<PipelineStage, number> = {
    pitch_inquiry: 0,
    negotiating: 0,
    script_approved: 0,
    content_production: 0,
    brand_review: 0,
    scheduled: 0,
    posted_live: 0,
    completed: 0
  };
  const dealsByCommercial = { paid: 0, barter: 0, affiliate: 0, hybrid: 0 };

  const now = new Date();

  const USD_RATE = 86.0;

  collabs.forEach(c => {
    const isUsd = c.currency === 'USD';
    const amount = c.deal_amount || 0;
    const paid = c.amount_paid || (c.payment_status === 'paid' ? amount : 0);
    const pending = Math.max(0, amount - paid);
    const barter = c.barter_estimated_value || 0;

    // Real-time bidirectional conversion so switching currency displays full converted workspace total
    const amountInr = isUsd ? Math.round(amount * USD_RATE) : amount;
    const amountUsd = isUsd ? amount : Math.round(amount / USD_RATE);
    const paidInr = isUsd ? Math.round(paid * USD_RATE) : paid;
    const paidUsd = isUsd ? paid : Math.round(paid / USD_RATE);
    const pendingInr = isUsd ? Math.round(pending * USD_RATE) : pending;
    const pendingUsd = isUsd ? pending : Math.round(pending / USD_RATE);
    const barterInr = isUsd ? Math.round(barter * USD_RATE) : barter;
    const barterUsd = isUsd ? barter : Math.round(barter / USD_RATE);

    totalRevenueInr += amountInr;
    totalRevenueUsd += amountUsd;
    totalPaidInr += paidInr;
    totalPaidUsd += paidUsd;
    totalPendingInr += pendingInr;
    totalPendingUsd += pendingUsd;
    barterTotalInr += barterInr;
    barterTotalUsd += barterUsd;

    if (c.payment_status !== 'paid' && c.payment_due_date && new Date(c.payment_due_date) < now) {
      overdueCount++;
      overdueAmountInr += pendingInr;
      overdueAmountUsd += pendingUsd;
    }

    if (c.has_ads_whitelisting) {
      whitelistingActiveCount++;
    }

    // Platforms
    if (c.platform === 'instagram') dealsByPlatform.instagram++;
    else if (c.platform === 'youtube') dealsByPlatform.youtube++;
    else if (c.platform === 'both') dealsByPlatform.both++;

    // Format
    if (c.deliverable_format) {
      dealsByFormat[c.deliverable_format] = (dealsByFormat[c.deliverable_format] || 0) + 1;
    }

    // Stage
    if (c.pipeline_stage && dealsByStage[c.pipeline_stage] !== undefined) {
      dealsByStage[c.pipeline_stage]++;
    }

    // Commercial
    if (c.commercial_type && dealsByCommercial[c.commercial_type] !== undefined) {
      dealsByCommercial[c.commercial_type]++;
    }
  });

  return {
    total_deals: collabs.length,
    total_revenue_inr: totalRevenueInr,
    total_revenue_usd: totalRevenueUsd,
    total_paid_inr: totalPaidInr,
    total_paid_usd: totalPaidUsd,
    total_pending_inr: totalPendingInr,
    total_pending_usd: totalPendingUsd,
    overdue_count: overdueCount,
    overdue_amount_inr: overdueAmountInr,
    overdue_amount_usd: overdueAmountUsd,
    barter_total_value_inr: barterTotalInr,
    barter_total_value_usd: barterTotalUsd,
    whitelisting_active_count: whitelistingActiveCount,
    deals_by_platform: dealsByPlatform,
    deals_by_format: dealsByFormat,
    deals_by_stage: dealsByStage,
    deals_by_commercial: dealsByCommercial
  };
}

export function parseMediaUrlOffline(url: string) {
  const cleanUrl = (url || '').trim();
  const ytMatch = cleanUrl.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      platform: 'youtube',
      content_type: cleanUrl.includes('shorts') ? 'short' : 'video',
      video_id: videoId,
      embed_url: `https://www.youtube.com/embed/${videoId}`,
      direct_url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      title: 'YouTube Creator Video (Verified Live Embed)',
      author_name: 'Aarav Tech Studio',
      views_count: 84500,
      likes_count: 5300
    };
  }

  const igMatch = cleanUrl.match(/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) {
    const shortcode = igMatch[1];
    return {
      platform: 'instagram',
      content_type: cleanUrl.includes('reel') ? 'reel' : 'post',
      shortcode,
      embed_url: `https://www.instagram.com/p/${shortcode}/embed`,
      direct_url: `https://www.instagram.com/p/${shortcode}/`,
      title: 'Instagram Creator Reel / Post (Interactive Frame)',
      author_name: '@aarav_tech',
      views_count: 52100,
      likes_count: 3400
    };
  }

  return {
    platform: 'web',
    content_type: 'link',
    direct_url: cleanUrl || 'https://creator-collab-tracker-six.vercel.app',
    embed_url: cleanUrl || 'https://creator-collab-tracker-six.vercel.app',
    title: 'Custom Sponsor Campaign Landing Page',
    author_name: 'Verified Creator Link',
    views_count: 24000,
    likes_count: 1200
  };
}

export function generateClientAIPitch(payload: any) {
  const currency = payload.currency || 'INR';
  const sym = currency === 'USD' ? '$' : '₹';
  const targetBrand = payload.targetBrand || 'Brand Partner';
  const creatorName = payload.creatorName || 'Aarav Sharma';
  const creatorHandle = payload.creatorHandle || '@aarav_tech';
  const category = payload.creatorCategory || 'Tech & Consumer Electronics';
  const proposedRate = Number(payload.proposedRate) || (currency === 'USD' ? 600 : 45000);
  const strategy = payload.strategy || 'reel_summary_pitch';

  const rawReels = payload.reels && payload.reels.length > 0 ? payload.reels : [
    {
      id: 'demo-reel-1',
      title: 'Keychron K2 Pro Mechanical Keyboard Cinematic Showcase',
      brand_name: 'Keychron India',
      platform: 'instagram',
      deliverable_format: 'ig_dedicated_reel',
      views_count: 84200,
      likes_count: 4900,
      deal_amount: currency === 'USD' ? 650 : 50000,
      currency
    },
    {
      id: 'demo-reel-2',
      title: 'Nothing Ear (open) TWS Earbuds Dedicated Review',
      brand_name: 'Nothing Tech',
      platform: 'youtube',
      deliverable_format: 'yt_dedicated_video',
      views_count: 142000,
      likes_count: 7800,
      deal_amount: currency === 'USD' ? 1400 : 95000,
      currency
    },
    {
      id: 'demo-reel-3',
      title: 'NordVPN Cybersecurity Travel Protocol & Story Sequence',
      brand_name: 'NordVPN',
      platform: 'instagram',
      deliverable_format: 'ig_story',
      views_count: 45000,
      likes_count: 2100,
      deal_amount: currency === 'USD' ? 350 : 25000,
      currency
    }
  ];

  let totalViews = 0;
  let totalLikes = 0;
  let totalCpmSum = 0;
  let topReel: any = null;
  let topViews = 0;

  const reelSummaries = rawReels.map((r: any, idx: number) => {
    const views = r.views_count && r.views_count > 0 ? r.views_count : 45000;
    const likes = r.likes_count && r.likes_count > 0 ? r.likes_count : Math.round(views * 0.045);
    const engRate = parseFloat(((likes / views) * 100).toFixed(1));
    const cpm = Math.round(((r.deal_amount || proposedRate) / views) * 1000);

    totalViews += views;
    totalLikes += likes;
    totalCpmSum += cpm;

    if (views > topViews) {
      topViews = views;
      topReel = r;
    }

    let grade: 'A+' | 'A' | 'B' | 'C' = 'B';
    if (engRate >= 5.0) grade = 'A+';
    else if (engRate >= 4.0) grade = 'A';
    else if (engRate >= 2.5) grade = 'B';
    else grade = 'C';

    const insights = [
      `High engagement (${engRate}%): outperforming category benchmark by 28%.`,
      `Optimal viewer retention; driven by strong problem-solution hook in opening 3 seconds.`,
      `Efficient sponsor ROI: delivered ${sym}${cpm} CPM with verified link sticker clicks.`,
      `Audience demonstrated high buyer-intent with organic comment inquiries.`
    ];

    return {
      id: r.id || `reel-${idx}`,
      title: r.title,
      brand: r.brand_name || 'Brand Partner',
      platform: r.platform || 'instagram',
      views,
      likes,
      engagementRate: engRate,
      deliveredCpm: cpm,
      grade,
      insight: insights[idx % insights.length]
    };
  });

  const count = reelSummaries.length || 1;
  const avgViews = Math.round(totalViews / count);
  const avgEngagementRate = parseFloat(((totalLikes / (totalViews || 1)) * 100).toFixed(1));
  const avgDeliveredCpm = Math.round(totalCpmSum / count);

  const topPerformingReel = topReel ? {
    title: topReel.title,
    brand: topReel.brand_name || 'Top Sponsor',
    views: topReel.views_count || topViews,
    engagementRate: parseFloat(((((topReel.likes_count || 1) / ((topReel.views_count || 1))) * 100).toFixed(1)))
  } : null;

  const executiveSummary = `Across ${count} verified sponsored deliverables, your content generated ${totalViews.toLocaleString()} total views with an average engagement rate of ${avgEngagementRate}%. On average, your reels deliver a CPM of ${sym}${avgDeliveredCpm}, proving 35% higher commercial conversion efficiency than typical ${category} benchmarks.`;

  const standaloneValue = Math.round(proposedRate * 1.55);
  const bundledOfferPrice = Math.round(proposedRate * 1.25);
  const savingsPercent = Math.round(((standaloneValue - bundledOfferPrice) / standaloneValue) * 100);

  const subjectLine = strategy === 'reel_summary_pitch'
    ? `Partnership Proposal: ${targetBrand} x ${creatorHandle} (${totalViews.toLocaleString()} Verified Views)`
    : strategy === 'counter_offer'
    ? `Re: Partnership Terms & Value Addition — ${creatorHandle} x ${targetBrand}`
    : strategy === 'upsell_bundle'
    ? `Expanded Campaign Proposal: 3-Part High-Conversion Bundle for ${targetBrand}`
    : `Collaboration Inquiry: ${creatorName} (${creatorHandle}) x ${targetBrand}`;

  const pitchText = `Hi ${targetBrand} Partnerships Team,

I hope you are doing well! My name is ${creatorName} (${creatorHandle}), creating high-impact content in the ${category} space with over ${totalViews.toLocaleString()} verified campaign views.

I have been following ${targetBrand}'s recent developments and see a natural, authentic fit for my audience. In our previous campaigns, our sponsored reels delivered an average engagement rate of ${avgEngagementRate}% and an ultra-efficient CPM of ${sym}${avgDeliveredCpm}.

Here is a quick snapshot of our recent verified deliverables:
• Total Reach: ${totalViews.toLocaleString()} Impressions
• Average Engagement: ${avgEngagementRate}% (28% above industry benchmark)
• Top Deliverable: "${topPerformingReel ? topPerformingReel.title : 'Cinematic Product Showcase'}" (${topPerformingReel ? topPerformingReel.views.toLocaleString() : '84,000'} views)

Recommended Launch Package for ${targetBrand}:
1. 1x Dedicated 60-second 4K Showcase Reel with audio tag & pinned link sticker
2. 2x Instagram Story sequences with direct UTM conversion tracking
3. 30-Day Meta Ads Whitelisting permission for dark posting / targeted audience scaling

Package Valuation: ${sym}${standaloneValue.toLocaleString()} | Special Partnership Bundle: ${sym}${bundledOfferPrice.toLocaleString()} (${savingsPercent}% bundle savings)

Would you be open to a quick 10-minute chat this week to review the concept outline and timeline?

Best regards,
${creatorName}
${creatorHandle}
Media Kit & Analytics: https://creator-collab-tracker-six.vercel.app`;

  return {
    providerUsed: 'CollabFlow Creator Intelligence (Zero-Key Algorithmic)',
    modelUsed: 'Algorithmic Creator Engine v2.4 (Instant Offline Safe)',
    reelAnalysis: {
      totalReelsAnalyzed: count,
      totalViews,
      avgViews,
      avgEngagementRate,
      avgDeliveredCpm,
      topPerformingReel,
      reelSummaries,
      executiveSummary
    },
    pitchProposal: {
      subjectLine,
      pitchText,
      recommendedBundle: {
        name: `${targetBrand} High-Conversion Triple Bundle`,
        deliverables: [
          '1x Dedicated 4K 60s Reel with audio attribution & pinned link sticker',
          '2x 24h Instagram Story Frames with direct brand UTM swipe/link',
          '30-Day Meta Ads Whitelisting access for high-ROAS paid distribution'
        ],
        standaloneValue,
        bundledOfferPrice,
        savingsPercent
      },
      keyDataBullets: [
        `${totalViews.toLocaleString()} total verified views delivered across historical deliverables`,
        `${avgEngagementRate}% average engagement rate (outperforming category benchmarks by ~28%)`,
        `Low delivered CPM of ${sym}${avgDeliveredCpm} maximizing commercial return on ad spend`,
        'Includes 30 days of exclusive category hold against direct competitors'
      ],
      counterOfferTactics: [
        'Protect Base Margin: Offer additional story frame or pinned comment rather than discounting cash rate',
        'Leverage Whitelisting: Offer 30 days ad rights in exchange for 50% upfront payment milestone',
        'Urgency Window: Mention exclusivity lock calendar closes by the end of next week'
      ]
    }
  };
}


export function getAdminTelemetryOffline(): AdminTelemetryMetrics {
  const localCollabs = getLocalCollabs();
  const localCount = localCollabs.length;

  return {
    total_onboarded_users: 1424,
    onboarded_growth_rate: 19.4,
    active_users: {
      realtime_active: 48,
      daily_active_users: 398,
      weekly_active_users: 1025,
      monthly_active_users: 1338,
      dau_to_mau_stickiness: 29.7
    },
    click_through_rates: {
      overall_campaign_ctr: 5.8,
      tracking_link_ctr: 6.4,
      media_kit_views_ctr: 12.1,
      pitch_generator_conversion_ctr: 34.8,
      rate_card_quote_acceptance_ctr: 41.5
    },
    platform_distribution: {
      youtube_percentage: 44.5,
      instagram_percentage: 41.2,
      cross_platform_percentage: 14.3
    },
    deliverables_velocity: {
      total_campaigns_tracked: 3840 + localCount,
      completed_deliverables: 3120,
      live_in_transit: 480,
      completion_rate: 88.6
    },
    system_health: {
      uptime_percentage: 99.98,
      avg_api_latency_ms: 38,
      youtube_sync_health: 'healthy',
      instagram_sync_health: 'healthy',
      ai_pitch_pipeline_health: 'healthy',
      gdpr_audit_status: '100% Compliant — End-to-End Zero Financial Telemetry'
    },
    cohorts: [
      {
        cohort_id: 'CREATOR-TECH-084',
        category: 'Tech & Consumer Electronics',
        primary_platform: 'youtube',
        onboarded_at: '2026-09-12',
        last_active: '2 mins ago',
        active_deliverables: 3,
        total_impressions: 142000,
        total_link_clicks: 8940,
        click_through_rate: 6.3,
        pwa_installed: true,
        privacy_status: 'GDPR_PROTECTED'
      },
      {
        cohort_id: 'CREATOR-LIFESTYLE-112',
        category: 'Fashion & Lifestyle',
        primary_platform: 'instagram',
        onboarded_at: '2026-09-28',
        last_active: '14 mins ago',
        active_deliverables: 2,
        total_impressions: 67000,
        total_link_clicks: 4820,
        click_through_rate: 7.2,
        pwa_installed: true,
        privacy_status: 'GDPR_PROTECTED'
      },
      {
        cohort_id: 'CREATOR-AUDIO-205',
        category: 'Audio & Peripherals',
        primary_platform: 'both',
        onboarded_at: '2026-10-04',
        last_active: '48 mins ago',
        active_deliverables: 4,
        total_impressions: 89000,
        total_link_clicks: 5120,
        click_through_rate: 5.8,
        pwa_installed: false,
        privacy_status: 'GDPR_PROTECTED'
      },
      {
        cohort_id: 'CREATOR-FINANCE-319',
        category: 'Finance & FinTech',
        primary_platform: 'youtube',
        onboarded_at: '2026-10-18',
        last_active: '2 hours ago',
        active_deliverables: 1,
        total_impressions: 112000,
        total_link_clicks: 9800,
        click_through_rate: 8.7,
        pwa_installed: true,
        privacy_status: 'GDPR_PROTECTED'
      },
      {
        cohort_id: 'CREATOR-FITNESS-441',
        category: 'Fitness & Health',
        primary_platform: 'instagram',
        onboarded_at: '2026-10-25',
        last_active: '5 hours ago',
        active_deliverables: 2,
        total_impressions: 54000,
        total_link_clicks: 3400,
        click_through_rate: 6.3,
        pwa_installed: true,
        privacy_status: 'GDPR_PROTECTED'
      },
      {
        cohort_id: 'CREATOR-SAAS-518',
        category: 'Productivity & SaaS',
        primary_platform: 'both',
        onboarded_at: '2026-11-02',
        last_active: 'Just now',
        active_deliverables: 3,
        total_impressions: 78000,
        total_link_clicks: 5600,
        click_through_rate: 7.1,
        pwa_installed: true,
        privacy_status: 'GDPR_PROTECTED'
      }
    ]
  };
}


// Dynamic Admin Challenge & Awareness Audit Log (No Static Passwords)
let mockActiveChallenge: { code: string; expiresAt: number } | null = null;
const mockAuditLogs = [
  {
    id: 'audit-demo-001',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    operator: 'aarav@tech.com (Workspace Owner)',
    action: 'ADMIN_OBSERVATORY_UNLOCKED',
    ip: '127.0.0.1 (Local Session)'
  }
];

export function generateMockAdminChallenge() {
  const dynamicCode = Math.floor(100000 + Math.random() * 900000).toString();
  mockActiveChallenge = {
    code: dynamicCode,
    expiresAt: Date.now() + 60000
  };
  return {
    success: true,
    challenge_id: `ch_${Date.now()}`,
    dynamic_code: dynamicCode,
    expires_in_seconds: 60,
    notice: 'Dynamic 60-second time-decaying security passkey generated. Zero static passwords.',
    timestamp: new Date().toISOString()
  };
}

export function verifyMockAdminChallenge(code: string, operator?: string) {
  if (!mockActiveChallenge || Date.now() > mockActiveChallenge.expiresAt) {
    // Generate fresh challenge if expired
    const fresh = generateMockAdminChallenge();
    if (code === fresh.dynamic_code) {
      return recordMockAuditSuccess(operator);
    }
    throw new Error('Dynamic passkey expired. Please generate a fresh time-synced code.');
  }

  if (code.trim() !== mockActiveChallenge.code) {
    throw new Error('Invalid dynamic challenge passkey.');
  }

  return recordMockAuditSuccess(operator);
}

function recordMockAuditSuccess(operator?: string) {
  const entry = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    operator: operator || 'aarav@tech.com',
    action: 'ADMIN_OBSERVATORY_UNLOCKED',
    ip: 'Verified Client Browser Session'
  };
  mockAuditLogs.unshift(entry);
  sessionStorage.setItem('collabflow_admin_session', `active_${Date.now()}`);
  return {
    success: true,
    session_token: `admin_session_${Date.now()}`,
    expires_in_minutes: 15,
    audit_logged: true,
    log_entry: entry
  };
}

export function getMockAdminAuditLogs() {
  return mockAuditLogs;
}
