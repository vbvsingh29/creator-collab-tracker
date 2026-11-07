import React from 'react';
import { 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Lock, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth, onDemoLogin }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        {/* Editorial Category Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-6">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>The Sponsorship Operating System</span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-slate-900 dark:text-white font-bold">YouTube & Instagram</span>
        </div>

        {/* Clean Main Headline (No generic purple gradient slop) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.08]">
          Sponsorships without the{' '}
          <span className="underline decoration-slate-300 dark:decoration-zinc-700 decoration-wavy underline-offset-8">
            spreadsheet chaos.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          From first brand inquiry to final bank transfer. Calculate dynamic deliverable rates, detect exclusivity collisions before signing, and generate 1-click tax-compliant brand invoices.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={() => onDemoLogin('aarav@tech.com')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 group"
          >
            <Zap size={16} className="text-amber-400 fill-amber-400" />
            <span>1-Click Interactive Demo</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-900 dark:text-white font-semibold text-sm transition-all shadow-xs"
          >
            Sign In / Register
          </button>
        </div>

        {/* Confidence Guarantees */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Zero credit card required</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Preloaded creator sandbox</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-slate-700 dark:text-zinc-300" />
            <span>Strict GDPR Art. 25 Isolation</span>
          </span>
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-14 pt-8 border-t border-slate-200/90 dark:border-zinc-850 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Onboarded Talent
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              1,424+
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> +18.4% monthly growth
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tracked Deal Volume
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              $4.8M+
            </div>
            <div className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium mt-1">
              Across YouTube & Instagram
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              On-Time Payout Rate
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              99.4%
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              Automated invoice tracking
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Exclusivity Collisions
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              0 Lawsuits
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle size={12} /> Proactive category radar
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
