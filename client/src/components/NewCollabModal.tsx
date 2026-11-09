import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Instagram, Youtube, Layers, Zap, ShieldAlert, Check, Calendar, DollarSign, Sparkles, Link as LinkIcon, SlidersHorizontal, Percent } from 'lucide-react';
import { Collab, Platform, DeliverableFormat, CommercialType, Currency, PaymentTerms } from '../types';
import { previewMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface NewCollabModalProps {
  currency: Currency;
  defaultMode?: 'simple' | 'advanced';
  onClose: () => void;
  onCreateCollab: (data: Partial<Collab>) => void;
  initialData?: {
    title?: string;
    format?: string;
    amount?: number;
    hasWhitelisting?: boolean;
    hasExclusivity?: boolean;
    scheduledDate?: string;
    tds_percentage?: number;
    agency_cut_percentage?: number;
  };
}

export const NewCollabModal: React.FC<NewCollabModalProps> = ({
  currency,
  defaultMode = 'simple',
  onClose,
  onCreateCollab,
  initialData
}) => {
  const { user } = useAuth();
  const [formMode, setFormMode] = useState<'simple' | 'advanced'>(defaultMode);
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [brandName, setBrandName] = useState('');
  const [brandCategory, setBrandCategory] = useState('Tech & Consumer Electronics');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [deliverableFormat, setDeliverableFormat] = useState<DeliverableFormat>(
    (initialData?.format as DeliverableFormat) || 'ig_integrated_reel'
  );
  const [commercialType, setCommercialType] = useState<CommercialType>('paid');
  const [dealCurrency, setDealCurrency] = useState<Currency>(currency);
  const defaultDealAmount = initialData?.amount !== undefined 
    ? initialData.amount 
    : (user?.rates?.reel_rate || 0);
  const [dealAmount, setDealAmount] = useState<number>(defaultDealAmount);
  const [barterValue, setBarterValue] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net_30');
  const [hasWhitelisting, setHasWhitelisting] = useState<boolean>(initialData?.hasWhitelisting ?? false);
  const [whitelistingDays, setWhitelistingDays] = useState<number>(30);
  const [hasExclusivity, setHasExclusivity] = useState<boolean>(initialData?.hasExclusivity ?? false);
  const [exclusivityDays, setExclusivityDays] = useState<number>(30);
  const [promoCode, setPromoCode] = useState('');
  const [trackingLink, setTrackingLink] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    initialData?.scheduledDate || new Date().toISOString().split('T')[0]
  );
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState('');
  const [viewsCount, setViewsCount] = useState<number>(0);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [tdsPercentage, setTdsPercentage] = useState<number>(initialData?.tds_percentage ?? user?.tds_percentage ?? 0);
  const [agencyCutPercentage, setAgencyCutPercentage] = useState<number>(initialData?.agency_cut_percentage ?? user?.agency_cut_percentage ?? 0);
  const socialAccounts = user?.social_accounts || [];
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Quick Auto-Fill URL state
  const [autoFillUrl, setAutoFillUrl] = useState('');
  const [autoFilling, setAutoFilling] = useState(false);
  const [autoFillFeedback, setAutoFillFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAutoFetch = async () => {
    setAutoFillFeedback(null);
    if (!autoFillUrl.trim()) {
      setAutoFillFeedback({
        type: 'error',
        text: 'Please paste a content URL first.'
      });
      return;
    }

    const clean = autoFillUrl.trim().toLowerCase();
    if (!clean.includes('youtube.com') && !clean.includes('youtu.be') && !clean.includes('instagram.com')) {
      setAutoFillFeedback({
        type: 'error',
        text: 'Integration disabled for this domain. Collabio validates YouTube (videos/shorts) and Instagram (reels/posts).'
      });
      return;
    }

    setAutoFilling(true);
    try {
      const details = await previewMediaUrl(autoFillUrl.trim());
      if (details.title && details.title !== 'YouTube Content' && details.title !== 'Instagram Reel') {
        // Strip any residual HTML entities, hashtags, or formatting artifacts
        let cleanTitle = details.title
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
          .replace(/&#39;/g, "'")
          .replace(/#\w+/g, '') // remove trailing hashtags from title
          .replace(/\s+/g, ' ')
          .trim();
        // Remove leading author e.g. "Author on Instagram: "
        cleanTitle = cleanTitle.replace(/^[^:]+\s+on Instagram:\s*["“]?/i, '').replace(/["”]?\s*$/, '').trim();
        setTitle(cleanTitle || details.title);

        // Detect potential brand name from hashtags or title keywords
        const hashtagMatches = (details.title.match(/#([a-zA-Z0-9]+)/g) || []).map((h: string) => h.replace('#', ''));
        const detectedBrand = hashtagMatches.find((h: string) => !['viral', 'reels', 'fyp', 'trending', 'explore', 'ad', 'sponsor', 'collab', 'ambassador'].includes(h.toLowerCase()));
        if (detectedBrand && !brandName) {
          setBrandName(detectedBrand.charAt(0).toUpperCase() + detectedBrand.slice(1));
        }
      }
      if (details.platform) {
        setPlatform(details.platform);
        const lowerUrl = autoFillUrl.toLowerCase();
        if (details.platform === 'youtube') {
          if (lowerUrl.includes('/shorts/')) {
            setDeliverableFormat('yt_short');
          } else {
            setDeliverableFormat('yt_integrated_midroll');
          }
        } else {
          setDeliverableFormat('ig_integrated_reel');
        }
      }
      if (details.publishedAt) {
        // Format ISO date (e.g. 2024-05-12T10:00:00Z -> 2024-05-12) for the calendar input
        const cleanDate = details.publishedAt.split('T')[0];
        setScheduledDate(cleanDate);
      } else {
        // Default to today's date if not extracted from link so calendar input is never empty
        setScheduledDate(new Date().toISOString().split('T')[0]);
      }
      if (details.viewsCount !== undefined && details.viewsCount > 0) {
        setViewsCount(details.viewsCount);
      }
      if (details.likesCount !== undefined && details.likesCount > 0) {
        setLikesCount(details.likesCount);
      }
      if (details.authorName && details.authorName !== 'Creator' && details.authorName !== 'Instagram Creator') {
        if (!brandName) {
          // If no hashtag brand was detected, use author or clean handle
          const cleanAuthor = details.authorName.replace(/^@/, '');
          setBrandName(cleanAuthor);
        }
        setContactPerson(details.authorName);
      }
      setAutoFillFeedback({
        type: 'success',
        text: `✓ Auto-detected ${details.platform.toUpperCase()} content: Title, platform, and publish date auto-filled! (You can freely edit any field below).`
      });
    } catch (err: any) {
      setAutoFillFeedback({
        type: 'error',
        text: `Integration error: ${err.message || 'Could not fetch metadata from this URL. Please verify link format.'}`
      });
    } finally {
      setAutoFilling(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brandName.trim()) {
      alert('Please provide a title and brand name');
      return;
    }

    const standardChecklist = [
      { id: '1', task: 'Review brand brief & talking points', completed: false },
      { id: '2', task: 'Include mandatory #ad / Paid partnership disclosure tag', completed: false },
      { id: '3', task: 'Add promo code & trackable link in description / link in bio', completed: false },
    ];

    const selectedAccount = socialAccounts.find(a => a.id === selectedAccountId);

    onCreateCollab({
      title: title.trim(),
      brand_name: brandName.trim(),
      brand_category: brandCategory,
      contact_person: contactPerson.trim(),
      contact_email: contactEmail.trim(),
      platform,
      deliverable_format: deliverableFormat,
      commercial_type: commercialType,
      currency: dealCurrency,
      deal_amount: commercialType === 'barter' ? 0 : Number(dealAmount),
      barter_estimated_value: Number(barterValue) || 0,
      payment_terms: paymentTerms,
      has_ads_whitelisting: hasWhitelisting,
      whitelisting_duration_days: hasWhitelisting ? Number(whitelistingDays) : 0,
      has_category_exclusivity: hasExclusivity,
      exclusivity_days: hasExclusivity ? Number(exclusivityDays) : 0,
      promo_code: promoCode.trim(),
      tracking_link: trackingLink.trim(),
      scheduled_post_date: scheduledDate || undefined,
      notes: notes.trim(),
      live_post_url: autoFillUrl.trim() || undefined,
      views_count: Number(viewsCount) || 0,
      likes_count: Number(likesCount) || 0,
      tds_percentage: Number(tdsPercentage) || 0,
      agency_cut_percentage: Number(agencyCutPercentage) || 0,
      pipeline_stage: autoFillUrl.trim() ? 'posted_live' : 'pitch_inquiry',
      deliverables_checklist: standardChecklist,
      account_id: selectedAccount?.id,
      account_label: selectedAccount ? `${selectedAccount.name} (${selectedAccount.handle})` : undefined,
    });

    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Create New Collaboration</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                formMode === 'simple'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {formMode === 'simple' ? 'Simple Mode' : 'Advanced Mode'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {formMode === 'simple' 
                ? 'Quick deal entry with only essential details' 
                : 'Configure deliverables, commercial terms, and usage rights'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Simple vs Advanced Toggle */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFormMode('simple')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  formMode === 'simple'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => setFormMode('advanced')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  formMode === 'advanced'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Advanced
              </button>
            </div>

            <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Quick URL Auto-Fill Input (Free YouTube/IG Integration) */}
          <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                Quick Auto-Detect from YouTube or Instagram Link
              </span>
              <span className="text-[10px] text-zinc-500">Free Instant Sync</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste live YouTube video or Instagram Reel link..."
                value={autoFillUrl}
                onChange={(e) => setAutoFillUrl(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                disabled={autoFilling || !autoFillUrl.trim()}
                onClick={handleAutoFetch}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                {autoFilling ? 'Fetching...' : 'Auto-Fill'}
              </button>
            </div>

            {/* Inline Integration Feedback / Validation Banner */}
            {autoFillFeedback && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                autoFillFeedback.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}>
                <span>{autoFillFeedback.text}</span>
                <button
                  type="button"
                  onClick={() => setAutoFillFeedback(null)}
                  className="text-zinc-500 hover:text-zinc-300 ml-2"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Live Detected Metrics (Views & Likes) - Prominent and directly editable */}
            {autoFillUrl.trim() && (
              <div className="p-2.5 bg-zinc-950/90 border border-zinc-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-teal-400" />
                    Live Reach Metrics ({platform === 'youtube' ? 'YouTube' : 'Instagram'})
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {platform === 'instagram' 
                      ? 'Meta restricts public views — verify or enter manually below' 
                      : 'Auto-synced from YouTube live data'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-0.5">
                      Views Count {viewsCount > 0 && <span className="text-teal-400">({viewsCount.toLocaleString()})</span>}
                    </label>
                    <input
                      type="number"
                      value={viewsCount === 0 ? '' : viewsCount}
                      placeholder="Enter reel/video views..."
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, '');
                        setViewsCount(val === '' ? 0 : Number(val));
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 hover:border-teal-500 focus:border-teal-500 rounded px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-0.5">
                      Likes Count {likesCount > 0 && <span className="text-pink-400">({likesCount.toLocaleString()})</span>}
                    </label>
                    <input
                      type="number"
                      value={likesCount === 0 ? '' : likesCount}
                      placeholder="Enter likes..."
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, '');
                        setLikesCount(val === '' ? 0 : Number(val));
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 hover:border-pink-500 focus:border-pink-500 rounded px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Target Connected Channel / Page Selector */}
          {socialAccounts.length > 0 && (
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Assign to Channel or Page
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  const acc = socialAccounts.find(a => a.id === e.target.value);
                  if (acc) {
                    if (acc.platform === 'youtube') setPlatform('youtube');
                    else if (acc.platform === 'instagram') setPlatform('instagram');
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="">General / Primary Workspace</option>
                {socialAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.handle}) — {acc.platform.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Campaign / Collab Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 60s Mid-roll in Desk Setup Video"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NordVPN, Dyson, Notion"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Publish Date Calendar View (Fully interactive visual date picker with dark theme support & presets) */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-teal-400" />
                <span>Publish / Live Date *</span>
              </label>
              {scheduledDate && (
                <span className="text-[10px] text-teal-400 font-mono font-medium">
                  Selected: {scheduledDate}
                </span>
              )}
            </div>
            <div 
              onClick={() => dateInputRef.current?.showPicker?.()}
              className="relative flex items-center bg-zinc-950 border border-zinc-800 hover:border-teal-500 rounded-lg overflow-hidden transition-colors cursor-pointer group"
            >
              <input
                ref={dateInputRef}
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                onClick={(e) => (e.target as any).showPicker?.()}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-transparent px-3 py-2 text-xs text-zinc-100 focus:outline-none cursor-pointer font-mono"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dateInputRef.current?.showPicker?.();
                }}
                className="absolute right-2 px-2.5 py-1 rounded-md bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Calendar size={12} />
                <span>Open Calendar</span>
              </button>
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-zinc-500 mr-1">Quick Select:</span>
              <button
                type="button"
                onClick={() => setScheduledDate(new Date().toISOString().split('T')[0])}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setScheduledDate(d.toISOString().split('T')[0]);
                }}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 7);
                  setScheduledDate(d.toISOString().split('T')[0]);
                }}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition-colors"
              >
                In 1 Week
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 30);
                  setScheduledDate(d.toISOString().split('T')[0]);
                }}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition-colors"
              >
                In 1 Month
              </button>
            </div>
          </div>

          {/* Category & Contact - Advanced Only */}
          {formMode === 'advanced' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={brandCategory}
                  onChange={(e) => setBrandCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Tech & Consumer Electronics">Tech & Consumer Electronics</option>
                  <option value="Software & Cybersecurity">Software & Cybersecurity</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Fitness & Health">Fitness & Health</option>
                  <option value="Finance & Fintech">Finance & Fintech</option>
                  <option value="Gaming & Entertainment">Gaming & Entertainment</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="Elena Rostova (PR Lead)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="partner@brand.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Platform & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Platform
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPlatform('instagram')}
                  className={`py-1.5 rounded-md flex items-center justify-center gap-1 font-medium transition-colors ${
                    platform === 'instagram' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-zinc-400'
                  }`}
                >
                  <Instagram size={12} /> Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('youtube')}
                  className={`py-1.5 rounded-md flex items-center justify-center gap-1 font-medium transition-colors ${
                    platform === 'youtube' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-zinc-400'
                  }`}
                >
                  <Youtube size={12} /> YouTube
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('both')}
                  className={`py-1.5 rounded-md flex items-center justify-center gap-1 font-medium transition-colors ${
                    platform === 'both' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-400'
                  }`}
                >
                  <Layers size={12} /> Both
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Deliverable Format & Depth
              </label>
              <select
                value={deliverableFormat}
                onChange={(e) => setDeliverableFormat(e.target.value as DeliverableFormat)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                {/* Instagram options */}
                <optgroup label="Instagram">
                  <option value="ig_mention">Soft Name Mention / Caption Tag (Low)</option>
                  <option value="ig_story">Story Sequence with Link Sticker (Medium)</option>
                  <option value="ig_integrated_reel">30s Integrated Reel Sponsor (High)</option>
                  <option value="ig_dedicated_reel">100% Dedicated Reel (Premium)</option>
                  <option value="ig_carousel_post">Carousel Feed Post</option>
                  <option value="ig_collab_post">Co-Authored Collab Post</option>
                </optgroup>
                {/* YouTube options */}
                <optgroup label="YouTube">
                  <option value="yt_mention">Spoken Name Drop / Credit (Low)</option>
                  <option value="yt_short">YouTube Short (Dedicated or Integrated)</option>
                  <option value="yt_integrated_midroll">60s Mid-Roll Sponsor Segment (High)</option>
                  <option value="yt_integrated_preroll">30s Pre-Roll Sponsor Segment</option>
                  <option value="yt_dedicated_video">Full 10-Min Dedicated Video (Premium)</option>
                </optgroup>
                <optgroup label="Cross-Platform">
                  <option value="multi_bundle">Cross-Platform Bundle (Reel + Mid-roll)</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Commercial & Pricing */}
          <div className={`grid grid-cols-1 ${formMode === 'advanced' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-3 pt-1`}>
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Deal Type
              </label>
              <select
                value={commercialType}
                onChange={(e) => setCommercialType(e.target.value as CommercialType)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="paid">Paid Cash</option>
                <option value="barter">Barter (Free Product)</option>
                <option value="affiliate">Affiliate / RevShare</option>
                <option value="hybrid">Hybrid (Cash + Product)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Currency
              </label>
              <select
                value={dealCurrency}
                onChange={(e) => setDealCurrency(e.target.value as Currency)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Deal Cash Value
              </label>
              <input
                type="number"
                disabled={commercialType === 'barter'}
                value={commercialType === 'barter' ? 0 : (dealAmount === 0 ? '' : dealAmount)}
                onChange={(e) => {
                  const val = e.target.value.replace(/^0+(?=\d)/, '');
                  setDealAmount(val === '' ? 0 : Number(val));
                }}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 disabled:opacity-30 font-mono"
              />
            </div>

            {formMode === 'advanced' && (
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="net_30">Net 30 Days</option>
                  <option value="net_15">Net 15 Days</option>
                  <option value="net_45">Net 45 Days</option>
                  <option value="net_60">Net 60 Days</option>
                  <option value="50_advance_50_post">50% Advance / 50% Post</option>
                  <option value="100_upfront">100% Upfront</option>
                  <option value="barter_only">Barter Only</option>
                </select>
              </div>
            )}
          </div>

          {/* User-Controlled Deductions (TDS & Agency Commission) - Default 0% (No forced deductions) */}
          {commercialType !== 'barter' && (
            <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent size={12} className="text-emerald-400" />
                  Take-Home Breakdown (Optional Discretion)
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  Net: {dealCurrency === 'USD' ? '$' : '₹'}{Math.max(0, (dealAmount || 0) * (1 - (tdsPercentage + agencyCutPercentage) / 100)).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-semibold">TDS / Tax (%)</label>
                    <span className="text-[10px] text-zinc-500">Default: 0%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tdsPercentage === 0 ? '' : tdsPercentage}
                      placeholder="0"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, '');
                        setTdsPercentage(val === '' ? 0 : Number(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 text-xs"
                    />
                    <span className="text-zinc-500 text-xs">%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-semibold">Agency Cut (%)</label>
                    <span className="text-[10px] text-zinc-500">Default: 0%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={agencyCutPercentage === 0 ? '' : agencyCutPercentage}
                      placeholder="0"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, '');
                        setAgencyCutPercentage(val === '' ? 0 : Number(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 text-xs"
                    />
                    <span className="text-zinc-500 text-xs">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Post Metrics (Views & Likes) */}
          {(autoFillUrl.trim() || formMode === 'advanced') && (
            <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
              <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] block">
                Post Metrics (Editable / Auto-synced)
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
                    Views Count
                  </label>
                  <input
                    type="number"
                    value={viewsCount === 0 ? '' : viewsCount}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setViewsCount(val === '' ? 0 : Number(val));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
                    Likes Count
                  </label>
                  <input
                    type="number"
                    value={likesCount === 0 ? '' : likesCount}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setLikesCount(val === '' ? 0 : Number(val));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Barter Product Value (if applicable) */}
          {(commercialType === 'barter' || commercialType === 'hybrid') && (
            <div className="p-3 bg-violet-950/20 border border-violet-500/30 rounded-xl">
              <label className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider block mb-1">
                Estimated Barter Retail Product Value ({dealCurrency})
              </label>
              <input
                type="number"
                placeholder="0"
                value={barterValue === 0 ? '' : barterValue}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  setBarterValue(val === '' ? 0 : Number(val));
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          )}

          {/* Simple Mode: Inline Expandable Extra Details Accordion */}
          {formMode === 'simple' && (
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/40 text-xs text-zinc-400 hover:text-zinc-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <SlidersHorizontal size={13} className="text-indigo-400" />
                  {showMoreDetails ? 'Hide Extra Details' : '+ Add More Details (Due Date, Terms, Promo Code & Notes)'}
                </span>
                <span className="text-[10px] text-zinc-500 font-semibold">
                  {showMoreDetails ? '▲ Collapse' : '▼ Expand'}
                </span>
              </button>

              {showMoreDetails && (
                <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        Payment Terms
                      </label>
                      <select
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="net_30">Net 30 Days</option>
                        <option value="net_15">Net 15 Days</option>
                        <option value="net_45">Net 45 Days</option>
                        <option value="50_advance_50_post">50% Advance / 50% Post</option>
                        <option value="100_upfront">100% Upfront</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SAVE20"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        Tracking Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://brand.com/..."
                        value={trackingLink}
                        onChange={(e) => setTrackingLink(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Notes / Talking Points
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Key talking points or campaign deliverables..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Usage Rights: Whitelisting & Exclusivity - Advanced Only */}
          {formMode === 'advanced' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div 
                  onClick={() => setHasWhitelisting(!hasWhitelisting)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-zinc-200 flex items-center gap-1">
                    <Zap size={13} className="text-indigo-400" />
                    Paid Ad Whitelisting
                  </span>
                  <input
                    type="checkbox"
                    checked={hasWhitelisting}
                    onChange={() => {}}
                    className="rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-0"
                  />
                </div>
                {hasWhitelisting && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-zinc-400">Duration:</span>
                    <select
                      value={whitelistingDays}
                      onChange={(e) => setWhitelistingDays(Number(e.target.value))}
                      className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
                    >
                      <option value={30}>30 Days</option>
                      <option value={60}>60 Days</option>
                      <option value={90}>90 Days</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div 
                  onClick={() => setHasExclusivity(!hasExclusivity)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-zinc-200 flex items-center gap-1">
                    <ShieldAlert size={13} className="text-amber-400" />
                    Category Exclusivity Lock
                  </span>
                  <input
                    type="checkbox"
                    checked={hasExclusivity}
                    onChange={() => {}}
                    className="rounded border-zinc-700 bg-zinc-800 text-amber-600 focus:ring-0"
                  />
                </div>
                {hasExclusivity && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-zinc-400">Lockout:</span>
                    <select
                      value={exclusivityDays}
                      onChange={(e) => setExclusivityDays(Number(e.target.value))}
                      className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
                    >
                      <option value={15}>15 Days</option>
                      <option value={30}>30 Days</option>
                      <option value={60}>60 Days</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Promo code, tracking link - Advanced Only */}
          {formMode === 'advanced' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Coupon / Promo Code
                </label>
                <input
                  type="text"
                  placeholder="CREATOR20"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Tracking URL (UTM)
                </label>
                <input
                  type="text"
                  placeholder="https://brand.com/creator"
                  value={trackingLink}
                  onChange={(e) => setTrackingLink(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Notes - Advanced Only */}
          {formMode === 'advanced' && (
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Deliverable Brief Notes & Guidelines
              </label>
              <textarea
                rows={2}
                placeholder="Script embargo dates, required talking points, brand do's and don'ts..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95"
            >
              Create Collaboration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
