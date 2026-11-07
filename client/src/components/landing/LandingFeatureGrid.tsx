import React from 'react';
import { 
  ShieldAlert, 
  FileText, 
  Bot, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Zap,
  Lock
} from 'lucide-react';

interface LandingFeatureGridProps {
  onDemoLogin: (email: string) => void;
  onOpenAuth: () => void;
}

export const LandingFeatureGrid: React.FC<LandingFeatureGridProps> = ({ onDemoLogin, onOpenAuth }) => {
  return (
    <section id="features" className="py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
            <Sparkles size={13} />
            <span>Built Specifically For Creators</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Everything your talent manager wishes you had in one place.
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Stop losing thousands in forgotten deliverables, delayed brand checks, and overlapping exclusivity contracts.
          </p>
        </div>

        {/* 4 Pillars Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1: Exclusivity Collision Radar */}
          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-colors group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Exclusivity Conflict Radar</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Patented
                </span>
              </h3>
              <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Signing a beverage sponsor while locked in a 30-day window with another drink brand can trigger clawback lawsuits. CollabFlow scans every incoming sponsor's category and dates in real time, alerting you before you accept the brief.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>30/60/90-day automatic overlap detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Category tagging (VPN, Energy Drinks, Fintech, Apparel)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Reschedule recommendations to preserve both deals</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">0 contract collisions</span>
              <button
                onClick={() => onDemoLogin('aarav@tech.com')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Test Radar in Demo</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Pillar 2: 1-Click Brand Invoicing */}
          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm flex flex-col justify-between hover:border-indigo-500/40 transition-colors group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>1-Click Tax Invoicing & Follow-up</span>
              </h3>
              <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Generate professional, tax-compliant PDF invoices with your legal GSTIN, PAN, Bank Wire, PayPal, and Net-30 payment milestones. Overdue deals automatically flag escalation alerts with 1-click email templates.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Auto-generates sequential invoice numbers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Net-15, Net-30, and milestone split payment terms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Instant PDF export and payment settlement tracking</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">99.4% on-time clearance</span>
              <button
                onClick={() => onDemoLogin('aarav@tech.com')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Preview Invoice Modal</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Pillar 3: AI Sponsor Pitch Studio */}
          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm flex flex-col justify-between hover:border-purple-500/40 transition-colors group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mb-6">
                <Bot size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>AI Sponsor Pitch & Counter-Offers</span>
              </h3>
              <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                When a brand lowballs you with an insulting rate, CollabFlow’s AI engine analyzes their campaign deliverables, pulls your audience demographic leverage, and drafts a polite, authoritative counter-offer in seconds.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Three negotiation tones: Assertive, Collaborative, or Firm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Calculates justified value packages (Reel + Story + Whitelisting)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Summarizes 10-page brand PDF briefs into 3 bullet points</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">34.8% higher close rate</span>
              <button
                onClick={() => onDemoLogin('aarav@tech.com')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Try Pitch Studio</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Pillar 4: Real-time Multi-Platform Health */}
          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
                <Radio size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Live YouTube & Instagram Telemetry</span>
              </h3>
              <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Direct integration with YouTube Data API v3 and Instagram Graph API. Monitor views, comment sentiment, and sponsored video retention curves without leaving your collaboration dashboard.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Live publish health check for sponsored links in descriptions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>1-click Creator Media Kit & Rate Card one-pager export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Offline-resilient fallback with instant local caching</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">Zero latency sync</span>
              <button
                onClick={() => onDemoLogin('aarav@tech.com')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View Live Integrations</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
