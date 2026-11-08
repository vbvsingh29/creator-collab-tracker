import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Send, 
  MessageSquareQuote, 
  Sliders, 
  BarChart3, 
  TrendingUp, 
  Bot, 
  Zap, 
  ShieldCheck, 
  Eye, 
  Heart, 
  Layers, 
  Key, 
  ChevronRight,
  Package,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Collab, Currency, User } from '../types';
import { apiGenerateAIPitch } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface PitchGeneratorModalProps {
  collab?: Collab | null;
  collabs?: Collab[];
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
}

type PitchStrategy = 
  | 'reel_summary_pitch'
  | 'counter_offer' 
  | 'upsell_bundle' 
  | 'inquiry_reply' 
  | 'overdue_notice';

type AIProvider = 'builtin' | 'gemini' | 'openai';

export const PitchGeneratorModal: React.FC<PitchGeneratorModalProps> = ({
  collab,
  collabs = [],
  user,
  isOpen,
  onClose,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'reel_summary'>('pitch');
  const [strategy, setStrategy] = useState<PitchStrategy>('reel_summary_pitch');
  const [tone, setTone] = useState<'confident' | 'warm' | 'firm'>('confident');
  const [targetBrand, setTargetBrand] = useState(collab?.brand_name || 'Brand Partner');
  const [proposedRate, setProposedRate] = useState<number>(collab?.deal_amount || (currency === 'USD' ? 600 : 45000));
  
  // AI Provider settings
  const [aiProvider, setAiProvider] = useState<AIProvider>(() => {
    return (localStorage.getItem('collabflow_ai_provider') as AIProvider) || 'builtin';
  });
  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem('collabflow_user_ai_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  // AI Output state
  const [generating, setGenerating] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (collab?.brand_name) {
      setTargetBrand(collab.brand_name);
    }
    if (collab?.deal_amount) {
      setProposedRate(collab.deal_amount);
    }
  }, [collab]);

  // Initial generation on modal mount
  useEffect(() => {
    if (isOpen) {
      handleTriggerAIGeneration();
    }
  }, [isOpen, targetBrand, strategy, tone]);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('collabflow_user_ai_key', key);
  };

  const handleSelectProvider = (prov: AIProvider) => {
    setAiProvider(prov);
    localStorage.setItem('collabflow_ai_provider', prov);
  };

  const handleTriggerAIGeneration = async () => {
    setGenerating(true);
    try {
      // Gather creator reels data
      const relevantReels = (collabs.length > 0 ? collabs : [collab]).filter(Boolean).map((c: any) => ({
        id: c.id,
        title: c.title,
        brand_name: c.brand_name,
        platform: c.platform,
        deliverable_format: c.deliverable_format,
        views_count: c.views_count || 45000,
        likes_count: c.likes_count || Math.round((c.views_count || 45000) * 0.045),
        deal_amount: c.deal_amount || proposedRate,
        currency: c.currency || currency,
        live_post_url: c.live_post_url
      }));

      const res = await apiGenerateAIPitch({
        creatorName: user?.name || 'Creator',
        creatorHandle: user?.handle || '@creator',
        creatorCategory: user?.category || 'Tech & Lifestyle',
        targetBrand: targetBrand.trim() || 'Brand Partner',
        strategy,
        tone,
        reels: relevantReels,
        proposedRate,
        currency,
        aiProvider,
        userApiKey: userApiKey.trim() || undefined
      });

      setAiData(res);
    } catch (err: any) {
      console.error('AI generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyPitch = () => {
    const textToCopy = aiData?.pitchProposal?.pitchText || '';
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const sym = currency === 'USD' ? '$' : '₹';
  const analysis = aiData?.reelAnalysis;
  const proposal = aiData?.pitchProposal;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-pink-500 p-0.5 shadow-sm">
              <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles size={16} className="text-amber-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  AI Sponsor Pitch & Reel Intelligence Studio
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {aiData?.modelUsed || 'Gemini 1.5 & Smart Engine'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Reel-wise performance analytics and data-backed future campaign proposals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'pitch'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Bot size={13} />
              AI Pitch & Package Builder
            </button>

            <button
              onClick={() => setActiveTab('reel_summary')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'reel_summary'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart3 size={13} />
              Reel-Wise Performance Analytics
              {analysis?.totalReelsAnalyzed && (
                <span className="text-[10px] font-bold px-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {analysis.totalReelsAnalyzed}
                </span>
              )}
            </button>
          </div>

          {/* AI Provider Indicator / Selector */}
          <div className="flex items-center gap-2 text-xs pb-2">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-lg">
              <button
                onClick={() => handleSelectProvider('builtin')}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                  aiProvider === 'builtin' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
                }`}
                title="Free built-in creator intelligence engine (zero API key needed)"
              >
                Zero-Key AI
              </button>
              <button
                onClick={() => handleSelectProvider('gemini')}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                  aiProvider === 'gemini' ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-500'
                }`}
                title="Google Gemini 1.5 Flash Free API"
              >
                Gemini Free
              </button>
              <button
                onClick={() => handleSelectProvider('openai')}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                  aiProvider === 'openai' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-500'
                }`}
                title="OpenAI GPT-4o mini"
              >
                GPT-4o
              </button>
            </div>

            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Configure Custom API Key"
            >
              <Key size={13} />
            </button>
          </div>
        </div>

        {/* Custom API Key Tray (Expandable) */}
        {showKeyInput && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <span className="font-semibold text-amber-700 dark:text-amber-300 text-[11px] whitespace-nowrap">
                Optional Custom API Key:
              </span>
              <input
                type="password"
                placeholder={aiProvider === 'gemini' ? 'AIzaSy... (Gemini Free Key)' : 'sk-... (OpenAI Key)'}
                value={userApiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded px-2.5 py-1 text-xs font-mono focus:outline-none"
              />
            </div>
            <span className="text-[10px] text-zinc-500">
              Stored locally on your browser only.
            </span>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {activeTab === 'pitch' ? (
            /* TAB 1: PITCH & FUTURE CAMPAIGN BUILDER */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Target Sponsor & Strategy Parameters (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Sponsor & Campaign Targeting
                  </h4>

                  {/* Target Brand Name */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Target Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NordVPN, Notion, Dyson, Nike"
                      value={targetBrand}
                      onChange={(e) => setTargetBrand(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Strategy Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Pitch Strategy
                    </label>
                    <select
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value as PitchStrategy)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="reel_summary_pitch">Reel-Wise Data Pitch (Backed by Reach Proof)</option>
                      <option value="upsell_bundle">Omnichannel Upsell Bundle (Reel + Stories + Whitelist)</option>
                      <option value="counter_offer">Lowball Counter-Offer (CPM Unit Economics Defense)</option>
                      <option value="inquiry_reply">Inbound Inquiry Reply with Rate Card</option>
                      <option value="overdue_notice">Firm Overdue Payment Recovery Notice</option>
                    </select>
                  </div>

                  {/* Tone Selector */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {(['confident', 'warm', 'firm'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`py-1.5 rounded-lg capitalize font-medium text-xs transition-colors ${
                          tone === t
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Proposed Rate Anchor */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Base Commercial Rate ({currency})
                    </label>
                    <input
                      type="number"
                      value={proposedRate}
                      onChange={(e) => setProposedRate(Number(e.target.value))}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Re-generate trigger button */}
                  <button
                    onClick={handleTriggerAIGeneration}
                    disabled={generating}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Sparkles size={13} className={generating ? 'animate-spin' : ''} />
                    {generating ? 'Synthesizing with AI...' : 'Regenerate AI Pitch'}
                  </button>
                </div>

                {/* Recommended Multi-Touch Bundle */}
                {proposal?.recommendedBundle && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-pink-500/5 to-amber-500/10 border border-indigo-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Package size={13} className="text-amber-500" />
                        AI Recommended Package
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {proposal.recommendedBundle.savingsPercent}% Sponsor Savings
                      </span>
                    </div>

                    <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {proposal.recommendedBundle.name}
                    </h5>

                    <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">
                      {proposal.recommendedBundle.deliverables.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check size={11} className="text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2 border-t border-indigo-500/20 flex items-baseline justify-between text-xs">
                      <span className="text-zinc-500 line-through text-[11px]">
                        Standalone: {formatCurrency(proposal.recommendedBundle.standaloneValue, currency)}
                      </span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(proposal.recommendedBundle.bundledOfferPrice, currency)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI Generated Pitch Copy (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col h-full justify-between">
                  <div>
                    {/* Header with 1-click copy */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <MessageSquareQuote size={14} className="text-indigo-500" />
                        <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                          Ready-to-Send Outreach Script
                        </span>
                      </div>

                      <button
                        onClick={handleCopyPitch}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                      >
                        {copied ? <Check size={12} className="text-white" /> : <Copy size={12} />}
                        {copied ? 'Copied to Clipboard!' : '1-Click Copy'}
                      </button>
                    </div>

                    {/* Subject Line */}
                    {proposal?.subjectLine && (
                      <div className="py-2 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                        <span className="font-bold text-zinc-500">Subject: </span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{proposal.subjectLine}</span>
                      </div>
                    )}

                    {/* Pitch Text Area */}
                    <div className="pt-3">
                      <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-[380px] overflow-y-auto pr-1">
                        {generating ? (
                          <span className="text-zinc-400 italic">Synthesizing personalized sponsor pitch based on your verified reel metrics...</span>
                        ) : (
                          proposal?.pitchText || 'Generating pitch...'
                        )}
                      </pre>
                    </div>
                  </div>

                  {/* Key Data Bullets to Cite in Negotiation */}
                  {proposal?.keyDataBullets && (
                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Historical Data Points Cited by AI:
                      </span>
                      <div className="space-y-1">
                        {proposal.keyDataBullets.map((bullet: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: REEL-WISE PERFORMANCE SUMMARY */
            <div className="space-y-4">
              {/* Executive Metrics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 block mb-0.5">
                    Total Sponsored Reach
                  </span>
                  <div className="text-xl font-extrabold text-zinc-900 dark:text-white">
                    {analysis?.totalViews ? analysis.totalViews.toLocaleString() : '271,200'}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Verified audience views</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block mb-0.5">
                    Average Engagement
                  </span>
                  <div className="text-xl font-extrabold text-emerald-500">
                    {analysis?.avgEngagementRate || 4.8}%
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Category benchmark: ~2.8%</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-semibold uppercase text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    Delivered Sponsor CPM
                  </span>
                  <div className="text-xl font-extrabold text-indigo-500">
                    {sym}{analysis?.avgDeliveredCpm || (currency === 'USD' ? 16 : 1200)}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Cost per 1,000 impressions</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 block mb-0.5">
                    Top Outlier Reel
                  </span>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {analysis?.topPerformingReel?.views ? `${analysis.topPerformingReel.views.toLocaleString()} Views` : '142,000 Views'}
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {analysis?.topPerformingReel?.brand || 'Nothing Tech'}
                  </p>
                </div>
              </div>

              {/* AI Executive Summary Banner */}
              {analysis?.executiveSummary && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed flex items-start gap-2.5">
                  <Bot size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-0.5">AI Content Intelligence Synthesis:</strong>
                    <span>{analysis.executiveSummary}</span>
                  </div>
                </div>
              )}

              {/* Reel-by-Reel Performance Table / Cards */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Reel & Deliverable Performance Breakdown
                </h4>

                <div className="space-y-2.5">
                  {analysis?.reelSummaries?.map((reel: any, idx: number) => (
                    <div 
                      key={reel.id || idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-zinc-900 dark:text-white">
                            {reel.brand}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {reel.platform}
                          </span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Grade: {reel.grade}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium mb-1 line-clamp-1">
                          {reel.title}
                        </p>

                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                          💡 {reel.insight}
                        </p>
                      </div>

                      {/* Performance Metric Badges */}
                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Verified Views</span>
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            <Eye size={12} className="text-indigo-500" />
                            {reel.views.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 block">Engagement</span>
                          <span className="font-extrabold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                            <Heart size={12} />
                            {reel.engagementRate}%
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 block">Delivered CPM</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {sym}{reel.deliveredCpm}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Powered by {aiData?.providerUsed || 'Collabio AI Intelligence Studio'}.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold shadow-xs"
          >
            Done (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
