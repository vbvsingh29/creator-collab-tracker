import { Currency, DeliverableFormat, PaymentStatus, PipelineStage } from '../types';

export const USD_TO_INR_RATE = 86.0;

/**
 * Real-time currency conversion between INR and USD
 */
export function convertAmount(
  amount: number, 
  from: Currency = 'INR', 
  to: Currency = 'INR', 
  rate: number = USD_TO_INR_RATE
): number {
  if (!amount || isNaN(amount)) return 0;
  if (from === to) return amount;
  if (from === 'USD' && to === 'INR') return Math.round(amount * rate);
  if (from === 'INR' && to === 'USD') return Math.round(amount / rate);
  return amount;
}

export function formatCurrency(
  amount: number, 
  currency: string = 'INR',
  sourceCurrency?: Currency,
  rate: number = USD_TO_INR_RATE
): string {
  const target = (currency as Currency) || 'INR';
  const finalAmount = sourceCurrency ? convertAmount(amount, sourceCurrency, target, rate) : amount;

  if (target === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(finalAmount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(finalAmount);
}

/**
 * Returns the converted formatted amount along with an optional subtitle
 * indicating the original contracted currency amount if different from viewCurrency.
 */
export function formatDealAmountWithConversion(
  dealAmount: number,
  dealCurrency: Currency = 'INR',
  viewCurrency: Currency = 'INR',
  rate: number = USD_TO_INR_RATE
): { main: string; subtitle?: string } {
  if (!dealAmount) {
    return { main: formatCurrency(0, viewCurrency) };
  }
  
  if (dealCurrency === viewCurrency) {
    return { main: formatCurrency(dealAmount, viewCurrency) };
  }

  const converted = convertAmount(dealAmount, dealCurrency, viewCurrency, rate);
  const main = formatCurrency(converted, viewCurrency);
  const original = formatCurrency(dealAmount, dealCurrency);

  return {
    main,
    subtitle: `orig. ${original}`
  };
}

export function getDeliverableLabel(format: DeliverableFormat): { label: string; depth: string; badgeColor: string } {
  switch (format) {
    case 'ig_mention':
      return { label: 'Soft Name Mention / Tag', depth: 'Low', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'ig_story':
      return { label: 'Story Set + Link Sticker', depth: 'Medium', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'ig_integrated_reel':
      return { label: '30s Integrated Reel', depth: 'High', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'ig_dedicated_reel':
      return { label: '100% Dedicated Reel', depth: 'Premium', badgeColor: 'bg-pink-50 text-pink-700 border-pink-200' };
    case 'ig_carousel_post':
      return { label: 'Carousel Feed Post', depth: 'Medium', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'ig_collab_post':
      return { label: 'Joint Collab Post', depth: 'High', badgeColor: 'bg-pink-100 text-pink-800 border-pink-300' };

    case 'yt_mention':
      return { label: 'Spoken Name Drop / Credit', depth: 'Low', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'yt_short':
      return { label: 'YouTube Short', depth: 'Medium', badgeColor: 'bg-red-50 text-red-700 border-red-200' };
    case 'yt_integrated_midroll':
      return { label: '60s Mid-Roll Sponsor', depth: 'High', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'yt_integrated_preroll':
      return { label: '30s Pre-Roll Sponsor', depth: 'Medium', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'yt_dedicated_video':
      return { label: '100% Dedicated Video', depth: 'Premium', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'yt_community_post':
      return { label: 'Community Tab Post', depth: 'Low', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' };

    case 'multi_bundle':
      return { label: 'Cross-Platform Bundle', depth: 'VIP', badgeColor: 'bg-slate-900 text-white border-slate-800' };
    default:
      return { label: format, depth: 'Standard', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export function getPaymentBadge(status: PaymentStatus): { label: string; color: string; isOverdue: boolean } {
  switch (status) {
    case 'paid':
      return { label: 'Paid in Full', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', isOverdue: false };
    case 'partially_paid':
      return { label: 'Partially Paid (Advance)', color: 'bg-sky-50 text-sky-700 border-sky-200', isOverdue: false };
    case 'invoiced':
      return { label: 'Invoiced / Awaiting Due', color: 'bg-amber-50 text-amber-700 border-amber-200', isOverdue: false };
    case 'overdue':
      return { label: 'Payment Overdue', color: 'bg-red-50 text-red-700 border-red-200 font-semibold', isOverdue: true };
    case 'barter_delivered':
      return { label: 'Barter Received', color: 'bg-violet-50 text-violet-700 border-violet-200', isOverdue: false };
    case 'unbilled':
    default:
      return { label: 'Unbilled / In Progress', color: 'bg-slate-100 text-slate-600 border-slate-200', isOverdue: false };
  }
}

export function getStageConfig(stage: PipelineStage): { label: string; step: number; color: string } {
  switch (stage) {
    case 'pitch_inquiry':
      return { label: 'Inquiry / Pitch', step: 1, color: 'text-slate-500' };
    case 'negotiating':
      return { label: 'Terms Negotiation', step: 2, color: 'text-amber-600' };
    case 'script_approved':
      return { label: 'Script Approved', step: 3, color: 'text-blue-600' };
    case 'content_production':
      return { label: 'In Production', step: 4, color: 'text-indigo-600' };
    case 'brand_review':
      return { label: 'Brand Review', step: 5, color: 'text-purple-600' };
    case 'scheduled':
      return { label: 'Scheduled', step: 6, color: 'text-sky-600' };
    case 'posted_live':
      return { label: 'Posted Live', step: 7, color: 'text-emerald-600' };
    case 'completed':
      return { label: 'Completed & Paid', step: 8, color: 'text-teal-600' };
    case 'closed':
      return { label: 'Closed / Archived', step: 9, color: 'text-zinc-400' };
  }
}
