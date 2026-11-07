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
  ChevronDown,
  LayoutGrid,
  TableProperties,
  ListFilter,
  Sparkles,
  FileText,
  Copy,
  Check,
  Zap,
  ShieldAlert,
  Calendar,
  Tag
} from 'lucide-react';
import { Collab, Currency } from '../types';
import { formatCurrency, convertAmount, getDeliverableLabel, getPaymentBadge, getStageConfig } from '../utils/formatters';

interface SimpleViewProps {
  collabs: Collab[];
  currency: Currency;
  layout?: 'cards' | 'detailed' | 'table';
  setLayout?: (layout: 'cards' | 'detailed' | 'table') => void;
  onSelectCollab: (collab: Collab) => void;
  onQuickMarkPaid: (id: string, e: React.MouseEvent) => void;
  onOpenNewCollab?: () => void;
  onOpenInvoice?: (collab: Collab) => void;
  onOpenPitch?: (collab: Collab) => void;
}

export const SimpleView: React.FC<SimpleViewProps> = ({
  collabs,
  currency,
  layout = 'cards',
  setLayout,
  onSelectCollab,
  onQuickMarkPaid,
  onOpenNewCollab,
  onOpenInvoice,
  onOpenPitch
}) => {
  const [currentLayout, setCurrentLayout] = useState<'cards' | 'detailed' | 'table'>(layout);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  useEffect(() => {
    if (layout) {
      setCurrentLayout(layout);
    }
  }, [layout]);

  const handleSwitchLayout = (newLayout: 'cards' | 'detailed' | 'table') => {
    setCurrentLayout(newLayout);
    if (setLayout) {
      setLayout(newLayout);
    }
  };

  const toggleCardExpansion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyPromo = (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="space-y-3.5">
      {/* Sub-bar: Layout Switcher (Clean Cards vs Detailed Cards vs Simple Table) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Showing <span className="text-zinc-900 dark:text-zinc-200 font-bold">{collabs.length}</span> {collabs.length === 1 ? 'deal' : 'deals'}
          </span>
          <span className="text-[11px] text-zinc-400 hidden md:inline">
            • {currentLayout === 'cards' ? 'Essential Starter View' : currentLayout === 'detailed' ? 'Full Details Starter Cards' : 'Clean Data Table'}
          </span>
        </div>

        {/* View density / layout controls */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => handleSwitchLayout('cards')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md transition-all ${
              currentLayout === 'cards'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Clean cards with essential deal info"
          >
            <LayoutGrid size={13} />
            <span>Cards</span>
          </button>

          <button
            onClick={() => handleSwitchLayout('detailed')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md transition-all ${
              currentLayout === 'detailed'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Detailed cards with checklists, due dates, promo codes and quick actions"
          >
            <ListFilter size={13} />
            <span>Detailed Cards</span>
          </button>

          <button
            onClick={() => handleSwitchLayout('table')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md transition-all ${
              currentLayout === 'table'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Clean responsive table"
          >
            <TableProperties size={13} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {collabs.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">No collaborations found.</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs max-w-sm mx-auto">
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
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[10px] font-semibold">
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
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                {collabs.map((collab) => {
                  const formatInfo = getDeliverableLabel(collab.deliverable_format);
                  const paymentBadge = getPaymentBadge(collab.payment_status);
                  const stageConfig = getStageConfig(collab.pipeline_stage);
                  const isPaid = collab.payment_status === 'paid';

                  return (
                    <tr
                      key={collab.id}
                      onClick={() => onSelectCollab(collab)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-850/60 cursor-pointer transition-colors group"
                    >
                      {/* Brand */}
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                        {collab.brand_name}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100 max-w-[220px] truncate">
                        {collab.title}
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4">
                        {collab.platform === 'youtube' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
                            <Youtube size={11} /> YouTube
                          </span>
                        )}
                        {collab.platform === 'instagram' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-500/20">
                            <Instagram size={11} /> Instagram
                          </span>
                        )}
                        {collab.platform === 'both' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/20">
                            <Layers size={11} /> Both
                          </span>
                        )}
                      </td>

                      {/* Deliverable Format */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[11px]">
                          {formatInfo.label}
                        </span>
                      </td>

                      {/* Pipeline Stage */}
                      <td className="py-3 px-4 text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 text-[10px]">
                          {stageConfig.label}
                        </span>
                      </td>

                      {/* Deal Value */}
                      <td className="py-3 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                        {collab.commercial_type === 'barter' ? (
                          <span className="text-violet-500 dark:text-violet-400 font-bold">Barter</span>
                        ) : (
                          formatCurrency(collab.deal_amount, currency, collab.currency)
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
                            className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                          >
                            <ExternalLink size={11} /> View Post
                          </a>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {onOpenInvoice && (
                            <button
                              onClick={() => onOpenInvoice(collab)}
                              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-500 transition-colors"
                              title="Print Brand Invoice"
                            >
                              <FileText size={13} />
                            </button>
                          )}
                          {!isPaid && collab.commercial_type !== 'barter' ? (
                            <button
                              onClick={(e) => onQuickMarkPaid(collab.id, e)}
                              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500/20 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-medium transition-colors"
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-500 text-[11px] group-hover:text-zinc-300">
                              Details →
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid (Simple Cards OR Detailed Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {collabs.map((collab) => {
            const formatInfo = getDeliverableLabel(collab.deliverable_format);
            const paymentBadge = getPaymentBadge(collab.payment_status);
            const stageConfig = getStageConfig(collab.pipeline_stage);
            const isPaid = collab.payment_status === 'paid';
            const isExpanded = expandedCards[collab.id] || currentLayout === 'detailed';

            // Deliverables checklist stats
            const totalTasks = collab.deliverables_checklist?.length || 0;
            const completedTasks = collab.deliverables_checklist?.filter(t => t.completed).length || 0;
            const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div
                key={collab.id}
                onClick={() => onSelectCollab(collab)}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Brand, Platform & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {collab.brand_name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {collab.platform === 'youtube' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
                          <Youtube size={11} /> YouTube
                        </span>
                      )}
                      {collab.platform === 'instagram' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-500/20">
                          <Instagram size={11} /> Instagram
                        </span>
                      )}
                      {collab.platform === 'both' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/20">
                          <Layers size={11} /> Cross-Platform
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Deal Title */}
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
                    {collab.title}
                  </h3>

                  {/* Format & Stage Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {formatInfo.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                      {stageConfig.label}
                    </span>
                    {collab.has_ads_whitelisting && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-0.5">
                        <Zap size={10} /> Paid Ads
                      </span>
                    )}
                    {collab.has_category_exclusivity && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                        <ShieldAlert size={10} /> Exclusive
                      </span>
                    )}
                  </div>

                  {/* Deliverables Checklist Progress (Visible in Detailed mode or when expanded) */}
                  {totalTasks > 0 && (
                    <div className="mb-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        <span>Checklist: {completedTasks}/{totalTasks} complete</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Detailed Section (Shown when detailed layout is active or card is expanded) */}
                  {isExpanded && (
                    <div className="mb-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 text-xs">
                      {/* Dates: Scheduled & Due */}
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {collab.scheduled_post_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-zinc-400" />
                            Post: <strong className="text-zinc-800 dark:text-zinc-200">{collab.scheduled_post_date}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-zinc-400" />
                          Terms: <strong className="text-zinc-800 dark:text-zinc-200">{collab.payment_terms.replace(/_/g, ' ')}</strong>
                        </span>
                      </div>

                      {/* Promo Code with 1-click copy */}
                      {collab.promo_code && (
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                            <Tag size={11} /> {collab.promo_code}
                          </span>
                          <button
                            onClick={(e) => handleCopyPromo(collab.promo_code!, collab.id, e)}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            title="Copy promo code"
                          >
                            {copiedCodeId === collab.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </div>
                      )}

                      {/* Quick Action Tools: Invoice & AI Pitch */}
                      <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                        {onOpenInvoice && (
                          <button
                            onClick={() => onOpenInvoice(collab)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors"
                            title="1-Click Printable Invoice"
                          >
                            <FileText size={11} /> Invoice
                          </button>
                        )}
                        {onOpenPitch && (
                          <button
                            onClick={() => onOpenPitch(collab)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium transition-colors"
                            title="AI Pitch & Follow-up Notice"
                          >
                            <Sparkles size={11} className="text-amber-500" /> AI Pitch
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Amount & Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div>
                    {collab.commercial_type === 'barter' ? (
                      <span className="text-sm font-bold text-violet-500 dark:text-violet-400">
                        Barter Gift
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <div className="flex flex-col">
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(collab.deal_amount, currency, collab.currency)}
                          </span>
                          {collab.currency !== currency && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              orig. {formatCurrency(collab.deal_amount, collab.currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle details accordion on simple card */}
                    {currentLayout === 'cards' && (
                      <button
                        onClick={(e) => toggleCardExpansion(collab.id, e)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-0.5 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title={isExpanded ? 'Collapse card details' : 'Expand card details'}
                      >
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                    )}

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${paymentBadge.color}`}>
                      {paymentBadge.label}
                    </span>

                    {!isPaid && collab.commercial_type !== 'barter' && (
                      <button
                        onClick={(e) => onQuickMarkPaid(collab.id, e)}
                        className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500/20 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-medium transition-colors"
                        title="Mark as Paid"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Post Link & Views if available */}
                {collab.live_post_url && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                    <a
                      href={collab.live_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[10px] truncate max-w-[180px]"
                    >
                      <ExternalLink size={10} /> View Content
                    </a>

                    {collab.views_count ? (
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">
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
