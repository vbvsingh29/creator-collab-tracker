import React from 'react';
import { 
  Instagram, 
  Youtube, 
  Layers, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { Collab, Currency } from '../types';
import { formatCurrency, getDeliverableLabel, getPaymentBadge, getStageConfig } from '../utils/formatters';

interface TableViewProps {
  collabs: Collab[];
  currency: Currency;
  onSelectCollab: (collab: Collab) => void;
  onQuickMarkPaid: (id: string, e: React.MouseEvent) => void;
  onDeleteCollab: (id: string, e: React.MouseEvent) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  collabs,
  currency,
  onSelectCollab,
  onQuickMarkPaid,
  onDeleteCollab
}) => {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Header */}
          <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px] font-semibold">
            <tr>
              <th className="py-3 px-4">Platform & Title</th>
              <th className="py-3 px-4">Brand / Category</th>
              <th className="py-3 px-4">Deliverable Format</th>
              <th className="py-3 px-4">Commercial</th>
              <th className="py-3 px-4">Payment Terms & Status</th>
              <th className="py-3 px-4">Ad Whitelisting</th>
              <th className="py-3 px-4">Live / Date</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Rows */}
          <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
            {collabs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-zinc-500 text-xs">
                  No collaborations found matching the filters.
                </td>
              </tr>
            ) : (
              collabs.map((collab) => {
                const formatInfo = getDeliverableLabel(collab.deliverable_format);
                const paymentBadge = getPaymentBadge(collab.payment_status);
                const stageConfig = getStageConfig(collab.pipeline_stage);

                return (
                  <tr
                    key={collab.id}
                    onClick={() => onSelectCollab(collab)}
                    className="hover:bg-zinc-850/60 transition-colors cursor-pointer group"
                  >
                    {/* Platform & Title */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        {collab.platform === 'youtube' && (
                          <div className="p-1 rounded bg-red-500/10 text-red-400 shrink-0">
                            <Youtube size={14} />
                          </div>
                        )}
                        {collab.platform === 'instagram' && (
                          <div className="p-1 rounded bg-pink-500/10 text-pink-400 shrink-0">
                            <Instagram size={14} />
                          </div>
                        )}
                        {collab.platform === 'both' && (
                          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0">
                            <Layers size={14} />
                          </div>
                        )}
                        <span className="font-medium text-zinc-100 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                          {collab.title}
                        </span>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-200">{collab.brand_name}</div>
                      <div className="text-[10px] text-zinc-500">{collab.brand_category}</div>
                    </td>

                    {/* Deliverable Format */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border ${formatInfo.badgeColor}`}>
                        {formatInfo.label}
                      </span>
                    </td>

                    {/* Commercial */}
                    <td className="py-3 px-4">
                      {collab.commercial_type === 'barter' ? (
                        <div>
                          <span className="font-bold text-violet-400">Barter</span>
                          <div className="text-[10px] text-zinc-500">
                            Value: {formatCurrency(collab.barter_estimated_value, collab.currency)}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-emerald-400">
                            {formatCurrency(collab.deal_amount, collab.currency)}
                          </span>
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
                        <span className="text-[10px] text-zinc-400">
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
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                          <Zap size={10} /> {collab.whitelisting_duration_days || 30} Days
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-600">None</span>
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
                          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                        >
                          <ExternalLink size={12} /> View Post
                        </a>
                      ) : collab.scheduled_post_date ? (
                        <span className="text-[11px] text-zinc-400">
                          Sched: {collab.scheduled_post_date}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-600">TBD</span>
                      )}
                    </td>

                    {/* Stage */}
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium text-zinc-300">
                        {stageConfig.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {collab.payment_status !== 'paid' && collab.commercial_type !== 'barter' && (
                          <button
                            onClick={(e) => onQuickMarkPaid(collab.id, e)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={(e) => onDeleteCollab(collab.id, e)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
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
