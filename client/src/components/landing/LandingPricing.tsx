import React, { useState } from 'react';
import { Check, Zap, Crown, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface LandingPricingProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onOpenAuth, onDemoLogin }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <section id="pricing" className="py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Predictable SaaS Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-2 tracking-tight">
            Plans that pay for themselves on your first deal.
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Recovering just one missed whitelisting fee covers CollabFlow for an entire year.
          </p>

          {/* Billing Toggle */}
          <div className="mt-6 inline-flex items-center gap-2 p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tier 1: Free Starter */}
          <div className="p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-zinc-900 dark:text-white">Free Starter</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  Solo Creators
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">$0</span>
                <span className="text-xs text-zinc-500">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Essential tools for creators getting their first brand deals.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Up to 10 active brand collaborations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Interactive Rate Card Calculator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Standard brand invoice generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Creator Media Kit one-pager</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onDemoLogin('aarav@tech.com')}
              className="mt-8 w-full py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white font-semibold text-xs transition-colors"
            >
              Get Started Free (No CC)
            </button>
          </div>

          {/* Tier 2: Pro Creator (Highlighted) */}
          <div className="p-7 rounded-3xl border-2 border-indigo-500/80 bg-white dark:bg-zinc-900/90 flex flex-col justify-between shadow-xl shadow-indigo-500/10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-sm">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Crown size={16} className="text-indigo-500" />
                  <span>Pro Creator</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                  Recommended
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                  ${billingCycle === 'annual' ? '15' : '19'}
                </span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Full operating system for serious creators scaling brand sponsorships.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-500 shrink-0" />
                  <span className="font-bold text-zinc-900 dark:text-white">Unlimited brand collaborations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-500 shrink-0" />
                  <span className="font-bold text-zinc-900 dark:text-white">Exclusivity Collision Radar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-500 shrink-0" />
                  <span>AI Sponsor Pitch & Counter-Offers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-500 shrink-0" />
                  <span>Overdue invoice tracking & auto-escalation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-500 shrink-0" />
                  <span>Live YouTube Data & Instagram Graph API Sync</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onDemoLogin('aarav@tech.com')}
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Zap size={13} className="text-amber-300 fill-amber-300" />
              <span>Start Free 14-Day Pro Trial</span>
            </button>
          </div>

          {/* Tier 3: Agency & Studio */}
          <div className="p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-zinc-900 dark:text-white">Agency & Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  Talent Teams
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                  ${billingCycle === 'annual' ? '65' : '79'}
                </span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Multi-creator management for talent managers and creator management firms.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>5 team seats with custom roles (Manager, Editor, CA)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Cross-roster brand collision scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Consolidated agency billing & GST reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Dedicated priority API quota and Slack channel</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth()}
              className="mt-8 w-full py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white font-semibold text-xs transition-colors"
            >
              Contact Agency Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
