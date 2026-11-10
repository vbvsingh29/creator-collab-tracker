import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Instagram, 
  Youtube, 
  Layers, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Zap, 
  ShieldAlert, 
  Calendar, 
  DollarSign, 
  Mail, 
  Phone, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  Percent, 
  Clock, 
  Tag, 
  Copy, 
  Check, 
  ChevronRight,
  TrendingUp,
  FileText,
  Sparkles,
  Trash2,
  Archive,
  RotateCcw
} from 'lucide-react';
import { Collab, Currency, PipelineStage } from '../types';
import { formatCurrency, getDeliverableLabel, getPaymentBadge, getStageConfig } from '../utils/formatters';
import { syncCollabMetrics } from '../services/api';

interface CollabDrawerProps {
  collab: Collab | null;
  currency: Currency;
  appMode?: 'simple' | 'advanced';
  onClose: () => void;
  onUpdateCollab: (id: string, updated: Partial<Collab>) => void;
  onOpenProofCard: (collab: Collab) => void;
  onOpenFollowUp: (collab: Collab) => void;
  onMarkPaid: (collab: Collab) => void;
  onOpenInvoice?: (collab: Collab) => void;
  onOpenPitchGenerator?: (collab: Collab) => void;
  onDeleteCollab?: (id: string) => Promise<void> | void;
}

