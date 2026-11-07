import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Sparkles, 
  DollarSign, 
  Check, 
  ArrowRight, 
  TrendingUp, 
  Zap,
  Sliders
} from 'lucide-react';

interface InteractiveRateCalculatorProps {
  onDemoLogin: (email: string) => void;
}

type Niche = 'tech' | 'lifestyle' | 'gaming' | 'finance' | 'fitness';

const CPM_RATES: Record<Niche, { label: string; cpm: number }> = {
  tech: { label: '💻 Tech & Gadgets', cpm: 32 },
  finance: { label: '📈 Finance & Business', cpm: 45 },
  lifestyle: { label: '✨ Lifestyle & Beauty', cpm: 24 },
  gaming: { label: '🎮 Gaming & Esports', cpm: 18 },
  fitness: { label: '🏋️ Fitness & Health', cpm: 22 },
};

export const InteractiveRateCalculator: React.FC<InteractiveRateCalculatorProps> = ({ onDemoLogin }) => {
  const [avgViews, setAvgViews] = useState<number>(45000);
  const [niche, setNiche] = useState<Niche>('tech');
  const [format, setFormat] = useState<'dedicated' | 'integration' | 'reel'>('integration');
  const [hasWhitelisting, setHasWhitelisting] = useState<boolean>(true);
  const [hasExclusivity, setHasExclusivity] = useState<boolean>(true);
  const [hasRush, setHasRush] = useState<boolean>(false);

  // Calculation
  const calculation = useMemo(() => {
    const baseCpm = CPM_RATES[niche].cpm;
    let baseRate = (avgViews / 1000) * baseCpm;

    if (format === 'integration') {
      baseRate = baseRate * 0.6; // 60s mid-roll
    } else if (format === 'reel') {
      baseRate = baseRate * 0.45; // 30-60s IG Reel
    }

    let multiplier = 1.0;
    let whitelistingFee = 0;
    let exclusivityFee = 0;
    let rushFee = 0;

    if (hasWhitelisting) {
      whitelistingFee = baseRate * 0.4; // +40%
    }
    if (hasExclusivity) {
      exclusivityFee = baseRate * 0.3; // +30%
    }
    if (hasRush) {
      rushFee = baseRate * 0.25; // +25%
    }

    const totalEstimate = baseRate + whitelistingFee + exclusivityFee + rushFee;
    const lowRange = Math.round(totalEstimate * 0.9 / 50) * 50;
    const highRange = Math.round(totalEstimate * 1.15 / 50) * 50;

    return {
      baseRate: Math.round(baseRate),
      whitelistingFee: Math.round(whitelistingFee),
      exclusivityFee: Math.round(exclusivityFee),
      rushFee: Math.round(rushFee),
      totalEstimate: Math.round(totalEstimate),
      lowRange,
      highRange,
      effectiveCpm: ((totalEstimate / avgViews) * 1000).toFixed(1)
    };
  }, [avgViews, niche, format, hasWhitelisting, hasExclusivity, hasRush]);

  return (
    <section id="calculator" className="py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
            <Calculator size={13} />
            <span>Dynamic Rate Card Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Stop undercharging for your brand integrations.
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Never guess your sponsorship quote. Use our commercial formula calibrated with actual 2026 creator deals across YouTube and Instagram.
          </p>
        </div>

        {/* Interactive Calculator Card */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Average Views Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  Average Views per Video / Reel:
                </span>
                <span className="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                  {avgViews.toLocaleString()} views
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={avgViews}
                onChange={(e) => setAvgViews(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>5K</span>
                <span>50K</span>
                <span>100K</span>
                <span>250K+</span>
              </div>
            </div>

            {/* Niche Selector */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Channel Category & Industry:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(CPM_RATES) as Niche[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNiche(key)}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      niche === key
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    <div className="font-semibold truncate">{CPM_RATES[key].label}</div>
                    <div className={`text-[10px] ${niche === key ? 'text-indigo-200' : 'text-zinc-400'}`}>
                      ${CPM_RATES[key].cpm} CPM
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Deliverable Format */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Primary Deliverable Format:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('integration')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    format === 'integration'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  60s Integration
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('dedicated')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    format === 'dedicated'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Dedicated Video
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('reel')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    format === 'reel'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Instagram Reel
                </button>
              </div>
            </div>

            {/* Commercial Add-ons Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Commercial Add-on Rights:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={hasWhitelisting}
                    onChange={(e) => setHasWhitelisting(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">30d Whitelist (+40%)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={hasExclusivity}
                    onChange={(e) => setHasExclusivity(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">Exclusivity (+30%)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={hasRush}
                    onChange={(e) => setHasRush(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">Rush &lt;48h (+25%)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Quotation Result Card Column (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Recommended Sponsor Quote
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                High Value
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                ${calculation.lowRange.toLocaleString()} - ${calculation.highRange.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Estimated baseline: <strong className="text-zinc-800 dark:text-zinc-200">${calculation.totalEstimate.toLocaleString()}</strong> ({calculation.effectiveCpm} Effective CPM)
              </p>
            </div>

            {/* Breakdown lines */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Base Deliverable:</span>
                <span className="font-mono font-medium">${calculation.baseRate.toLocaleString()}</span>
              </div>
              {hasWhitelisting && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>+ Ad Whitelisting (Meta/Google):</span>
                  <span className="font-mono font-medium">+${calculation.whitelistingFee.toLocaleString()}</span>
                </div>
              )}
              {hasExclusivity && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>+ Category Exclusivity Lock:</span>
                  <span className="font-mono font-medium">+${calculation.exclusivityFee.toLocaleString()}</span>
                </div>
              )}
              {hasRush && (
                <div className="flex justify-between text-purple-600 dark:text-purple-400">
                  <span>+ Rush Production Turnaround:</span>
                  <span className="font-mono font-medium">+${calculation.rushFee.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Action CTA */}
            <button
              onClick={() => onDemoLogin('aarav@tech.com')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Zap size={14} className="text-amber-300 fill-amber-300" />
              <span>Save to My Rate Card (1-Click Demo)</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
