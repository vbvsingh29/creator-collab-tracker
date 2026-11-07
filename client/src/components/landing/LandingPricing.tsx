import React, { useState } from 'react';
import { Check, Zap, ArrowRight } from 'lucide-react';

interface LandingPricingProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onOpenAuth, onDemoLogin }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <section id="pricing" className="py-16 sm:py-20 border-b border-slate-200/80 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            Simple, transparent pricing.
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Free to get started. Upgrade only when your sponsor volume scales.
          </p>

          {/* Billing Toggle */}
          <div className="mt-6 inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 2 Clean Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Tier 1: Free Starter */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-900">Solo Creator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Free Forever
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">$0</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Essential deal tracking for individual creators getting brand sponsorships.
              </p>

              <div className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-200/80 pt-4">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Up to 10 active brand collaborations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Pipeline board (Kanban & Table view)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>YouTube & Instagram deliverable formats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Mobile SMS OTP & passwordless login</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAuth}
              className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-colors shadow-xs"
            >
              Get Started Free
            </button>
          </div>

          {/* Tier 2: Pro Creator */}
          <div className="p-6 rounded-2xl border-2 border-slate-900 bg-white flex flex-col justify-between shadow-md relative">
            <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
              Most Popular
            </span>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-900">Pro & Agency</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Full Suite
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  {billingCycle === 'annual' ? '$15' : '$19'}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Complete operating system for full-time creators and creator agencies.
              </p>

              <div className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-900">Unlimited brand collaborations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-900">Exclusivity Collision Scanner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>1-Click Tax Invoice Generator (USD & INR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Dynamic Rate Card Estimator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>AI Sponsor Pitch & Media Kit One-Pager</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onDemoLogin('aarav@tech.com')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Try Pro in Demo Mode</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
