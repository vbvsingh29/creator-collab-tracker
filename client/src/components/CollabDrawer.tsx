import React, { useState } from 'react';
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
  FileText
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
}

export const CollabDrawer: React.FC<CollabDrawerProps> = ({
  collab,
  currency,
  appMode = 'simple',
  onClose,
  onUpdateCollab,
  onOpenProofCard,
  onOpenFollowUp,
  onMarkPaid
}) => {
  const [drawerMode, setDrawerMode] = useState<'simple' | 'advanced'>(appMode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [liveUrlInput, setLiveUrlInput] = useState(collab?.live_post_url || '');
  const [showEmbedPlayer, setShowEmbedPlayer] = useState(false);
  const [syncingMetrics, setSyncingMetrics] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!collab) return null;

  // Extract content ID for live player embed
  const ytMatch = collab.live_post_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  const ytVideoId = ytMatch ? ytMatch[1] : null;

  const igMatch = collab.live_post_url?.match(/(?:instagram\.com\/(?:p|reel|tv)\/)([\w-]+)/);
  const igShortcode = igMatch ? igMatch[1] : null;

  const engagementRate = collab.views_count && collab.views_count > 0 && collab.likes_count 
    ? ((collab.likes_count / collab.views_count) * 100).toFixed(1)
    : null;

  const formatInfo = getDeliverableLabel(collab.deliverable_format);
  const paymentBadge = getPaymentBadge(collab.payment_status);
  const stageConfig = getStageConfig(collab.pipeline_stage);

  // Financial breakdown
  const amount = collab.deal_amount;
  const tdsEstimate = amount * 0.10;
  const agencyCommission = amount * 0.15;
  const netTakeHome = Math.max(0, amount - tdsEstimate - agencyCommission);

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
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

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Title & Brand */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              {collab.brand_name} • {collab.brand_category}
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
              {collab.title}
            </h2>
          </div>

          {/* Deliverable Integration Depth Badge */}
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

            {drawerMode === 'advanced' && (
              collab.has_ads_whitelisting ? (
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
              )
            )}
          </div>

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

            {/* True Take Home Split (TDS & Agency Fee) - Advanced Only */}
            {drawerMode === 'advanced' && collab.commercial_type !== 'barter' && collab.deal_amount > 0 && (
              <div className="mt-3 pt-2 bg-zinc-950/60 rounded-lg p-3 border border-zinc-800/80">
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1">
                    <Percent size={12} /> True Creator Take-Home Breakdown
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    Net: {formatCurrency(netTakeHome, collab.currency)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Gross Deal</span>
                    <span className="font-medium text-zinc-200">{formatCurrency(amount, collab.currency)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">TDS / Tax (10%)</span>
                    <span className="font-medium text-red-400">-{formatCurrency(tdsEstimate, collab.currency)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Agency Cut (15%)</span>
                    <span className="font-medium text-amber-400">-{formatCurrency(agencyCommission, collab.currency)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment terms row - Advanced Only */}
            {drawerMode === 'advanced' && (
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
            )}
          </div>

          {/* Live Post Verification & Performance */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <ExternalLink size={13} className="text-emerald-400" />
                Live Post Verification
              </h3>
              {collab.actual_posted_date && (
                <span className="text-[11px] text-zinc-400">
                  Published: <span className="text-zinc-200 font-semibold">{collab.actual_posted_date}</span>
                </span>
              )}
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
                          setSyncFeedback({
                            type: 'success',
                            message: `✓ Live sync successful: ${updated.views_count?.toLocaleString() || 0} views & ${updated.likes_count?.toLocaleString() || 0} likes.`
                          });
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

            {/* Campaign Codes & Links - Advanced Only */}
            {drawerMode === 'advanced' && (
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
            )}
          </div>

          {/* Simple Mode Switch Prompt */}
          {drawerMode === 'simple' && (
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center space-y-2">
              <p className="text-xs text-zinc-400">
                Viewing <span className="text-emerald-400 font-semibold">Essential Details</span>
              </p>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                Need the TDS tax ledger, deliverables checklist, ad whitelisting terms, or brand contact?
              </p>
              <button
                onClick={() => setDrawerMode('advanced')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Zap size={12} /> Switch to Advanced Breakdown
              </button>
            </div>
          )}

          {/* Interactive Deliverables Checklist - Advanced Only */}
          {drawerMode === 'advanced' && (
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
          )}

          {/* Brand Contact & Notes - Advanced Only */}
          {drawerMode === 'advanced' && (
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
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="sticky bottom-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 p-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this collaboration?')) {
                // Delete handled in parent
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 hover:underline"
          >
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