function decodeCleanText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x2019;/g, '’')
    .replace(/&#8217;/g, '’')
    .replace(/&#x2018;/g, '‘')
    .replace(/&#8216;/g, '‘')
    .replace(/&#x201c;/g, '“')
    .replace(/&#8220;/g, '“')
    .replace(/&#x201d;/g, '”')
    .replace(/&#8221;/g, '”')
    .replace(/&#x20b9;/g, '₹')
    .replace(/&#8377;/g, '₹')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

export const CollabDrawer: React.FC<CollabDrawerProps> = ({
  collab,
  currency,
  appMode = 'simple',
  onClose,
  onUpdateCollab,
  onOpenProofCard,
  onOpenFollowUp,
  onMarkPaid,
  onOpenInvoice,
  onOpenPitchGenerator,
  onDeleteCollab
}) => {
  const [drawerMode, setDrawerMode] = useState<'simple' | 'advanced'>(appMode);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'financials' | 'performance'>('overview');
  const [showDeepDetails, setShowDeepDetails] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [liveUrlInput, setLiveUrlInput] = useState(collab?.live_post_url || '');
  const [showEmbedPlayer, setShowEmbedPlayer] = useState(false);
  const [syncingMetrics, setSyncingMetrics] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingDeductions, setEditingDeductions] = useState(false);
  const [customTds, setCustomTds] = useState<number>(collab?.tds_percentage ?? 0);
  const [customAgency, setCustomAgency] = useState<number>(collab?.agency_cut_percentage ?? 0);
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [customViews, setCustomViews] = useState<number>(collab?.views_count ?? 0);
  const [customLikes, setCustomLikes] = useState<number>(collab?.likes_count ?? 0);
  const drawerDateInputRef = useRef<HTMLInputElement>(null);

  if (!collab) return null;

  // Extract content ID for live player embed
  const ytMatch = collab.live_post_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  const ytVideoId = ytMatch ? ytMatch[1] : null;

  const igMatch = collab.live_post_url?.match(/(?:instagram\.com\/(?:p|reel|tv)\/)([\w-]+)/);
  const igShortcode = igMatch ? igMatch[1] : null;

  const engagementRate = collab.views_count && collab.views_count > 0 && collab.likes_count 
    ? ((collab.likes_count / collab.views_count) * 100).toFixed(1)
    : null;

  const views = collab.views_count && collab.views_count > 0 ? collab.views_count : 0;
  const cpm = views > 0 ? Math.round((collab.deal_amount / views) * 1000) : 0;
  const cpv = views > 0 ? (collab.deal_amount / views).toFixed(2) : '0.00';

  const formatInfo = getDeliverableLabel(collab.deliverable_format);
  const paymentBadge = getPaymentBadge(collab.payment_status);
  const stageConfig = getStageConfig(collab.pipeline_stage);

  // Financial breakdown
  const amount = collab.deal_amount;
  const tdsPct = collab.tds_percentage ?? 0;
  const agencyPct = collab.agency_cut_percentage ?? 0;
  const tdsEstimate = amount * (tdsPct / 100);
  const agencyCommission = amount * (agencyPct / 100);
  const netTakeHome = Math.max(0, amount - tdsEstimate - agencyCommission);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleChecklist = (itemIndex: number) => {
    const updatedChecklist = [...collab.deliverables_checklist];
    updatedChecklist[itemIndex].completed = !updatedChecklist[itemIndex].completed;
    onUpdateCollab(collab.id, { deliverables_checklist: updatedChecklist });
  };

  const handleSaveLiveUrl = () => {
    if (liveUrlInput.trim()) {
      onUpdateCollab(collab.id, {
        live_post_url: liveUrlInput.trim(),
        actual_posted_date: collab.actual_posted_date || new Date().toISOString().split('T')[0],
        pipeline_stage: 'posted_live'
      });
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs mr-1">
              <button
                onClick={() => setDrawerMode('simple')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  drawerMode === 'simple'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setDrawerMode('advanced')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  drawerMode === 'advanced'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Advanced
              </button>
            </div>

            {collab.platform === 'youtube' && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                <Youtube size={12} /> YouTube
              </span>
            )}
            {collab.platform === 'instagram' && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Instagram size={12} /> Instagram
              </span>
            )}
            {collab.platform === 'both' && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Layers size={12} /> Cross-Platform
              </span>
            )}
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-xs text-zinc-400 font-medium">Stage: {stageConfig.label}</span>
            {collab.account_label && (
              <>
                <span className="text-zinc-500 text-xs">•</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {collab.account_label}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {drawerMode === 'advanced' && (
              <>
                {/* Quick Proof Card Button */}
                <button
                  onClick={() => onOpenProofCard(collab)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium transition-colors"
                  title="Generate 1-Click Client Proof Card"
                >
                  <Share2 size={12} className="text-emerald-400" />
                  Proof Card
                </button>

                {onOpenInvoice && (
                  <button
                    onClick={() => onOpenInvoice(collab)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium transition-colors"
                    title="Generate PDF Brand Invoice"
                  >
                    <FileText size={12} className="text-indigo-400" />
                    Invoice
                  </button>
                )}

                {onOpenPitchGenerator && (
                  <button
                    onClick={() => onOpenPitchGenerator(collab)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 font-medium transition-colors"
                    title="AI Sponsor Counter-Offer & Pitch Generator"
                  >
                    <Sparkles size={12} className="text-amber-400" />
                    AI Pitch
                  </button>
                )}

                {/* Follow-up button if overdue or invoiced */}
                {(collab.payment_status === 'overdue' || collab.payment_status === 'invoiced') && (
                  <button
                    onClick={() => onOpenFollowUp(collab)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-red-950/30 hover:bg-red-900/50 border border-red-500/40 text-red-300 font-medium transition-colors"
                    title="Debt Recovery Follow-up Notice"
                  >
                    <AlertTriangle size={12} className="text-red-400" />
                    Payment Notice
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Drawer Section Segmented Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setDrawerTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              drawerTab === 'overview'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <CheckSquare size={13} className={drawerTab === 'overview' ? 'text-indigo-400' : 'text-zinc-500'} />
            Overview & Deliverables
          </button>
          <button
            type="button"
            onClick={() => setDrawerTab('financials')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              drawerTab === 'financials'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <DollarSign size={13} className={drawerTab === 'financials' ? 'text-emerald-400' : 'text-zinc-500'} />
            Financials & Invoicing
          </button>
          <button
            type="button"
            onClick={() => setDrawerTab('performance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              drawerTab === 'performance'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <TrendingUp size={13} className={drawerTab === 'performance' ? 'text-pink-400' : 'text-zinc-500'} />
            Live Post & Performance
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Title & Brand Header */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              {collab.brand_name} • {collab.brand_category}
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
              {decodeCleanText(collab.title)}
            </h2>
          </div>

          {/* TAB 1: OVERVIEW & DELIVERABLES */}
          {drawerTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Pipeline Stage Selector */}
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Current Pipeline Stage
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded border ${stageConfig.color}`}>
                      {stageConfig.label}
                    </span>
                  </div>
                </div>
                <select
                  value={collab.pipeline_stage}
                  onChange={(e) => onUpdateCollab(collab.id, { pipeline_stage: e.target.value as PipelineStage })}
                  aria-label="Update Pipeline Stage"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="pitch_inquiry">Pitch / Inquiry</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="script_approved">Script Approved</option>
                  <option value="content_production">Content Production</option>
                  <option value="brand_review">Brand Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="posted_live">Posted Live</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed / Archived</option>
                </select>
              </div>

              {/* Deliverable Format & Depth Badge */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Deliverable Format & Depth
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded border ${formatInfo.badgeColor}`}>
                      {formatInfo.label}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Tier: <span className="text-zinc-200 font-semibold">{formatInfo.depth} Impact</span>
                    </span>
                  </div>
                </div>

                {collab.has_ads_whitelisting ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Zap size={11} /> {collab.whitelisting_duration_days || 30}d Ad Whitelisting
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Meta/Google rights granted</p>
                  </div>
                ) : (
                  <div className="text-right text-[11px] text-zinc-500">
                    No Ad Whitelisting
                  </div>
                )}
              </div>

              {/* Interactive Deliverables Checklist */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-indigo-400" />
                  Contract Deliverables Checklist
                </h3>

                {collab.deliverables_checklist.length === 0 ? (
                  <p className="text-xs text-zinc-500">No checklist items defined.</p>
                ) : (
                  <div className="space-y-2">
                    {collab.deliverables_checklist.map((item, index) => (
                      <div
                        key={item.id || index}
                        onClick={() => handleToggleChecklist(index)}
                        className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-zinc-850 cursor-pointer transition-colors text-xs"
                      >
                        <button className="mt-0.5 text-indigo-400 hover:text-indigo-300">
                          {item.completed ? (
                            <CheckSquare size={15} className="text-emerald-400" />
                          ) : (
                            <Square size={15} className="text-zinc-600" />
                          )}
                        </button>
                        <span className={`${item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Brand Contact & Notes */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-2.5 text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Mail size={13} className="text-zinc-400" />
                  Brand Contact & Notes
                </h3>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>{collab.contact_person || 'PR Representative'}</span>
                  {collab.contact_email && (
                    <a
                      href={`mailto:${collab.contact_email}`}
                      className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Mail size={11} /> {collab.contact_email}
                    </a>
                  )}
                </div>
                {collab.notes && (
                  <p className="p-3 bg-zinc-950 rounded-lg text-zinc-400 text-xs leading-relaxed border border-zinc-800/80">
                    {collab.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS & INVOICING */}
          {drawerTab === 'financials' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Commercial & True Net Take-Home Card */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-0.5">
                      Deal Value ({collab.commercial_type.toUpperCase()})
                    </span>
                    <div className="text-xl font-extrabold text-white">
                      {collab.commercial_type === 'barter' ? (
                        <span className="text-violet-400">
                          Barter ({formatCurrency(collab.barter_estimated_value, collab.currency)})
                        </span>
                      ) : (
                        formatCurrency(collab.deal_amount, collab.currency)
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded border font-semibold ${paymentBadge.color}`}>
                      {paymentBadge.label}
                    </span>
                    {collab.payment_status !== 'paid' && collab.commercial_type !== 'barter' && (
                      <button
                        onClick={() => onMarkPaid(collab)}
                        className="block mt-1 text-[11px] font-medium text-emerald-400 hover:underline"
                      >
                        Mark Paid in Full →
                      </button>
                    )}
                  </div>
                </div>

                {/* True Take Home Split (TDS & Agency Fee) */}
                {collab.commercial_type !== 'barter' && collab.deal_amount > 0 && (
                  <div className="mt-3 pt-2 bg-zinc-950/60 rounded-lg p-3 border border-zinc-800/80">
                    <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1">
                        <Percent size={12} /> True Creator Take-Home Breakdown
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Net: {formatCurrency(netTakeHome, collab.currency)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingDeductions(!editingDeductions)}
                          className="text-[10px] text-zinc-400 hover:text-zinc-200 underline font-normal"
                        >
                          {editingDeductions ? 'Cancel' : 'Adjust %'}
                        </button>
                      </div>
                    </div>

                    {editingDeductions && (
                      <div className="p-2.5 mb-2.5 bg-zinc-900 rounded-lg border border-zinc-800 space-y-2 text-xs animate-in fade-in">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] text-zinc-400 font-semibold">TDS / Tax (%)</label>
                              <span className="text-[10px] text-zinc-500">Default: 0%</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={customTds === 0 ? '' : customTds}
                              placeholder="0"
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value.replace(/^0+(?=\d)/, '');
                                setCustomTds(val === '' ? 0 : Number(val));
                              }}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-100 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] text-zinc-400 font-semibold">Agency Cut (%)</label>
                              <span className="text-[10px] text-zinc-500">Default: 0%</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={customAgency === 0 ? '' : customAgency}
                              placeholder="0"
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value.replace(/^0+(?=\d)/, '');
                                setCustomAgency(val === '' ? 0 : Number(val));
                              }}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-100 font-mono text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateCollab(collab.id, {
                                tds_percentage: customTds,
                                agency_cut_percentage: customAgency
                              });
                              setEditingDeductions(false);
                            }}
                            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold"
                          >
                            Save Deductions
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Gross Deal</span>
                        <span className="font-medium text-zinc-200">{formatCurrency(amount, collab.currency)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">TDS / Tax ({tdsPct}%)</span>
                        <span className={`font-medium ${tdsEstimate > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                          {tdsEstimate > 0 ? `-${formatCurrency(tdsEstimate, collab.currency)}` : '₹0 (None)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Agency Cut ({agencyPct}%)</span>
                        <span className={`font-medium ${agencyCommission > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                          {agencyCommission > 0 ? `-${formatCurrency(agencyCommission, collab.currency)}` : '₹0 (None)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment terms row */}
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Payment Terms</span>
                    <span className="font-medium text-zinc-300">{collab.payment_terms.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Invoice #</span>
                    <span className="font-medium text-zinc-300">{collab.invoice_number || 'Not generated'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Due Date</span>
                    <span className={`font-medium ${paymentBadge.isOverdue ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                      {collab.payment_due_date || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoicing & Commercial Operations Quick Hub */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <FileText size={13} className="text-indigo-400" />
                  Commercial Operations & Invoicing
                </h3>
                <div className="flex flex-wrap gap-2">
                  {onOpenInvoice && (
                    <button
                      onClick={() => onOpenInvoice(collab)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                    >
                      <FileText size={13} />
                      Generate Brand Invoice PDF
                    </button>
                  )}

                  {onOpenProofCard && (
                    <button
                      onClick={() => onOpenProofCard(collab)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium transition-colors"
                    >
                      <Share2 size={13} className="text-emerald-400" />
                      Generate Proof Card
                    </button>
                  )}

                  {onOpenPitchGenerator && (
                    <button
                      onClick={() => onOpenPitchGenerator(collab)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 font-medium transition-colors"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      AI Pitch / Counter-Offer
                    </button>
                  )}

                  {(collab.payment_status === 'overdue' || collab.payment_status === 'invoiced') && onOpenFollowUp && (
                    <button
                      onClick={() => onOpenFollowUp(collab)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-medium transition-colors"
                    >
                      <AlertTriangle size={13} className="text-red-400" />
                      Payment Recovery Notice
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE POST & PERFORMANCE */}
          {drawerTab === 'performance' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Deliverable Integration Depth Badge / Unit Economics */}
              {collab.commercial_type !== 'barter' && (
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Unit Economics:</span>
                    <span className="font-mono text-zinc-300">
                      Est. CPM: <strong className="text-emerald-400 font-bold">{formatCurrency(cpm, currency)}</strong> / 1k views
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    CPV: {formatCurrency(Number(cpv), currency)}
                  </span>
                </div>
              )}

              {/* Live Post Verification & Performance */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <ExternalLink size={13} className="text-emerald-400" />
                    Live Post & Release Date
                  </h3>
                  <div className="flex items-center gap-2">
                    <div 
                      onClick={() => drawerDateInputRef.current?.showPicker?.()}
                      className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 hover:border-teal-500 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer"
                    >
                      <Calendar size={13} className="text-teal-400" />
                      <input
                        ref={drawerDateInputRef}
                        type="date"
                        value={collab.actual_posted_date || collab.scheduled_post_date || ''}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          onUpdateCollab(collab.id, {
                            actual_posted_date: newDate,
                            scheduled_post_date: newDate
                          });
                        }}
                        onClick={(e) => (e.target as any).showPicker?.()}
                        style={{ colorScheme: 'dark' }}
                        className="bg-transparent text-xs text-zinc-200 font-mono focus:outline-none cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          drawerDateInputRef.current?.showPicker?.();
                        }}
                        className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Date Presets for Drawer */}
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-zinc-500 mr-1">Quick Select:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      onUpdateCollab(collab.id, { actual_posted_date: today, scheduled_post_date: today });
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const y = new Date();
                      y.setDate(y.getDate() - 1);
                      const yStr = y.toISOString().split('T')[0];
                      onUpdateCollab(collab.id, { actual_posted_date: yStr, scheduled_post_date: yStr });
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                  >
                    Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      const dStr = d.toISOString().split('T')[0];
                      onUpdateCollab(collab.id, { actual_posted_date: dStr, scheduled_post_date: dStr });
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                  >
                    In 1 Week
                  </button>
                </div>

                {/* Live URL Display or Input */}
                {collab.live_post_url ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <a
                        href={collab.live_post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-400 hover:underline flex-1 truncate font-mono"
                      >
                        {collab.live_post_url}
                      </a>
                      <button
                        onClick={() => handleCopy(collab.live_post_url!)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        title="Copy URL"
                      >
                        {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    {/* Live Performance Stats & Sync Engine */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block">Live Views</span>
                          <span className="font-bold text-zinc-100 text-sm">
                            {collab.views_count ? collab.views_count.toLocaleString() : '0'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block">Likes</span>
                          <span className="font-bold text-pink-400 text-sm">
                            {collab.likes_count ? collab.likes_count.toLocaleString() : '0'}
                          </span>
                        </div>
                        {engagementRate && (
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block">Engagement</span>
                            <span className="font-bold text-emerald-400 text-sm">
                              {engagementRate}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingMetrics(!editingMetrics)}
                          className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          {editingMetrics ? 'Cancel Edit' : 'Edit Counts'}
                        </button>
                        {(ytVideoId || igShortcode) && (
                          <button
                            onClick={() => setShowEmbedPlayer(!showEmbedPlayer)}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                              showEmbedPlayer
                                ? 'bg-zinc-800 text-white border-zinc-700'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                            }`}
                          >
                            {showEmbedPlayer ? 'Hide Player' : 'Watch Live Content'}
                          </button>
                        )}

                        <button
                          disabled={syncingMetrics}
                          onClick={async () => {
                            setSyncingMetrics(true);
                            setSyncFeedback(null);
                            try {
                              const updated = await syncCollabMetrics(collab.id);
                              onUpdateCollab(collab.id, updated);
                              if ((updated.views_count || 0) === 0 && collab.platform === 'instagram') {
                                setSyncFeedback({
                                  type: 'success',
                                  message: 'Instagram link verified. Meta restricts public view counts without Graph API. You can manually enter views below.'
                                });
                                setEditingMetrics(true);
                              } else {
                                setSyncFeedback({
                                  type: 'success',
                                  message: `✓ Live sync successful: ${updated.views_count?.toLocaleString() || 0} views & ${updated.likes_count?.toLocaleString() || 0} likes.`
                                });
                              }
                            } catch (err: any) {
                              setSyncFeedback({
                                type: 'error',
                                message: `⚠️ Integration message: ${err.message || 'Metrics sync failed. Please check content URL.'}`
                              });
                            } finally {
                              setSyncingMetrics(false);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium transition-colors text-xs active:scale-95 disabled:opacity-50"
                          title="Sync live views and likes from YouTube/Instagram"
                        >
                          <TrendingUp size={12} className={syncingMetrics ? 'animate-spin' : ''} />
                          {syncingMetrics ? 'Syncing...' : 'Sync Live Metrics'}
                        </button>
                      </div>
                    </div>

                    {editingMetrics && (
                      <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-2 text-xs">
                        <span className="font-semibold text-zinc-200 block text-[11px]">Edit Real Post Views & Likes</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-0.5">Views Count</label>
                            <input
                              type="number"
                              value={customViews === 0 ? '' : customViews}
                              placeholder="0"
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value.replace(/^0+(?=\d)/, '');
                                setCustomViews(val === '' ? 0 : Number(val));
                              }}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-100 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-0.5">Likes Count</label>
                            <input
                              type="number"
                              value={customLikes === 0 ? '' : customLikes}
                              placeholder="0"
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value.replace(/^0+(?=\d)/, '');
                                setCustomLikes(val === '' ? 0 : Number(val));
                              }}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-100 font-mono text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateCollab(collab.id, {
                                views_count: Number(customViews) || 0,
                                likes_count: Number(customLikes) || 0
                              });
                              setEditingMetrics(false);
                            }}
                            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold"
                          >
                            Save Counts
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Validation & Integration Status Feedback Banner */}
                    {syncFeedback && (
                      <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                        syncFeedback.type === 'success'
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/30 border-red-500/40 text-red-300'
                      }`}>
                        <span>{syncFeedback.message}</span>
                        <button
                          onClick={() => setSyncFeedback(null)}
                          className="text-zinc-500 hover:text-zinc-300 ml-2"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    {/* Free Native Embedded Video/Reel Player */}
                    {showEmbedPlayer && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800 bg-black">
                        {ytVideoId && (
                          <div className="aspect-video w-full">
                            <iframe
                              src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1`}
                              title={collab.title}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                        {igShortcode && (
                          <div className="w-full flex justify-center py-2 bg-zinc-950">
                            <iframe
                              src={`https://www.instagram.com/reel/${igShortcode}/embed/captioned`}
                              title={collab.title}
                              className="w-full max-w-sm h-[480px] border-0 rounded-lg"
                              scrolling="no"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste live Instagram Reel or YouTube Video URL..."
                      value={liveUrlInput}
                      onChange={(e) => setLiveUrlInput(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleSaveLiveUrl}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Save URL
                    </button>
                  </div>
                )}

                {/* Campaign Codes & Links */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Coupon Promo Code</span>
                    <span className="font-mono font-bold text-amber-400">
                      {collab.promo_code || 'None'}
                    </span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Tracking Link</span>
                    <span className="font-mono text-xs text-zinc-300 truncate block">
                      {collab.tracking_link || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="sticky bottom-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 p-4 flex items-center justify-between">
                    <button
            onClick={async () => {
              if (confirm(`Are you sure you want to permanently delete "${collab.title}"?`)) {
                if (onDeleteCollab) {
                  await onDeleteCollab(collab.id);
                }
                onClose();
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1.5 font-medium"
          >
            <Trash2 size={13} />
            Delete Collaboration
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
