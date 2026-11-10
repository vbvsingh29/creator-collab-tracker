import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

interface LandingPricingProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onOpenAuth, onDemoLogin }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <section id="pricing" className="py-20 sm:py-24 border-b border-charcoal-800/80 bg-charcoal-950/40 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold text-sand-400 uppercase tracking-widest font-mono">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-sand-50 mt-3 tracking-tight">
            Simple, transparent tiers.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-sand-300/70">
            Free to get started. Upgrade only when your multi-channel sponsor volume and team scale.
          </p>

          {/* Luxury Billing Toggle */}
          <div className="mt-7 inline-flex items-center gap-1 p-1 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-sand-200 text-charcoal-950 shadow-sm font-semibold'
                  : 'text-sand-300/70 hover:text-sand-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-sand-200 text-charcoal-950 shadow-sm font-semibold'
                  : 'text-sand-300/70 hover:text-sand-100'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-charcoal-800 text-sand-300 font-bold border border-sand-400/20">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 2 Clean Charcoal & Sand Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-3xl mx-auto">
          {/* Tier 1: Free Starter */}
          <div className="p-7 rounded-2xl border border-charcoal-800 bg-charcoal-900/80 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-all hover:border-sand-400/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-sand-100">Solo Creator</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-charcoal-800 text-sand-300 border border-charcoal-700">
                  Free Forever
                </span>
              </div>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-sand-50">$0</span>
                <span className="text-xs text-sand-300/60 font-medium">/ month</span>
              </div>
              <p className="mt-2 text-xs text-sand-300/70">
                Essential deal tracking for individual creators managing brand sponsorships.
              </p>

              <div className="mt-6 space-y-3 text-xs text-sand-300/80 border-t border-charcoal-800 pt-5">
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-sand-400 shrink-0" />
                  <span>Up to 10 active brand collaborations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-sand-400 shrink-0" />
                  <span>Pipeline board (Kanban & Table view)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-sand-400 shrink-0" />
                  <span>YouTube & Instagram deliverable formats</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-sand-400 shrink-0" />
                  <span>Mobile SMS OTP & passwordless login</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAuth}
              className="mt-8 w-full py-3 rounded-xl border border-charcoal-800 hover:border-sand-400/40 bg-charcoal-850 hover:bg-charcoal-800 text-sand-200 hover:text-sand-100 font-semibold text-xs transition-all shadow-sm"
            >
              Get Started Free
            </button>
          </div>

          {/* Tier 2: Pro & Agency (Luxury Highlight) */}
          <div className="p-7 rounded-2xl border-2 border-sand-400/50 bg-charcoal-900/95 backdrop-blur-xl flex flex-col justify-between shadow-[0_10px_40px_-10px_rgba(217,199,178,0.15)] relative transition-all group hover:border-sand-300">
            <span className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold bg-sand-200 text-charcoal-950 shadow-md">
              Most Popular
            </span>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-sand-100">Pro & Teams</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sand-400/10 text-sand-300 border border-sand-400/20">
                  Full Suite
                </span>
              </div>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-sand-50">
                  {billingCycle === 'annual' ? '$15' : '$19'}
                </span>
                <span className="text-xs text-sand-300/60 font-medium">/ month</span>
              </div>
              <p className="mt-2 text-xs text-sand-300/70">
                Complete operating system for full-time creators, managers, and multi-channel teams.
              </p>

              <div className="mt-6 space-y-3 text-xs text-sand-300/80 border-t border-charcoal-800 pt-5">
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-sand-400 shrink-0" />
                  <span className="font-semibold text-sand-100">Unlimited brand collaborations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-sand-400 shrink-0" />
                  <span className="font-semibold text-sand-100">Multi-Account Creator Hub (IG & YT)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-sand-400 shrink-0" />
                  <span className="font-semibold text-sand-100">Manager Access with Financial Privacy Masking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-sand-400 shrink-0" />
                  <span>Exclusivity Collision Scanner</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-sand-400 shrink-0" />
                  <span>1-Click Tax Invoice Generator (USD & INR)</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAuth}
              className="mt-8 w-full py-3 rounded-xl bg-sand-200 hover:bg-sand-100 text-charcoal-950 font-semibold text-xs transition-all shadow-[0_4px_16px_rgba(217,199,178,0.2)] flex items-center justify-center gap-2 active:scale-95 hover:shadow-[0_6px_22px_rgba(217,199,178,0.3)]"
            >
              <span>Get Started with Pro</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
