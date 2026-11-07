import React, { useState, useMemo } from 'react';
import { 
  Instagram, 
  Youtube, 
  Layers, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Trash2,
  FileText,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Collab, Currency } from '../types';
import { formatCurrency, convertAmount, getDeliverableLabel, getPaymentBadge, getStageConfig } from '../utils/formatters';

interface TableViewProps {
  collabs: Collab[];
  currency: Currency;
  onSelectCollab: (collab: Collab) => void;
  onQuickMarkPaid: (id: string, e: React.MouseEvent) => void;
  onDeleteCollab: (id: string, e: React.MouseEvent) => void;
  onOpenInvoice?: (collab: Collab) => void;
  onOpenPitch?: (collab: Collab) => void;
}

type SortField = 'brand' | 'amount' | 'date' | 'stage';
type SortDirection = 'asc' | 'desc';

export const TableView: React.FC<TableViewProps> = ({
  collabs,
  currency,
  onSelectCollab,
  onQuickMarkPaid,
  onDeleteCollab,
  onOpenInvoice,
  onOpenPitch
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedCollabs = useMemo(() => {
    const list = [...collabs];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'brand':
          comparison = a.brand_name.localeCompare(b.brand_name);
          break;
        case 'amount':
          const amountA = a.commercial_type === 'barter' ? a.barter_estimated_value : a.deal_amount;
          const amountB = b.commercial_type === 'barter' ? b.barter_estimated_value : b.deal_amount;
          comparison = amountA - amountB;
          break;
        case 'date':
          const dateA = a.scheduled_post_date || a.payment_due_date || '';
          const dateB = b.scheduled_post_date || b.payment_due_date || '';
          comparison = dateA.localeCompare(dateB);
          break;
        case 'stage':
          const stageOrder = ['pitching', 'brief_received', 'script_submitted', 'brand_review', 'revisions', 'approved', 'posted_live', 'completed'];
          comparison = stageOrder.indexOf(a.pipeline_stage) - stageOrder.indexOf(b.pipeline_stage);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [collabs, sortField, sortDirection]);

  return (
    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Header */}
          <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[10px] font-semibold">
            <tr>
              <th className="py-3 px-4">Platform & Title</th>
              
              {/* Brand Header with Sort */}
              <th 
                className="py-3 px-4 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 select-none"
                onClick={() => handleSort('brand')}
              >
                <div className="flex items-center gap-1">
                  <span>Brand / Category</span>
                  {sortField === 'brand' ? (
                    sortDirection === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                  ) : (
                    <ArrowUpDown size={11} className="opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-3 px-4">Deliverable Format</th>

              {/* Deal Value Header with Sort */}
              <th 
                className="py-3 px-4 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 select-none"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  <span>Commercial & CPM</span>
                  {sortField === 'amount' ? (
                    sortDirection === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                  ) : (
                    <ArrowUpDown size={11} className="opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-3 px-4">Payment Terms & Status</th>
              <th className="py-3 px-4">Ad Whitelisting</th>

              {/* Date Header with Sort */}
              <th 
                className="py-3 px-4 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 select-none"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Live / Sched Date</span>
                  {sortField === 'date' ? (
                    sortDirection === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                  ) : (
                    <ArrowUpDown size={11} className="opacity-40" />
                  )}
                </div>
              </th>

              {/* Stage Header with Sort */}
              <th 
                className="py-3 px-4 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 select-none"
                onClick={() => handleSort('stage')}
              >
                <div className="flex items-center gap-1">
                  <span>Pipeline Stage</span>
                  {sortField === 'stage' ? (
                    sortDirection === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                  ) : (
                    <ArrowUpDown size={11} className="opacity-40" />
                  )}
                </div>
              </th>

              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Rows */}
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
            {sortedCollabs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-zinc-500 text-xs">
                  No collaborations found matching the filters.
                </td>
              </tr>
            ) : (
              sortedCollabs.map((collab) => {
                const formatInfo = getDeliverableLabel(collab.deliverable_format);
                const paymentBadge = getPaymentBadge(collab.payment_status);
                const stageConfig = getStageConfig(collab.pipeline_stage);

                // Estimated CPM economics
                const views = collab.views_count && collab.views_count > 0 ? collab.views_count : 45000;
                const cpm = Math.round((collab.deal_amount / views) * 1000);

                return (
                  <tr
                    key={collab.id}
                    onClick={() => onSelectCollab(collab)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-850/60 transition-colors cursor-pointer group"
                  >
                    {/* Platform & Title */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        {collab.platform === 'youtube' && (
                          <div className="p-1 rounded bg-red-500/10 text-red-500 dark:text-red-400 shrink-0">
                            <Youtube size={14} />
                          </div>
                        )}
                        {collab.platform === 'instagram' && (
                          <div className="p-1 rounded bg-pink-500/10 text-pink-500 dark:text-pink-400 shrink-0">
                            <Instagram size={14} />
                          </div>
                        )}
                        {collab.platform === 'both' && (
                          <div className="p-1 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shrink-0">
                            <Layers size={14} />
                          </div>
                        )}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                          {collab.title}
                        </span>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-200">{collab.brand_name}</div>
                      <div className="text-[10px] text-zinc-500">{collab.brand_category}</div>
                    </td>

                    {/* Deliverable Format */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border ${formatInfo.badgeColor}`}>
                        {formatInfo.label}
                      </span>
                    </td>

                    {/* Commercial & CPM */}
                    <td className="py-3 px-4">
                      {collab.commercial_type === 'barter' ? (
                        <div>
                          <span className="font-bold text-violet-500 dark:text-violet-400">Barter</span>
                          <div className="text-[10px] text-zinc-500">
                            Value: {formatCurrency(collab.barter_estimated_value, collab.currency)}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <div className="flex flex-col">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(collab.deal_amount, currency, collab.currency)}
                              </span>
                              {collab.currency !== currency && (
                                <span className="text-[9px] text-slate-400 font-normal">
                                  orig. {formatCurrency(collab.deal_amount, collab.currency)}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono px-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                              CPM ~{formatCurrency(cpm, collab.currency)}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 capitalize">
                            {collab.commercial_type}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Payment Terms & Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded border font-medium ${paymentBadge.color}`}>
                          {paymentBadge.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          Terms: {collab.payment_terms.replace(/_/g, ' ')}
                        </span>
                        {collab.payment_due_date && (
                          <span className="text-[9px] text-zinc-500">
                            Due: {collab.payment_due_date}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Ad Whitelisting */}
                    <td className="py-3 px-4">
                      {collab.has_ads_whitelisting ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-medium">
                          <Zap size={10} /> {collab.whitelisting_duration_days || 30} Days
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-600">None</span>
                      )}
                    </td>

                    {/* Live / Date */}
                    <td className="py-3 px-4">
                      {collab.live_post_url ? (
                        <a
                          href={collab.live_post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <ExternalLink size={12} /> View Post
                        </a>
                      ) : collab.scheduled_post_date ? (
                        <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                          {collab.scheduled_post_date}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-600">TBD</span>
                      )}
                    </td>

                    {/* Stage */}
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        {stageConfig.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {onOpenInvoice && (
                          <button
                            onClick={() => onOpenInvoice(collab)}
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                            title="1-Click Printable Invoice"
                          >
                            <FileText size={13} />
                          </button>
                        )}
                        {onOpenPitch && (
                          <button
                            onClick={() => onOpenPitch(collab)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 transition-colors"
                            title="AI Pitch & Follow-up Generator"
                          >
                            <Sparkles size={13} className="text-amber-500" />
                          </button>
                        )}
                        {collab.payment_status !== 'paid' && collab.commercial_type !== 'barter' && (
                          <button
                            onClick={(e) => onQuickMarkPaid(collab.id, e)}
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500/20 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={(e) => onDeleteCollab(collab.id, e)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500/20 text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          title="Delete Collaboration"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
