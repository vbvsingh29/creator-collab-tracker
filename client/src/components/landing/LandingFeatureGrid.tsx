import React from 'react';
import { 
  ShieldAlert, 
  Kanban, 
  Receipt,
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface LandingFeatureGridProps {
  onDemoLogin: (email: string) => void;
  onOpenAuth: () => void;
}

export const LandingFeatureGrid: React.FC<LandingFeatureGridProps> = ({ onDemoLogin }) => {
  return (
    <section id="features" className="py-16 sm:py-20 border-b border-slate-200/80 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            Built for how creators actually run sponsorships.
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            No bloated agency software. Just the three tools you need to close deals, deliver on time, and get paid.
          </p>
        </div>

        {/* 3 Clean Columns (Anti-Slop: Equal edges, no nested cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Pipeline */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center mb-5">
                <Kanban size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Deals Pipeline
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Track each brand partnership through every milestone: brief received, script outline, rough cut review, and video go-live date.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Dedicated YouTube & Instagram deliverable formats</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Custom promo code and tracking link management</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Exclusivity */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-amber-700 flex items-center justify-center mb-5">
                <ShieldAlert size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Exclusivity Scanner
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Signing a sponsor while under contract with a competitor triggers breach penalties. CollabFlow automatically scans category overlaps before you sign.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>30, 60, and 90-day cooldown period checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Category tagging across VPNs, beverage, fintech & tech</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Invoicing */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center mb-5">
                <Receipt size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Invoices & Payouts
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Generate clean, professional PDF invoices with bank wiring details in 1 click. Track Net-15, Net-30, and Net-60 payment dates in USD and INR.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Automated tax calculation and GST compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Overdue payment flags with pre-written reminder templates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
