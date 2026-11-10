import React from 'react';
import { 
  ShieldAlert, 
  Kanban, 
  Receipt,
  CheckCircle2,
  Users2
} from 'lucide-react';

interface LandingFeatureGridProps {
  onDemoLogin: (email: string) => void;
  onOpenAuth: () => void;
}

export const LandingFeatureGrid: React.FC<LandingFeatureGridProps> = ({ onDemoLogin }) => {
  return (
    <section id="features" className="py-20 sm:py-24 border-b border-charcoal-800/80 bg-charcoal-950/40 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-sand-400 uppercase tracking-widest font-mono">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-sand-50 mt-3 tracking-tight">
            Built for how top creators actually run sponsorships.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-sand-300/70">
            No bloated agency software. Just the precision tools you need to close deals, manage team accounts, deliver on time, and get paid.
          </p>
        </div>

        {/* 3 Luxury Charcoal & Sand Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Pipeline */}
          <div className="p-7 rounded-2xl border border-charcoal-800 bg-charcoal-900/80 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-sand-400/30 group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-charcoal-850 border border-sand-400/20 text-sand-300 flex items-center justify-center mb-6 group-hover:border-sand-400/40 transition-colors">
                <Kanban size={20} />
              </div>
              <h3 className="text-lg font-bold text-sand-100">
                Deals Pipeline
              </h3>
              <p className="mt-2 text-xs text-sand-300/70 leading-relaxed">
                Track each brand partnership through every milestone: brief received, script outline, rough cut review, and video go-live date.
              </p>
              <ul className="mt-5 space-y-2.5 text-xs text-sand-300/80">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-sand-400 shrink-0" />
                  <span>Dedicated YouTube & Instagram deliverable formats</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-sand-400 shrink-0" />
                  <span>Custom promo code and tracking link management</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-sand-400 shrink-0" />
                  <span>Multi-account tagging across all your channels</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Exclusivity */}
          <div className="p-7 rounded-2xl border border-charcoal-800 bg-charcoal-900/80 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-sand-400/30 group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-charcoal-850 border border-sand-400/20 text-sand-400 flex items-center justify-center mb-6 group-hover:border-sand-400/40 transition-colors">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold text-sand-100">
                Exclusivity Scanner
              </h3>
              <p className="mt-2 text-xs text-sand-300/70 leading-relaxed">
                Signing a sponsor while under contract with a competitor triggers breach penalties. Collabio automatically scans category overlaps before you sign.
              </p>
              <ul className="mt-5 space-y-2.5 text-xs text-sand-300/80">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-sand-400 shrink-0" />
                  <span>30, 60, and 90-day cooldown period checks</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-sand-400 shrink-0" />
                  <span>Category tagging across VPNs, beverage, fintech & tech</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-sand-400 shrink-0" />
                  <span>Automatic breach prevention alerts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Invoicing & Team */}
          <div className="p-7 rounded-2xl border border-charcoal-800 bg-charcoal-900/80 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-sand-400/30 group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-charcoal-850 border border-sand-400/20 text-sand-300 flex items-center justify-center mb-6 group-hover:border-sand-400/40 transition-colors">
                <Receipt size={20} />
              </div>
              <h3 className="text-lg font-bold text-sand-100">
                Invoices & Manager Access
              </h3>
              <p className="mt-2 text-xs text-sand-300/70 leading-relaxed">
                Generate clean PDF invoices with bank wiring details in 1 click. Invite managers with optional rate privacy masking.
              </p>
              <ul className="mt-5 space-y-2.5 text-xs text-sand-300/80">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-sand-400 shrink-0" />
                  <span>Role-based team delegation with privacy controls</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-sand-400 shrink-0" />
                  <span>Automated TDS calculation and GST compliance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-sand-400 shrink-0" />
                  <span>Overdue payment flags with 1-click reminders</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
