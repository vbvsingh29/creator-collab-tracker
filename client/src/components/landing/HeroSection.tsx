import React from 'react';
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Play, 
  TrendingUp,
  DollarSign,
  Building2,
  AlertTriangle
} from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth, onDemoLogin }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-zinc-200/80 dark:border-zinc-800/80">
      {/* Background Subtle Radial Gradient (Non-slop, restrained) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        {/* Anti-Slop Category Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-xs mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>The Creator Sponsorship Operating System</span>
          <span className="text-zinc-400">•</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">YouTube & Instagram</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-[1.08]">
          Sponsorships without the{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            spreadsheet chaos.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          From first brand inquiry to final wire transfer. Calculate dynamic deliverable rates, detect exclusivity collisions before signing, and generate 1-click tax-compliant brand invoices.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={() => onDemoLogin('aarav@tech.com')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 group"
          >
            <Zap size={16} className="text-amber-300 fill-amber-300" />
            <span>Explore 1-Click Interactive Demo</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-100 font-semibold text-sm transition-all shadow-xs"
          >
            Sign In / Register Workspace
          </button>
        </div>

        {/* Confidence Guarantees */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Zero credit card required</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Preloaded creator sandbox</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-indigo-400" />
            <span>Strict GDPR Art. 25 Isolation</span>
          </span>
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-14 pt-8 border-t border-zinc-200/70 dark:border-zinc-850 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Onboarded Talent
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
              1,424+
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp size={12} /> +18.4% monthly growth
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Tracked Deal Volume
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
              $4.8M+
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              Across YouTube & Instagram
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              On-Time Payout Rate
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
              99.4%
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Automated invoice escalation
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Exclusivity Collisions
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
              0 Lawsuits
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5 flex items-center gap-1">
              <AlertTriangle size={12} /> Proactive category scanning
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
