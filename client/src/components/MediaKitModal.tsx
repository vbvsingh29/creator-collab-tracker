import React, { useEffect, useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Instagram, 
  Youtube, 
  TrendingUp, 
  Users, 
  Eye, 
  ShieldCheck, 
  Mail, 
  Phone,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, Currency, Collab } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MediaKitModalProps {
  user: User | null;
  currency: Currency;
  collabs?: Collab[];
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
}

export const MediaKitModal: React.FC<MediaKitModalProps> = ({
  user,
  currency,
  collabs = [],
  isOpen,
  onClose,
  onOpenAuth,
  onOpenProfile
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Sign In to View Your Media Kit</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Your personalized Media Kit generates verified audience metrics, commercial rate cards, and 1-click shareable links for brand sponsors.
            </p>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900">
              Close
            </button>
            {onOpenAuth && (
              <button onClick={() => { onClose(); onOpenAuth(); }} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs">
                Log In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const activeUser = user;
  const isUSD = currency === 'USD';
  const sym = isUSD ? '$' : '₹';

  // Base rates directly from user profile - strictly 0 if unconfigured
  const rates = {
    reel: activeUser.rates?.reel_rate ?? 0,
    video: activeUser.rates?.video_rate ?? 0,
    story: activeUser.rates?.story_rate ?? 0,
    whitelisting_monthly: activeUser.rates?.whitelisting_monthly_rate ?? 0
  };

  // Dynamic real performance metrics from verified collabs
  const collabsWithViews = (collabs || []).filter(c => c.views_count && c.views_count > 0);
  const avgViews = collabsWithViews.length > 0
    ? Math.round(collabsWithViews.reduce((sum, c) => sum + (c.views_count || 0), 0) / collabsWithViews.length)
    : null;

  const collabsWithEngagement = (collabs || []).filter(c => c.views_count && c.views_count > 0 && c.likes_count && c.likes_count > 0);
  const avgEngagement = collabsWithEngagement.length > 0
    ? ((collabsWithEngagement.reduce((sum, c) => sum + ((c.likes_count || 0) / (c.views_count || 1)), 0) / collabsWithEngagement.length) * 100).toFixed(1)
    : null;

  const igAccount = activeUser.social_accounts?.find(a => a.platform === 'instagram');
  const ytAccount = activeUser.social_accounts?.find(a => a.platform === 'youtube');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const shareText = `🌟 ${activeUser.name} (${activeUser.handle}) — Official Creator Media Kit & Rate Card 2026\n` +
      `📊 Category: ${activeUser.category || 'Creator'}\n` +
      (avgViews ? `🔥 Avg Reel Views: ${avgViews.toLocaleString()}+ | Engagement: ${avgEngagement || 'N/A'}%\n` : '') +
      `💰 Baseline Rates: Reel (${rates.reel > 0 ? sym + rates.reel.toLocaleString() : 'On Request'}) | YouTube Video (${rates.video > 0 ? sym + rates.video.toLocaleString() : 'On Request'})\n` +
      `✉️ Direct Inquiries: ${activeUser.email}`;
    
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-indigo-500 to-amber-400 p-0.5">
              <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[10px] flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sparkles size={16} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm">Creator Media Kit & Rate Card</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">High-converting sponsorship rate one-pager for brand PR teams</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
              title="Copy rate summary to clipboard"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Print or Save as PDF"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        

        {/* Printable One-Pager Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Creator Profile Header Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80">
            <img
              src={activeUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeUser.name)}`}
              alt={activeUser.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
            />
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">{activeUser.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {activeUser.handle}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck size={12} /> Verified Partner
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                {activeUser.bio || 'Professional digital creator partnering with top brands for high-converting visual storytelling, organic reviews, and performance ads.'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Category: {activeUser.category || 'Tech & Consumer Lifestyle'}</span>
                <span className="hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1"><Mail size={12} /> {activeUser.email}</span>
                {activeUser.phone && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-1"><Phone size={12} /> {activeUser.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Audience & Reach Statistics Grid (Dynamic strictly from verified creator data) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-500/20 text-center">
              <div className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 flex items-center justify-center gap-1 mb-1">
                <Instagram size={12} /> IG Channel
              </div>
              <div className="text-sm font-black text-zinc-900 dark:text-white truncate">
                {igAccount ? igAccount.handle : (activeUser.social_links?.instagram ? 'Connected' : 'Not Linked')}
              </div>
              <div className="text-[10px] text-zinc-500">
                {igAccount ? 'Verified Account' : (activeUser.social_links?.instagram ? 'Linked in Profile' : 'Configure in Profile')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/5 to-amber-500/5 border border-red-500/20 text-center">
              <div className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-1 mb-1">
                <Youtube size={12} /> YT Channel
              </div>
              <div className="text-sm font-black text-zinc-900 dark:text-white truncate">
                {ytAccount ? ytAccount.name : (activeUser.social_links?.youtube ? 'Connected' : 'Not Linked')}
              </div>
              <div className="text-[10px] text-zinc-500">
                {ytAccount ? 'Verified Account' : (activeUser.social_links?.youtube ? 'Linked in Profile' : 'Configure in Profile')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 text-center">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mb-1">
                <Eye size={12} /> Avg Deal Views
              </div>
              <div className="text-lg font-black text-zinc-900 dark:text-white">
                {avgViews !== null ? `${avgViews.toLocaleString()}+` : 'On Request'}
              </div>
              <div className="text-[10px] text-zinc-500">
                {avgViews !== null ? `From ${collabsWithViews.length} verified deals` : 'Logged Deals Reach'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border border-indigo-500/20 text-center">
              <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1 mb-1">
                <TrendingUp size={12} /> Engagement Rate
              </div>
              <div className="text-lg font-black text-zinc-900 dark:text-white">
                {avgEngagement !== null ? `${avgEngagement}%` : 'On Request'}
              </div>
              <div className="text-[10px] text-zinc-500">
                {avgEngagement !== null ? 'Verified performance' : 'Calculated from deals'}
              </div>
            </div>
          </div>

          {/* Official Baseline Rate Card Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Official Commercial Sponsorship Rates (2026)
              </h4>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Currency: {currency} ({sym})
              </span>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {/* Instagram Reel Rate */}
              <div className="p-4 flex items-center justify-between bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Instagram size={14} className="text-pink-500" />
                    <span>Instagram Reel (60s Dedicated or Integrated)</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Includes 1 Link Sticker, Permanent Reel placement, #ad disclosure, and high-res master video.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {rates.reel > 0 ? formatCurrency(rates.reel, currency) : 'Rate on Request'}
                  </div>
                  <div className="text-[10px] text-zinc-400">{rates.reel > 0 ? 'per deliverable' : 'Custom Quote'}</div>
                </div>
              </div>

              {/* YouTube Dedicated Video */}
              <div className="p-4 flex items-center justify-between bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Youtube size={14} className="text-red-500" />
                    <span>YouTube In-Depth Dedicated Video (8-15 mins)</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Full product breakdown, pinned link, first 3 lines description, 4K production quality.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {rates.video > 0 ? formatCurrency(rates.video, currency) : 'Rate on Request'}
                  </div>
                  <div className="text-[10px] text-zinc-400">{rates.video > 0 ? 'per video' : 'Custom Quote'}</div>
                </div>
              </div>

              {/* Instagram Story Sequence */}
              <div className="p-4 flex items-center justify-between bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Instagram 3-Frame Story Sequence</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Problem-Solution-CTA sequence with custom promo code sticker and direct website link.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {rates.story > 0 ? formatCurrency(rates.story, currency) : 'Rate on Request'}
                  </div>
                  <div className="text-[10px] text-zinc-400">{rates.story > 0 ? '3 frames' : 'Custom Quote'}</div>
                </div>
              </div>

              {/* Meta Whitelisting Add-on */}
              <div className="p-4 flex items-center justify-between bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Meta Partnership Ads & Whitelisting (30 Days)</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Grant brand advertiser access to run dark posts and boost organic creator reels via Ads Manager.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {rates.whitelisting_monthly > 0 ? '+' + formatCurrency(rates.whitelisting_monthly, currency) : 'Available on Request'}
                  </div>
                  <div className="text-[10px] text-zinc-400">{rates.whitelisting_monthly > 0 ? 'per 30 days' : 'Custom Add-on'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Commercial Collaboration Terms */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
            <h5 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Award size={14} className="text-indigo-500" /> Standard Collaboration Terms
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              <li>• <strong>Payment Terms:</strong> Flexible terms agreed per sponsorship proposal (NET-15 / NET-30).</li>
              <li>• <strong>Revisions:</strong> Up to 2 rounds of standard edits on creative drafts.</li>
              <li>• <strong>Exclusivity:</strong> Category exclusivity available upon mutual brand agreement.</li>
              <li>• <strong>Usage Rights:</strong> Organic posting rights included. Paid ads require whitelisting add-on.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
