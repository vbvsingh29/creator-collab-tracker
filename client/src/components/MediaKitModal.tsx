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
}

export const MediaKitModal: React.FC<MediaKitModalProps> = ({
  user,
  currency,
  isOpen,
  onClose
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

  if (!isOpen || !user) return null;

  const isUSD = currency === 'USD';
  const sym = isUSD ? '$' : '₹';

  // Base rates from profile or sensible defaults
  const rates = {
    reel: user.rates?.reel_rate || (isUSD ? 600 : 45000),
    video: user.rates?.video_rate || (isUSD ? 1500 : 120000),
    story: user.rates?.story_rate || (isUSD ? 200 : 15000),
    whitelisting_monthly: user.rates?.whitelisting_monthly_rate || (isUSD ? 350 : 25000)
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const shareText = `🌟 ${user.name} (${user.handle}) — Official Creator Media Kit & Rate Card 2026\n` +
      `📊 Category: ${user.category || 'Tech & Lifestyle'}\n` +
      `🔥 Avg Reel Views: 85,000+ | Engagement: 5.2%\n` +
      `💰 Baseline Rates: Reel (${sym}${rates.reel.toLocaleString()}) | YouTube Video (${sym}${rates.video.toLocaleString()})\n` +
      `✉️ Direct Inquiries: ${user.email}`;
    
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? 'Copied Pitch!' : 'Copy Pitch One-Pager'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 transition-colors ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Media Kit Sheet Container (Printable) */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header Profile Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-zinc-200 dark:border-zinc-800 text-center sm:text-left">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-20 h-20 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-lg"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">{user.name}</h2>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {user.handle}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck size={12} /> Verified Creator
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium max-w-xl leading-relaxed">
                {user.bio || 'Professional digital creator partnering with top brands for high-converting visual storytelling, organic reviews, and performance ads.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Category: {user.category || 'Tech & Consumer Lifestyle'}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                {user.phone && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1"><Phone size={12} /> {user.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Key Audience Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center sm:text-left">
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Reach</span>
                <Users size={14} className="text-indigo-500" />
              </div>
              <div className="text-xl font-black text-zinc-900 dark:text-white">685,000+</div>
              <p className="text-[10px] text-zinc-400 mt-0.5">IG + YouTube followers</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center sm:text-left">
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Views</span>
                <Eye size={14} className="text-emerald-500" />
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">92,400</div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Per dedicated reel</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center sm:text-left">
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Engagement</span>
                <TrendingUp size={14} className="text-pink-500" />
              </div>
              <div className="text-xl font-black text-pink-600 dark:text-pink-400">5.4%</div>
              <p className="text-[10px] text-zinc-400 mt-0.5">2.2x industry average</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center sm:text-left">
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Audience Age</span>
                <Award size={14} className="text-amber-500" />
              </div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">18 - 34</div>
              <p className="text-[10px] text-zinc-400 mt-0.5">High buyer intent (78%)</p>
            </div>
          </div>

          {/* Standard Sponsorship Packages Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span>Standard Sponsorship Deliverables & Commercials</span>
            </h4>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-3 px-4">Deliverable Package</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Included Scope</th>
                    <th className="py-3 px-4 text-right">Standard Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">60s Integrated Reel</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-500 border border-pink-500/20">
                        <Instagram size={11} /> Instagram
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-[11px]">4K production, talking points, 30d sticker link</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(rates.reel, currency)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">Dedicated YouTube Video (8-12m)</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                        <Youtube size={11} /> YouTube
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-[11px]">Full review, pinned comment, tracking link in bio</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(rates.video, currency)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">3x Story Sequence with Link</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-500 border border-pink-500/20">
                        <Instagram size={11} /> Instagram
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-[11px]">24-hour live promo code, direct swipe/tap sticker</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(rates.story, currency)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">30-Day Paid Ads Whitelisting</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        Meta / Google
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-[11px]">Creator handles advertising access via Meta Business Manager</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(rates.whitelisting_monthly, currency)}/mo
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Past Trusted Brand Partners Showcase */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Trusted Past Brand Partnerships
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              {['Samsung', 'Notion', 'NordVPN', 'Logitech', 'Spotify', 'Zerodha', 'Sony', 'Boat'].map((brand, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Terms & Pitch Inquiries */}
          <div className="p-4 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-500 space-y-1">
            <div className="font-bold text-zinc-700 dark:text-zinc-300">Booking & Production Terms:</div>
            <p>• 50% advance deposit or Net 30 payment upon mutual contract execution.</p>
            <p>• 7-day turnaround for script draft; 1 free round of brand messaging revisions included.</p>
            <p>• Commercial exclusivity lockouts available upon request (+25% category lockout fee).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
