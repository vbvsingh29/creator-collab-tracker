import React, { useState } from 'react';
import { 
  Youtube, 
  Instagram, 
  ShieldAlert, 
  FileText, 
  Bot, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Zap,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface InteractiveLivePreviewProps {
  onDemoLogin: (email: string) => void;
}

export const InteractiveLivePreview: React.FC<InteractiveLivePreviewProps> = ({ onDemoLogin }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'radar' | 'exclusivity'>('pipeline');

  return (
    <section id="live-preview" className="py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Live Software Snapshot
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-2 tracking-tight">
            See the command center in action.
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Interactive view of your deals, payment schedules, and conflict detections. Switch views below or jump directly into the live workspace.
          </p>

          {/* View Mode Switcher */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              📋 Deals Pipeline (4)
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'radar'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              📊 Financial Radar
            </button>
            <button
              onClick={() => setActiveTab('exclusivity')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'exclusivity'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              🛡️ Exclusivity Radar (1 Warning)
            </button>
          </div>
        </div>

        {/* Live Window Container */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xl overflow-hidden">
          {/* Mock Window Top Bar */}
          <div className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-zinc-400 ml-2 font-mono text-[11px]">app.collabflow.io/aaravtech</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                ● Live Database
              </span>
              <button
                onClick={() => onDemoLogin('aarav@tech.com')}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Launch Full Screen</span>
                <ExternalLink size={11} />
              </button>
            </div>
          </div>

          {/* Window Body */}
          <div className="p-5 sm:p-7 min-h-[380px]">
            {activeTab === 'pipeline' && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* Collab Row 1: Sony Alpha */}
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <Youtube size={20} className="text-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Sony Alpha 7 IV Review</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          In Progress
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Deliverable: Dedicated YouTube Video • Whitelisted for 30 days
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-200 dark:border-zinc-800">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">$4,500</div>
                      <div className="text-[10px] text-amber-500 font-medium flex items-center gap-1 justify-end">
                        <Clock size={10} /> Due in 4 days
                      </div>
                    </div>
                    <button
                      onClick={() => onDemoLogin('aarav@tech.com')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
                    >
                      Generate Invoice
                    </button>
                  </div>
                </div>

                {/* Collab Row 2: NordVPN Integration */}
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <Youtube size={20} className="text-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">NordVPN Cyber Security Integration</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Paid ($2,800)
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Deliverable: 60s Integrated Mid-Roll • Tracked Affiliate Link
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-200 dark:border-zinc-800">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">$2,800</div>
                      <div className="text-[10px] text-zinc-400 font-medium">Wire Transfer Settled</div>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      ✓ Completed
                    </span>
                  </div>
                </div>

                {/* Collab Row 3: Gymshark Apparel */}
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                      <Instagram size={20} className="text-pink-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Gymshark Autumn Drop Reel</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          Negotiation
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Deliverable: 2x 30s Instagram Reels + Story Set
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-200 dark:border-zinc-800">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">$3,200</div>
                      <div className="text-[10px] text-purple-500 font-medium">Counter-Offer Sent</div>
                    </div>
                    <button
                      onClick={() => onDemoLogin('aarav@tech.com')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                    >
                      <Bot size={12} />
                      <span>AI Pitch</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'radar' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-xs font-semibold text-zinc-500">Total Active Pipeline</div>
                    <div className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">$10,500</div>
                    <div className="text-xs text-indigo-500 mt-1">3 active brand contracts</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-xs font-semibold text-zinc-500">Collected This Month</div>
                    <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">$2,800</div>
                    <div className="text-xs text-emerald-500 mt-1">100% on-time clearance</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-xs font-semibold text-zinc-500">Average Deliverable CPM</div>
                    <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">$28.40</div>
                    <div className="text-xs text-purple-500 mt-1">+14% above category average</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-500" />
                    <span>Real-time financial isolation: Only your private revenue metrics are stored in your session.</span>
                  </div>
                  <button
                    onClick={() => onDemoLogin('aarav@tech.com')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline shrink-0 ml-2"
                  >
                    Open Live Radar →
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'exclusivity' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
                  <ShieldAlert size={24} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>Exclusivity Conflict Detected: VPN Category Lock</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        High Risk
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                      You have an active contract with <strong>NordVPN</strong> (Category: Cyber Security & VPN) with a 30-day post-publication exclusivity clause ending on <strong>Nov 24, 2026</strong>.
                      An incoming proposal from <strong>ExpressVPN</strong> scheduled for Nov 18 will breach this clause and trigger a clawback penalty.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Recommended Fix: Reschedule ExpressVPN live date to Nov 26 onwards.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    The radar scans every contract date and competitive sector automatically before you accept any sponsor brief.
                  </span>
                  <button
                    onClick={() => onDemoLogin('aarav@tech.com')}
                    className="font-bold text-indigo-600 dark:text-indigo-400 underline shrink-0 ml-2"
                  >
                    Test Conflict Scanner →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Footer CTA Bar */}
          <div className="px-6 py-4 bg-zinc-100/80 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-zinc-500 font-medium text-center sm:text-left">
              Want to test creating deals, editing invoices, or running AI pitches?
            </span>
            <button
              onClick={() => onDemoLogin('aarav@tech.com')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Zap size={13} className="text-amber-300 fill-amber-300" />
              <span>Launch Full Interactive Sandbox (1-Click)</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
