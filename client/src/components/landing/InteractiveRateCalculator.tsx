import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  ArrowRight
} from 'lucide-react';

interface InteractiveRateCalculatorProps {
  onDemoLogin: (email: string) => void;
}

type Niche = 'tech' | 'lifestyle' | 'gaming' | 'finance' | 'fitness';

const CPM_RATES: Record<Niche, { label: string; cpm: number }> = {
  tech: { label: 'Tech & Gadgets', cpm: 32 },
  finance: { label: 'Finance & Business', cpm: 45 },
  lifestyle: { label: 'Lifestyle & Fashion', cpm: 24 },
  gaming: { label: 'Gaming', cpm: 18 },
  fitness: { label: 'Fitness & Health', cpm: 22 },
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
    <section id="calculator" className="py-16 sm:py-20 border-b border-slate-200/80 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Commercial Benchmark
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            Sponsorship Rate Estimator
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Estimate market rates based on your verified audience views, rights usage, and exclusivity.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-5">
              {/* Average Views Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Average Views per Video</span>
                  <span className="font-mono text-sm text-slate-900">{avgViews.toLocaleString()} views</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={500000}
                  step={5000}
                  value={avgViews}
                  onChange={(e) => setAvgViews(Number(e.target.value))}
                  className="w-full accent-slate-900 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Niche Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Channel Niche</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {(Object.keys(CPM_RATES) as Niche[]).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNiche(n)}
                      className={`py-1.5 px-2 rounded-lg border text-left transition-colors font-medium ${
                        niche === n
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {CPM_RATES[n].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Deliverable Format</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormat('integration')}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors font-medium ${
                      format === 'integration'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    60s Integration
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('dedicated')}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors font-medium ${
                      format === 'dedicated'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Dedicated Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('reel')}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors font-medium ${
                      format === 'reel'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Instagram Reel
                  </button>
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Contract Riders</label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWhitelisting}
                      onChange={(e) => setHasWhitelisting(e.target.checked)}
                      className="rounded accent-slate-900"
                    />
                    <span className="text-slate-700 font-medium">Paid Ad Rights / Whitelisting (+40%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasExclusivity}
                      onChange={(e) => setHasExclusivity(e.target.checked)}
                      className="rounded accent-slate-900"
                    />
                    <span className="text-slate-700 font-medium">30-Day Category Exclusivity (+30%)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Calculated Quote Output */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between h-full">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Estimated Rate Card Quote
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  ${calculation.total.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Suggested contract quote based on {CPM_RATES[niche].label} benchmark.
                </p>

                <div className="mt-5 space-y-2 text-xs border-t border-slate-100 pt-4 text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Deliverable:</span>
                    <span className="font-mono font-medium text-slate-900">${calculation.baseRate.toLocaleString()}</span>
                  </div>
                  {hasWhitelisting && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Ad Whitelisting Rider:</span>
                      <span className="font-mono font-medium">+${calculation.whitelistingFee.toLocaleString()}</span>
                    </div>
                  )}
                  {hasExclusivity && (
                    <div className="flex justify-between text-amber-700">
                      <span>Exclusivity Lock Rider:</span>
                      <span className="font-mono font-medium">+${calculation.exclusivityFee.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDemoLogin('aarav@tech.com')}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Save Rate Card in Workspace</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
