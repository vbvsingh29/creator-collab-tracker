import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

interface LandingPricingProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onOpenAuth, onDemoLogin }) => {
  const { content } = useCms();
  const pricing = content.pricing;
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const packages = pricing.packages && pricing.packages.length > 0 ? pricing.packages : [
    {
      id: 'solo-creator',
      name: 'Solo Creator',
      tagline: 'Essential deal tracking for individual creators managing brand sponsorships.',
      priceMonthly: 0,
      priceAnnual: 0,
      currency: 'USD',
      isPopular: false,
      badge: 'Free Forever',
      ctaText: 'Get Started Free',
      ctaUrl: '#auth',
      features: [
        'Up to 10 active brand collaborations',
        'Pipeline board (Kanban & Table view)',
        'YouTube & Instagram deliverable formats',
        'Mobile SMS OTP & passwordless login'
      ]
    },
    {
      id: 'pro-teams',
      name: 'Pro & Teams',
      tagline: 'Complete operating system for full-time creators, managers, and multi-channel teams.',
      priceMonthly: 19,
      priceAnnual: 15,
      currency: 'USD',
      isPopular: true,
      badge: 'Most Popular',
      ctaText: 'Get Started with Pro',
      ctaUrl: '#auth',
      features: [
        'Unlimited brand collaborations',
        'Multi-Account Creator Hub (IG & YT)',
        'Manager Access with Financial Privacy Masking',
        'Exclusivity Collision Scanner',
        '1-Click Tax Invoice Generator (USD & INR)'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 sm:py-24 border-b border-charcoal-800/80 bg-charcoal-950/40 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold text-sand-400 uppercase tracking-widest font-mono">
            {pricing.badgeText || 'Transparent Pricing'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-sand-50 mt-3 tracking-tight">
            {pricing.title || 'Simple, transparent tiers.'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-sand-300/70">
            {pricing.subtitle || 'Free to get started. Upgrade only when your multi-channel sponsor volume and team scale.'}
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
                {pricing.billingDiscountBadge || 'Save 20%'}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Tiers Grid */}
        <div className={`grid grid-cols-1 ${packages.length === 2 ? 'md:grid-cols-2 max-w-3xl' : packages.length >= 3 ? 'md:grid-cols-3 max-w-5xl' : 'max-w-md'} gap-7 mx-auto`}>
          {packages.map((pkg) => {
            const price = billingCycle === 'annual' ? pkg.priceAnnual : pkg.priceMonthly;
            const currencySymbol = pkg.currency === 'INR' ? '₹' : '$';

            return (
              <div
                key={pkg.id}
                className={`p-7 rounded-2xl flex flex-col justify-between backdrop-blur-xl transition-all ${
                  pkg.isPopular
                    ? 'border-2 border-sand-400/50 bg-charcoal-900/95 shadow-[0_10px_40px_-10px_rgba(217,199,178,0.15)] relative group hover:border-sand-300'
                    : 'border border-charcoal-800 bg-charcoal-900/80 shadow-xl hover:border-sand-400/20'
                }`}
              >
                {pkg.isPopular && (
                  <span className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold bg-sand-200 text-charcoal-950 shadow-md">
                    {pkg.badge || 'Most Popular'}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-sand-100">{pkg.name}</span>
                    {pkg.badge && !pkg.isPopular && (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-charcoal-800 text-sand-300 border border-charcoal-700">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-sand-50">
                      {price === 0 ? '$0' : `${currencySymbol}${price}`}
                    </span>
                    <span className="text-xs text-sand-300/60 font-medium">/ month</span>
                  </div>

                  <p className="mt-2 text-xs text-sand-300/70">
                    {pkg.tagline}
                  </p>

                  <div className="mt-6 space-y-3 text-xs text-sand-300/80 border-t border-charcoal-800 pt-5">
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2.5">
                        <Check size={14} className="text-sand-400 shrink-0" />
                        <span className={pkg.isPopular && fIdx < 3 ? 'font-semibold text-sand-100' : ''}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onOpenAuth}
                  className={`mt-8 w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    pkg.isPopular
                      ? 'bg-sand-200 hover:bg-sand-100 text-charcoal-950 shadow-[0_4px_16px_rgba(217,199,178,0.2)] active:scale-95'
                      : 'border border-charcoal-800 hover:border-sand-400/40 bg-charcoal-850 hover:bg-charcoal-800 text-sand-200 hover:text-sand-100 shadow-sm'
                  }`}
                >
                  <span>{pkg.ctaText || 'Get Started'}</span>
                  {pkg.isPopular && <ArrowRight size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
