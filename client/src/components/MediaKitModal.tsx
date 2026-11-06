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
import { User, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MediaKitModalProps {
  user: User | null;
  currency: Currency;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

const DEMO_MEDIA_USER: User = {
  id: 'demo-aarav',
  name: 'Aarav Sharma',
  email: 'aarav@tech.com',
  handle: '@aarav_tech',
  platform: 'both',
  category: 'Tech & Consumer Electronics',
  bio: 'Top tech reviewer and digital creator sharing in-depth gadget breakdowns, smartphone camera tests, and setup builds.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  phone: '+91 98200 12345',
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
  created_at: new Date().toISOString()
};

export const MediaKitModal: React.FC<MediaKitModalProps> = ({
  user,
  currency,
  isOpen,
  onClose,
  onOpenAuth
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

  const activeUser = user || DEMO_MEDIA_USER;
  const isUSD = currency === 'USD';
  const sym = isUSD ? '$' : '₹';

  // Base rates from profile or sensible defaults
  const rates = {
    reel: activeUser.rates?.reel_rate || (isUSD ? 600 : 45000),
    video: activeUser.rates?.video_rate || (isUSD ? 1500 : 120000),
    story: activeUser.rates?.story_rate || (isUSD ? 200 : 15000),
    whitelisting_monthly: activeUser.rates?.whitelisting_monthly_rate || (isUSD ? 350 : 25000)
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const shareText = `🌟 ${activeUser.name} (${activeUser.handle}) — Official Creator Media Kit & Rate Card 2026\n` +
      `📊 Category: ${activeUser.category || 'Tech & Lifestyle'}\n` +
      `🔥 Avg Reel Views: 85,000+ | Engagement: 5.2%\n` +
      `💰 Baseline Rates: Reel (${sym}${rates.reel.toLocaleString()}) | YouTube Video (${sym}${rates.video.toLocaleString()})\n` +
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

        {/* Demo Mode Notice Banner */}
        {!user && (
          <div className="px-6 py-2.5 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-amber-500/15 border-b border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-amber-500" />
              Previewing Demo Media Kit (Aarav Sharma). Sign in to personalize your rates and social handles.
            </span>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-xs"
              >
                Sign In / Claim
              </button>
            )}
          </div>
        )}

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

          {/* Audience & Reach Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-500/20 text-center">
              <div className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 flex items-center justify-center gap-1 mb-1">
                <Instagram size={12} /> IG Followers
              </div>
              <div className="text-lg font-black text-zinc-900 dark:text-white">142,000+</div>
              <div className="text-[10px] text-zinc-500">Tier 1 Metros (74%)</div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/5 to-amber-500/5 border border-red-500/20 text-center">
              <div className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-1 mb-1">
                <Youtube size={12} /> YT Subscribers
              </div>
              <div className="text-lg font-black text-zinc-900 dark:text-white">88,500+</div>
              <div className="text-[10px] text-zinc-500">Active Viewers</div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 text-center">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mb-1">
                <Eye size={12} /> Avg Reel Views
              </div>
              <div className="text-lg font-black text-zinc-900 dark:text-white">65,000+</div>
              <div className="text-[10px] text-zinc-500">Consistent Reach</div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border border-indigo-500/20 text-center">
              <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1 mb-1">
                <TrendingUp size={12} /> Engagement Rate
              </div>
              <div className="text-lg font-black text-zinc-900 dark:text-white">5.4%</div>
              <div className="text-[10px] text-zinc-500">2.1x Category Benchmark</div>
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
                    {formatCurrency(rates.reel, currency)}
                  </div>
                  <div className="text-[10px] text-zinc-400">per deliverable</div>
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
                    {formatCurrency(rates.video, currency)}
                  </div>
                  <div className="text-[10px] text-zinc-400">per video</div>
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
                    {formatCurrency(rates.story, currency)}
                  </div>
                  <div className="text-[10px] text-zinc-400">3 frames</div>
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
                    +{formatCurrency(rates.whitelisting_monthly, currency)}
                  </div>
                  <div className="text-[10px] text-zinc-400">per 30 days</div>
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
              <li>• <strong>Payment Terms:</strong> 50% advance on agreement, 50% NET-15 post live link.</li>
              <li>• <strong>Revisions:</strong> Up to 2 rounds of edits on first-cut draft before publishing.</li>
              <li>• <strong>Exclusivity:</strong> Standard rates include 15-day category exclusivity.</li>
              <li>• <strong>Usage Rights:</strong> Organic posting rights included. Paid ads require whitelisting add-on.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
