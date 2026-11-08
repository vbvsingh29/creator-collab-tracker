import React from 'react';
import { 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Lock,
  Youtube,
  Instagram,
  Clock
} from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth, onDemoLogin }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-slate-200/80 dark:border-zinc-850 bg-white dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Simple Plain Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Sponsorship Management for Creators</span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-slate-900 dark:text-white font-semibold">YouTube & Instagram</span>
        </div>

        {/* Clear, Plain Headline (Anti-Slop: Plain copy, no fake metaphors) */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Track creator sponsorships. Deliver on time. Get paid.
        </h1>

        {/* Subtitle (1 sentence, clear fact) */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Collabio is the intelligent sponsorship operating system for YouTube & Instagram creators. Replace scattered spreadsheets with automated deliverable tracking, real-time live video view sync, brand exclusivity protection, and 1-click professional invoicing.
        </p>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-zinc-950 font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Get Started Free</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-800 dark:text-zinc-200 font-medium text-sm transition-all shadow-xs"
          >
            Sign In to Workspace
          </button>
        </div>

        {/* Trust Points */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>No credit card required</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Free for solo creators</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-slate-600 dark:text-zinc-400" />
            <span>Private & isolated workspace</span>
          </span>
        </div>

        {/* Real Product UI Mockup (Anti-Slop: Shows the real thing on the screen) */}
        <div className="mt-12 text-left max-w-5xl mx-auto rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 p-3 sm:p-5 shadow-sm">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
              </div>
              <span className="text-slate-400 dark:text-zinc-500 font-mono text-[11px] ml-2">app.collabflow.io/pipeline</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
                Active Workspace
              </span>
            </div>
          </div>

          {/* Clean 3-Column Pipeline Demonstration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Column 1: Review Brief */}
            <div className="bg-white dark:bg-zinc-900/90 rounded-xl border border-slate-200 dark:border-zinc-800 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 pb-1 border-b border-slate-100 dark:border-zinc-800">
                <span>In Review</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">1</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-900 dark:text-white">Nike India</span>
                  <span className="text-pink-600 dark:text-pink-400 flex items-center gap-1 text-[11px]"><Instagram size={11} /> Reel</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">1x Instagram Reel for Air Max release</p>
                <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-900 dark:text-white font-semibold">₹65,000</span>
                  <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1"><Clock size={10} /> Due Nov 18</span>
                </div>
              </div>
            </div>

            {/* Column 2: In Production */}
            <div className="bg-white dark:bg-zinc-900/90 rounded-xl border border-slate-200 dark:border-zinc-800 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 pb-1 border-b border-slate-100 dark:border-zinc-800">
                <span>In Production</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">1</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-900 dark:text-white">Sony Alpha</span>
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1 text-[11px]"><Youtube size={11} /> Video</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">Dedicated Camera Hands-On review</p>
                <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-900 dark:text-white font-semibold">₹1,20,000</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Script Approved</span>
                </div>
              </div>
            </div>

            {/* Column 3: Payment Due */}
            <div className="bg-white dark:bg-zinc-900/90 rounded-xl border border-slate-200 dark:border-zinc-800 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 pb-1 border-b border-slate-100 dark:border-zinc-800">
                <span>Payment Pending</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">1</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-900 dark:text-white">NordVPN</span>
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1 text-[11px]"><Youtube size={11} /> 60s Integration</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">Cybersecurity promo integration link</p>
                <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-900 dark:text-white font-semibold">$1,500</span>
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Net-15 Wire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
