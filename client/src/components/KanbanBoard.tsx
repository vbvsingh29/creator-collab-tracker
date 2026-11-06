import React from 'react';
import { 
  Instagram, 
  Youtube, 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Calendar, 
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { Collab, PipelineStage, Currency } from '../types';
import { formatCurrency, getDeliverableLabel, getPaymentBadge, getStageConfig } from '../utils/formatters';

interface KanbanBoardProps {
  collabs: Collab[];
  currency: Currency;
  onSelectCollab: (collab: Collab) => void;
  onAdvanceStage: (id: string, currentStage: PipelineStage, direction: 'next' | 'prev') => void;
}

const STAGES: PipelineStage[] = [
  'pitch_inquiry',
  'negotiating',
  'script_approved',
  'content_production',
  'brand_review',
  'scheduled',
  'posted_live',
  'completed'
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  collabs,
  currency,
  onSelectCollab,
  onAdvanceStage
}) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-6 pt-1 min-h-[calc(100vh-280px)] select-none snap-x snap-mandatory scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0">
      {STAGES.map((stageKey) => {
        const stageConfig = getStageConfig(stageKey);
        const stageCollabs = collabs.filter((c) => c.pipeline_stage === stageKey);
        const stageTotal = stageCollabs.reduce((sum, c) => {
          if (c.commercial_type === 'barter') return sum;
          // approximate conversion or sum
          return sum + (c.currency === currency ? c.deal_amount : c.deal_amount);
        }, 0);

        const currentIndex = STAGES.indexOf(stageKey);

        return (
          <div
            key={stageKey}
            className="w-[85vw] sm:w-72 shrink-0 snap-center sm:snap-align-none flex flex-col bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden"
          >
            {/* Column Header */}
            <div className="px-3.5 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-200/50 dark:bg-zinc-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  stageKey === 'posted_live' || stageKey === 'completed'
                    ? 'bg-emerald-500'
                    : stageKey === 'brand_review'
                    ? 'bg-purple-500'
                    : 'bg-indigo-500'
                }`} />
                <h3 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                  {stageConfig.label}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {stageCollabs.length}
                </span>
              </div>
              {stageTotal > 0 && (
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  {formatCurrency(stageTotal, currency)}
                </span>
              )}
            </div>

            {/* Column Cards */}
            <div className="p-2.5 flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-340px)]">
              {stageCollabs.length === 0 ? (
                <div className="h-28 flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800/60 rounded-lg text-[11px] text-zinc-400 dark:text-zinc-600">
                  No deals in this stage
                </div>
              ) : (
                stageCollabs.map((collab) => {
                  const formatInfo = getDeliverableLabel(collab.deliverable_format);
                  const paymentBadge = getPaymentBadge(collab.payment_status);

                  return (
                    <div
                      key={collab.id}
                      onClick={() => onSelectCollab(collab)}
                      className="group bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700/90 rounded-lg p-3 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 relative"
                    >
                      {/* Top Row: Brand & Platform */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                          {collab.brand_name}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {collab.platform === 'youtube' && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                              <Youtube size={10} /> YT
                            </span>
                          )}
                          {collab.platform === 'instagram' && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                              <Instagram size={10} /> IG
                            </span>
                          )}
                          {collab.platform === 'both' && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              <Layers size={10} /> Cross
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 mb-2">
                        {collab.title}
                      </h4>

                      {/* Format Badge (e.g. Soft mention vs 30s integration vs Story) */}
                      <div className="mb-2.5">
                        <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border ${formatInfo.badgeColor}`}>
                          {formatInfo.label}
                        </span>
                      </div>

                      {/* Indicators: Whitelisting, Exclusivity */}
                      {(collab.has_ads_whitelisting || collab.has_category_exclusivity) && (
                        <div className="flex items-center gap-1.5 mb-2.5 text-[10px]">
                          {collab.has_ads_whitelisting && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                              <Zap size={10} /> Paid Ads
                            </span>
                          )}
                          {collab.has_category_exclusivity && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-medium">
                              <ShieldAlert size={10} /> Exclusive
                            </span>
                          )}
                        </div>
                      )}

                      {/* Live link if posted */}
                      {collab.live_post_url && (
                        <div className="mb-2 text-[10px] flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 truncate">
                          <ExternalLink size={10} />
                          <span className="truncate">Live: {collab.live_post_url.replace('https://', '')}</span>
                        </div>
                      )}

                      {/* Commercial & Payment Status Row */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <div>
                          {collab.commercial_type === 'barter' ? (
                            <div className="text-xs font-bold text-violet-400">
                              Barter ({formatCurrency(collab.barter_estimated_value, collab.currency)})
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-emerald-400">
                              {formatCurrency(collab.deal_amount, collab.currency)}
                            </div>
                          )}
                        </div>

                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${paymentBadge.color}`}>
                          {paymentBadge.label}
                        </span>
                      </div>

                      {/* Stage advancement arrow controls */}
                      <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                        <button
                          disabled={currentIndex === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdvanceStage(collab.id, stageKey, 'prev');
                          }}
                          className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors ${
                            currentIndex === 0 ? 'opacity-20 cursor-not-allowed' : ''
                          }`}
                          title="Move back"
                        >
                          <ChevronLeft size={13} />
                        </button>

                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          Step {stageConfig.step}/8
                        </span>

                        <button
                          disabled={currentIndex === STAGES.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdvanceStage(collab.id, stageKey, 'next');
                          }}
                          className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors ${
                            currentIndex === STAGES.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
                          }`}
                          title="Advance to next stage"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
