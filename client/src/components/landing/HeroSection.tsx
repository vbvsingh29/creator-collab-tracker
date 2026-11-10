import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Lock,
  Youtube,
  Instagram,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';

interface HeroSectionProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth, onDemoLogin }) => {
  const { content } = useCms();
  const hero = content.hero;

  return (
    <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28 border-b border-charcoal-800/80 bg-transparent transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Luxury Sand Accent Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal-900/90 border border-sand-400/20 text-xs font-medium text-sand-200 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(217,199,178,0.06)] hover:border-sand-400/40 transition-colors">
          <Sparkles size={12} className="text-sand-400 animate-pulse" />
          <span className="text-sand-200">{hero.badgeText || 'Sponsorship Operating System'}</span>
          <span className="text-charcoal-700">•</span>
          <span className="text-sand-100 font-semibold">YouTube & Instagram</span>
        </div>

        {/* Clear, Refined Luxury Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-sand-50 max-w-4xl mx-auto leading-[1.08] font-sans">
          {hero.titleHighlight || 'Track creator deals.'}<br />
          <span className="bg-gradient-to-r from-sand-100 via-sand-300 to-sand-400 bg-clip-text text-transparent">
            {hero.titleMain || 'Deliver on time. Get paid.'}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-sand-300/80 max-w-2xl mx-auto leading-relaxed font-normal">
          {hero.subtitle || 'Collabio is the bespoke operating system for elite YouTube and Instagram creators to track deliverables, automate follow-ups, and get paid faster.'}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-sand-200 hover:bg-sand-100 text-charcoal-950 font-semibold text-sm shadow-[0_4px_20px_rgba(217,199,178,0.2)] flex items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-[0_6px_25px_rgba(217,199,178,0.3)]"
          >
            <span>{hero.primaryCtaText || 'Get Started Free'}</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-charcoal-800 hover:border-sand-400/40 bg-charcoal-900/90 hover:bg-charcoal-850 text-sand-200 hover:text-sand-100 font-medium text-sm transition-all shadow-md backdrop-blur-md"
          >
            {hero.secondaryCtaText || 'Sign In to Workspace'}
          </button>
        </div>

        {/* Trust Points */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-sand-300/60">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-sand-400" />
            <span>No credit card required</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-sand-400" />
            <span>Free for solo creators</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-sand-400" />
            <span>Isolated, encrypted workspace</span>
          </span>
        </div>

        {/* Real Product UI Mockup (Charcoal & Sand Dark Luxury Glass) */}
        <div className="mt-14 text-left max-w-5xl mx-auto rounded-2xl border border-charcoal-800 bg-charcoal-900/80 backdrop-blur-xl p-3 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative group hover:border-sand-400/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-sand-400/[0.03] to-transparent rounded-2xl pointer-events-none" />

          {/* Mock Browser Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-charcoal-800 text-xs relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-charcoal-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-charcoal-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-charcoal-700" />
              </div>
              <span className="text-sand-300/50 font-mono text-[11px] ml-2">app.collabflow.io/workspace</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-sand-400/10 text-sand-300 font-medium border border-sand-400/20">
                Active Workspace
              </span>
            </div>
          </div>

          {/* Clean 3-Column Pipeline Demonstration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
            {/* Column 1: Review Brief */}
            <div className="bg-charcoal-950/70 rounded-xl border border-charcoal-800/80 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-sand-200 pb-1.5 border-b border-charcoal-800">
                <span>In Review</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-charcoal-800 text-sand-300">1</span>
              </div>
              <div className="p-3 rounded-lg border border-charcoal-800 bg-charcoal-900/90 hover:border-sand-400/30 transition-colors shadow-sm">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-sand-100">Nike India</span>
                  <span className="text-pink-400 flex items-center gap-1 text-[11px]"><Instagram size={11} /> Reel</span>
                </div>
                <p className="text-[11px] text-sand-300/70 mb-2">1x Instagram Reel for Air Max release</p>
                <div className="flex items-center justify-between text-[11px] font-medium pt-1.5 border-t border-charcoal-800">
                  <span className="text-sand-100 font-semibold">₹65,000</span>
                  <span className="text-sand-300/60 flex items-center gap-1"><Clock size={10} /> Due Nov 18</span>
                </div>
              </div>
            </div>

            {/* Column 2: In Production */}
            <div className="bg-charcoal-950/70 rounded-xl border border-charcoal-800/80 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-sand-200 pb-1.5 border-b border-charcoal-800">
                <span>In Production</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-charcoal-800 text-sand-300">1</span>
              </div>
              <div className="p-3 rounded-lg border border-charcoal-800 bg-charcoal-900/90 hover:border-sand-400/30 transition-colors shadow-sm">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-sand-100">Sony Alpha</span>
                  <span className="text-red-400 flex items-center gap-1 text-[11px]"><Youtube size={11} /> Video</span>
                </div>
                <p className="text-[11px] text-sand-300/70 mb-2">Dedicated Camera Hands-On review</p>
                <div className="flex items-center justify-between text-[11px] font-medium pt-1.5 border-t border-charcoal-800">
                  <span className="text-sand-100 font-semibold">₹1,20,000</span>
                  <span className="text-emerald-400 font-semibold">Script Approved</span>
                </div>
              </div>
            </div>

            {/* Column 3: Payment Due */}
            <div className="bg-charcoal-950/70 rounded-xl border border-charcoal-800/80 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-sand-200 pb-1.5 border-b border-charcoal-800">
                <span>Payment Pending</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-charcoal-800 text-sand-300">1</span>
              </div>
              <div className="p-3 rounded-lg border border-charcoal-800 bg-charcoal-900/90 hover:border-sand-400/30 transition-colors shadow-sm">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-sand-100">NordVPN</span>
                  <span className="text-red-400 flex items-center gap-1 text-[11px]"><Youtube size={11} /> 60s Integration</span>
                </div>
                <p className="text-[11px] text-sand-300/70 mb-2">Cybersecurity promo integration link</p>
                <div className="flex items-center justify-between text-[11px] font-medium pt-1.5 border-t border-charcoal-800">
                  <span className="text-sand-100 font-semibold">$1,500</span>
                  <span className="text-amber-400 font-medium">Net-15 Wire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
