import { DeliverableFormat, PaymentStatus, PipelineStage } from '../types';

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDeliverableLabel(format: DeliverableFormat): { label: string; depth: string; badgeColor: string } {
  switch (format) {
    case 'ig_mention':
      return { label: 'Soft Name Mention / Tag', depth: 'Low', badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    case 'ig_story':
      return { label: 'Story Set + Link Sticker', depth: 'Medium', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'ig_integrated_reel':
      return { label: '30s Integrated Reel', depth: 'High', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
    case 'ig_dedicated_reel':
      return { label: '100% Dedicated Reel', depth: 'Premium', badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20' };
    case 'ig_carousel_post':
      return { label: 'Carousel Feed Post', depth: 'Medium', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    case 'ig_collab_post':
      return { label: 'Joint Collab Post', depth: 'High', badgeColor: 'bg-pink-600/10 text-pink-300 border-pink-500/30' };

    case 'yt_mention':
      return { label: 'Spoken Name Drop / Credit', depth: 'Low', badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    case 'yt_short':
      return { label: 'YouTube Short', depth: 'Medium', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20' };
    case 'yt_integrated_midroll':
      return { label: '60s Mid-Roll Sponsor', depth: 'High', badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
    case 'yt_integrated_preroll':
      return { label: '30s Pre-Roll Sponsor', depth: 'Medium', badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
    case 'yt_dedicated_video':
      return { label: '100% Dedicated Video', depth: 'Premium', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    case 'yt_community_post':
      return { label: 'Community Tab Post', depth: 'Low', badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700' };

    case 'multi_bundle':
      return { label: 'Cross-Platform Bundle', depth: 'VIP', badgeColor: 'bg-gradient-to-r from-pink-500/20 to-red-500/20 text-white border-pink-500/30' };
    default:
      return { label: format, depth: 'Standard', badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
  }
}

export function getPaymentBadge(status: PaymentStatus): { label: string; color: string; isOverdue: boolean } {
  switch (status) {
    case 'paid':
      return { label: 'Paid in Full', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', isOverdue: false };
    case 'partially_paid':
      return { label: 'Partially Paid (Advance)', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', isOverdue: false };
    case 'invoiced':
      return { label: 'Invoiced / Awaiting Due', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', isOverdue: false };
    case 'overdue':
      return { label: '⚠️ Payment Overdue', color: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-semibold', isOverdue: true };
    case 'barter_delivered':
      return { label: 'Barter / Gift Received', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', isOverdue: false };
    case 'unbilled':
    default:
      return { label: 'Unbilled / In Progress', color: 'bg-zinc-800 text-zinc-400 border-zinc-700', isOverdue: false };
  }
}

export function getStageConfig(stage: PipelineStage): { label: string; step: number; color: string } {
  switch (stage) {
    case 'pitch_inquiry':
      return { label: 'Inquiry / Pitch', step: 1, color: 'text-zinc-400' };
    case 'negotiating':
      return { label: 'Terms Negotiation', step: 2, color: 'text-amber-400' };
    case 'script_approved':
      return { label: 'Script Approved', step: 3, color: 'text-blue-400' };
    case 'content_production':
      return { label: 'In Production', step: 4, color: 'text-indigo-400' };
    case 'brand_review':
      return { label: 'Brand Review', step: 5, color: 'text-purple-400' };
    case 'scheduled':
      return { label: 'Scheduled', step: 6, color: 'text-sky-400' };
    case 'posted_live':
      return { label: 'Posted Live', step: 7, color: 'text-emerald-400' };
    case 'completed':
      return { label: 'Completed & Paid', step: 8, color: 'text-teal-400' };
  }
}
