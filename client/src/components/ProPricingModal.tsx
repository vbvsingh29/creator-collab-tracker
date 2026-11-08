import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Zap, Shield, Building2, Crown, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency } from '../types';

interface ProPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
}

export const ProPricingModal: React.FC<ProPricingModalProps> = ({
  isOpen,
  onClose,
  currency
}) => {
  if (!isOpen) return null;

  const [annualBilling, setAnnualBilling] = useState(true);
  const [upgraded, setUpgraded] = useState(false);

  const isUSD = currency === 'USD';
  const sym = isUSD ? '$' : '₹';

  // Pricing values
  const proMonthly = isUSD ? 19 : 1499;
  const proAnnualMonthly = isUSD ? 15 : 1199;

  const agencyMonthly = isUSD ? 79 : 5999;
  const agencyAnnualMonthly = isUSD ? 59 : 4799;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSimulateUpgrade = (planName: string) => {
    setUpgraded(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      alert(`🎉 Welcome to Collabio ${planName}! In production, this redirects to Stripe Checkout or Razorpay Subscriptions.`);
      setUpgraded(false);
      onClose();
    }, 1200);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Crown size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Upgrade Your Creator Business
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  SaaS Plans
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Save 10+ hours per month and close brand deals with automated invoicing & radar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Billing Switcher (Monthly vs Annual) */}
        <div className="flex justify-center">
          <div className="p-1 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
                !annualBilling ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                annualBilling ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-400 text-black rounded-full">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free Tier */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-200">Starter Creator</h3>
                <p className="text-xs text-zinc-500 mt-0.5">For creators starting brand collaborations</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{sym}0</span>
                <span className="text-xs text-zinc-500">/ forever</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Up to 5 active deals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Simple & Kanban Pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Basic Rate Card Calculator</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-500">
                  <X size={14} className="text-zinc-600 shrink-0" />
                  <span>No PDF Invoice Generation</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-500">
                  <X size={14} className="text-zinc-600 shrink-0" />
                  <span>No Exclusivity Clash Radar</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-semibold cursor-default"
            >
              Current Active Plan
            </button>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-zinc-900 to-zinc-950 border-2 border-indigo-500/60 shadow-xl shadow-indigo-600/10 flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow">
              Most Popular
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Pro Creator
                  <Sparkles size={14} className="text-amber-400 fill-amber-400" />
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Full commercial automation for full-time creators</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">
                  {sym}{annualBilling ? proAnnualMonthly : proMonthly}
                </span>
                <span className="text-xs text-zinc-400">/ month {annualBilling && '(billed yearly)'}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-200">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited Brand Deals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>1-Click PDF Brand Invoice Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Category Exclusivity Clash Radar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>AI Pitch & Counter-Offer Generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Live YouTube & Instagram Metrics Sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Export to Excel / CSV for Tax & CA</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSimulateUpgrade('Pro Creator')}
              disabled={upgraded}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>{upgraded ? 'Activating Pro...' : 'Upgrade to Pro'}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Agency & Manager Tier */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                  Agency & Talent Roster
                  <Building2 size={14} className="text-zinc-400" />
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">For talent agencies managing multiple creators</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">
                  {sym}{annualBilling ? agencyAnnualMonthly : agencyMonthly}
                </span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Manage up to 10 Creator Profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Centralized Agency Cashflow Radar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>White-label Brand Reports (Custom Logo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>3 Manager Team Seats</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Priority WhatsApp / Dedicated Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSimulateUpgrade('Agency Tier')}
              className="w-full py-2.5 rounded-xl border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Contact for Agency Demo</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Security & Guarantee Trust Bar */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-xs gap-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-indigo-400" />
            <span>256-bit encryption • Cancel anytime with 1 click • 14-day money back guarantee</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Payments powered by <strong>Stripe & Razorpay</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
