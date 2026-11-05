import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Youtube, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Plus,
  ChevronRight,
  LayoutGrid,
  TableProperties
} from 'lucide-react';
import { Collab, Currency } from '../types';
import { formatCurrency, getDeliverableLabel, getPaymentBadge, getStageConfig } from '../utils/formatters';

interface SimpleViewProps {
  collabs: Collab[];
  currency: Currency;
  layout?: 'cards' | 'table';
  setLayout?: (layout: 'cards' | 'table') => void;
  onSelectCollab: (collab: Collab) => void;
  onQuickMarkPaid: (id: string, e: React.MouseEvent) => void;
  onOpenNewCollab?: () => void;
}

export const SimpleView: React.FC<SimpleViewProps> = ({
  collabs,
  currency,
  layout = 'cards',
  setLayout,
  onSelectCollab,
  onQuickMarkPaid,
  onOpenNewCollab
}) => {
  const [currentLayout, setCurrentLayout] = useState<'cards' | 'table'>(layout);

  useEffect(() => {
    if (layout) {
      setCurrentLayout(layout);
    }
  }, [layout]);

  const handleSwitchLayout = (newLayout: 'cards' | 'table') => {
    setCurrentLayout(newLayout);
    if (setLayout) {
      setLayout(newLayout);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Sub-bar: Layout Switcher (Cards vs Simple Table) */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-zinc-400">
          Showing <span className="text-zinc-200">{collabs.length}</span> {collabs.length === 1 ? 'deal' : 'deals'}
        </span>

        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => handleSwitchLayout('cards')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              currentLayout === 'cards'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutGrid size={13} />
            Cards
          </button>
          <button
            onClick={() => handleSwitchLayout('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              currentLayout === 'table'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TableProperties size={13} />
            Simple Table
          </button>
        </div>
      </div>

      {collabs.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl">
          <p className="text-zinc-400 text-sm font-medium">No collaborations found.</p>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto">
            Track your Instagram and YouTube brand deals, barter gifts, and payment terms in one place.
          </p>
          {onOpenNewCollab && (
            <button
              onClick={onOpenNewCollab}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus size={14} /> Add Collaboration
            </button>
          )}
        </div>
      ) : currentLayout === 'table' ? (
        /* Simple Clean Table View */
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Campaign Title</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Deliverable Format</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Content</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {collabs.map((collab) => {
                  const formatInfo = getDeliverableLabel(collab.deliverable_format);
                  const paymentBadge = getPaymentBadge(collab.payment_status);
                  const stageConfig = getStageConfig(collab.pipeline_stage);
                  const isPaid = collab.payment_status === 'paid';

                  return (
                    <tr
                      key={collab.id}
                      onClick={() => onSelectCollab(collab)}
                      className="hover:bg-zinc-850/60 cursor-pointer transition-colors group"
                    >
                      {/* Brand */}
                      <td className="py-3 px-4 font-bold text-indigo-400 group-hover:text-indigo-300">
                        {collab.brand_name}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 font-medium text-zinc-100 max-w-[220px] truncate">
                        {collab.title}
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4">
                        {collab.platform === 'youtube' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                            <Youtube size={11} /> YouTube
                          </span>
                        )}
                        {collab.platform === 'instagram' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                            <Instagram size={11} /> Instagram
                          </span>
                        )}
                        {collab.platform === 'both' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            <Layers size={11} /> Both
                          </span>
                        )}
                      </td>

                      {/* Deliverable Format */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px]">
                          {formatInfo.label}
                        </span>
                      </td>

                      {/* Pipeline Stage */}
                      <td className="py-3 px-4 text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 text-[10px]">
                          {stageConfig.label}
                        </span>
                      </td>

                      {/* Deal Value */}
                      <td className="py-3 px-4 font-extrabold text-emerald-400">
                        {collab.commercial_type === 'barter' ? (
                          <span className="text-violet-400 font-bold">Barter</span>
                        ) : (
                          formatCurrency(collab.deal_amount, collab.currency)
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${paymentBadge.color}`}>
                          {paymentBadge.label}
                        </span>
                      </td>

                      {/* Live Content Link */}
                      <td className="py-3 px-4">
                        {collab.live_post_url ? (
                          <a
                            href={collab.live_post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                          >
                            <ExternalLink size={11} /> View Post
                          </a>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {!isPaid && collab.commercial_type !== 'barter' ? (
                          <button
                            onClick={(e) => onQuickMarkPaid(collab.id, e)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 text-[11px] font-medium transition-colors"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-zinc-500 text-[11px] group-hover:text-zinc-300">
                            Details →
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Simple Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {collabs.map((collab) => {
            const formatInfo = getDeliverableLabel(collab.deliverable_format);
            const paymentBadge = getPaymentBadge(collab.payment_status);
            const stageConfig = getStageConfig(collab.pipeline_stage);
            const isPaid = collab.payment_status === 'paid';

            return (
              <div
                key={collab.id}
                onClick={() => onSelectCollab(collab)}
                className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Brand, Platform & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-indigo-400">
                      {collab.brand_name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {collab.platform === 'youtube' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          <Youtube size={11} /> YouTube
                        </span>
                      )}
                      {collab.platform === 'instagram' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                          <Instagram size={11} /> Instagram
                        </span>
                      )}
                      {collab.platform === 'both' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <Layers size={11} /> Cross-Platform
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Deal Title */}
                  <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
                    {collab.title}
                  </h3>

                  {/* Format & Stage Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {formatInfo.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                      {stageConfig.label}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Amount & Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    {collab.commercial_type === 'barter' ? (
                      <span className="text-sm font-bold text-violet-400">
                        Barter Gift
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-extrabold text-emerald-400">
                          {formatCurrency(collab.deal_amount, collab.currency)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${paymentBadge.color}`}>
                      {paymentBadge.label}
                    </span>

                    {!isPaid && collab.commercial_type !== 'barter' && (
                      <button
                        onClick={(e) => onQuickMarkPaid(collab.id, e)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 text-[11px] font-medium transition-colors"
                        title="Mark as Paid"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Post Link & Views if available */}
                {collab.live_post_url && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px]">
                    <a
                      href={collab.live_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[10px] truncate max-w-[180px]"
                    >
                      <ExternalLink size={10} /> View Content
                    </a>

                    {collab.views_count ? (
                      <span className="text-zinc-400 font-medium">
                        {collab.views_count.toLocaleString()} Views
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
