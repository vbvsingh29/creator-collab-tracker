import React, { useState, useMemo } from 'react';
import { 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface InteractiveRateCalculatorProps {
  onOpenAuth?: () => void;
  onDemoLogin?: (email: string) => void;
}

type Niche = 'tech' | 'lifestyle' | 'gaming' | 'finance' | 'fitness';

const CPM_RATES: Record<Niche, { label: string; cpm: number }> = {
  tech: { label: 'Tech & Gadgets', cpm: 32 },
  finance: { label: 'Finance & Business', cpm: 45 },
  lifestyle: { label: 'Lifestyle & Fashion', cpm: 24 },
  gaming: { label: 'Gaming', cpm: 18 },
  fitness: { label: 'Fitness & Health', cpm: 22 },
};

export const InteractiveRateCalculator: React.FC<InteractiveRateCalculatorProps> = ({ onOpenAuth, onDemoLogin }) => {
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
      baseRate = baseRate * 0.6;
    } else if (format === 'reel') {
      baseRate = baseRate * 0.45;
    }

    let whitelistingFee = 0;
    let exclusivityFee = 0;
    let rushFee = 0;

    if (hasWhitelisting) {
      whitelistingFee = baseRate * 0.4;
    }
    if (hasExclusivity) {
      exclusivityFee = baseRate * 0.3;
    }
    if (hasRush) {
      rushFee = baseRate * 0.25;
    }

    const total = baseRate + whitelistingFee + exclusivityFee + rushFee;

    return {
      baseRate: Math.round(baseRate),
      whitelistingFee: Math.round(whitelistingFee),
      exclusivityFee: Math.round(exclusivityFee),
      rushFee: Math.round(rushFee),
      total: Math.round(total)
    };
  }, [avgViews, niche, format, hasWhitelisting, hasExclusivity, hasRush]);

  return (
    <section id="calculator" className="py-20 sm:py-24 border-b border-charcoal-800/80 bg-charcoal-950/60 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold text-sand-400 uppercase tracking-widest font-mono">
            Commercial Benchmark
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-sand-50 mt-3 tracking-tight">
            Sponsorship Rate Estimator
          </h2>
          <p className="mt-3 text-sm sm:text-base text-sand-300/70">
            Estimate market rates based on your verified audience views, usage rights, and category exclusivity.
          </p>
        </div>

        {/* Luxury Calculator Card */}
        <div className="p-6 sm:p-9 rounded-2xl border border-charcoal-800 bg-charcoal-900/90 backdrop-blur-xl shadow-2xl transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-6">
              {/* Average Views Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-sand-200 mb-2.5">
                  <span>Average Views per Video</span>
                  <span className="font-mono text-sm text-sand-300 font-bold">{avgViews.toLocaleString()} views</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={500000}
                  step={5000}
                  value={avgViews}
                  onChange={(e) => setAvgViews(Number(e.target.value))}
                  className="w-full accent-sand-300 h-2 bg-charcoal-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Niche Selector */}
              <div>
                <label className="block text-xs font-semibold text-sand-300 mb-2.5">Channel Niche</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {(Object.keys(CPM_RATES) as Niche[]).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNiche(n)}
                      className={`py-2 px-2.5 rounded-xl border text-left transition-all font-medium ${
                        niche === n
                          ? 'bg-sand-200 text-charcoal-950 border-sand-200 shadow-md font-semibold'
                          : 'bg-charcoal-850 text-sand-300 border-charcoal-800 hover:border-sand-400/30'
                      }`}
                    >
                      {CPM_RATES[n].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-semibold text-sand-300 mb-2.5">Deliverable Format</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormat('integration')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all font-medium ${
                      format === 'integration'
                        ? 'bg-sand-200 text-charcoal-950 border-sand-200 shadow-md font-semibold'
                        : 'bg-charcoal-850 text-sand-300 border-charcoal-800 hover:border-sand-400/30'
                    }`}
                  >
                    60s Integration
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('dedicated')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all font-medium ${
                      format === 'dedicated'
                        ? 'bg-sand-200 text-charcoal-950 border-sand-200 shadow-md font-semibold'
                        : 'bg-charcoal-850 text-sand-300 border-charcoal-800 hover:border-sand-400/30'
                    }`}
                  >
                    Dedicated Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('reel')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all font-medium ${
                      format === 'reel'
                        ? 'bg-sand-200 text-charcoal-950 border-sand-200 shadow-md font-semibold'
                        : 'bg-charcoal-850 text-sand-300 border-charcoal-800 hover:border-sand-400/30'
                    }`}
                  >
                    Instagram Reel
                  </button>
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <label className="block text-xs font-semibold text-sand-300 mb-2.5">Contract Riders</label>
                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWhitelisting}
                      onChange={(e) => setHasWhitelisting(e.target.checked)}
                      className="rounded accent-sand-300"
                    />
                    <span className="text-sand-200 font-medium">Paid Ad Rights / Whitelisting (+40%)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasExclusivity}
                      onChange={(e) => setHasExclusivity(e.target.checked)}
                      className="rounded accent-sand-300"
                    />
                    <span className="text-sand-200 font-medium">30-Day Category Exclusivity (+30%)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Calculated Quote Output (Sand Rim) */}
            <div className="bg-charcoal-950/90 rounded-2xl border border-charcoal-800 p-6 sm:p-7 shadow-xl flex flex-col justify-between h-full transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sand-400/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="text-[11px] font-semibold text-sand-400 uppercase tracking-widest block mb-1 font-mono">
                  Estimated Rate Card Quote
                </span>
                <div className="text-3xl sm:text-5xl font-bold text-sand-50 tracking-tight">
                  ${calculation.total.toLocaleString()}
                </div>
                <p className="text-[11px] text-sand-300/60 mt-1">
                  Suggested contract quote based on {CPM_RATES[niche].label} benchmark.
                </p>

                <div className="mt-6 space-y-2.5 text-xs border-t border-charcoal-800 pt-5 text-sand-300/80">
                  <div className="flex justify-between">
                    <span>Base Deliverable:</span>
                    <span className="font-mono font-medium text-sand-100">${calculation.baseRate.toLocaleString()}</span>
                  </div>
                  {hasWhitelisting && (
                    <div className="flex justify-between text-sand-300">
                      <span>Ad Whitelisting Rider:</span>
                      <span className="font-mono font-medium">+${calculation.whitelistingFee.toLocaleString()}</span>
                    </div>
                  )}
                  {hasExclusivity && (
                    <div className="flex justify-between text-sand-400">
                      <span>Exclusivity Lock Rider:</span>
                      <span className="font-mono font-medium">+${calculation.exclusivityFee.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => (onOpenAuth ? onOpenAuth() : onDemoLogin?.('aarav@tech.com'))}
                className="mt-8 w-full py-3 rounded-xl bg-sand-200 hover:bg-sand-100 text-charcoal-950 font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-[0_4px_16px_rgba(217,199,178,0.2)] active:scale-95"
              >
                <span>Save Rate Card in Workspace</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
