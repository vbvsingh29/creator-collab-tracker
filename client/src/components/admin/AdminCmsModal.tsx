import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Save,
  Globe,
  RotateCcw,
  Eye,
  Plus,
  Trash2,
  DollarSign,
  HelpCircle,
  Megaphone,
  LayoutTemplate,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCms, CmsContent, CmsPricingPackage, CmsFaqItem } from '../../context/CmsContext';

interface AdminCmsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminCmsModal: React.FC<AdminCmsModalProps> = ({ isOpen, onClose }) => {
  const {
    draftContent,
    updateDraft,
    saveDraft,
    publishToLive,
    discardDraft,
    hasUnpublishedChanges,
    previewMode,
    setPreviewMode,
    publishedAt
  } = useCms();

  const [activeTab, setActiveTab] = useState<'banner' | 'pricing' | 'hero' | 'faqs'>('banner');
  const [saving, setSaving] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen || !draftContent) return null;

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await saveDraft();
    setSaving(false);
    if (success) {
      showFeedback('success', 'Draft saved to database! Click "Live Preview" to inspect or "Publish" to go live.');
    } else {
      showFeedback('error', 'Failed to save draft. Check connection.');
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Are you ready to publish these changes live to all visitors?')) {
      return;
    }
    setPublishing(true);
    const success = await publishToLive();
    setPublishing(false);
    if (success) {
      showFeedback('success', '✓ Content is now LIVE on Collabio!');
    } else {
      showFeedback('error', 'Failed to publish changes.');
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm('Discard all unsaved draft edits and revert to currently published version?')) {
      return;
    }
    const success = await discardDraft();
    if (success) {
      showFeedback('success', 'Draft reverted to live version.');
    }
  };

  const handleTogglePreview = () => {
    setPreviewMode(!previewMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-charcoal-900 border border-charcoal-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Studio Topbar */}
        <div className="px-6 py-4 border-b border-charcoal-800 flex items-center justify-between bg-charcoal-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sand-400/10 border border-sand-400/20 flex items-center justify-center text-sand-300">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sand-100 text-sm sm:text-base">Content Management Studio</h3>
                {hasUnpublishedChanges ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Unpublished Draft
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={10} />
                    Live in Sync
                  </span>
                )}
              </div>
              <p className="text-[11px] text-sand-400/60">
                {publishedAt ? `Last published: ${new Date(publishedAt).toLocaleString()}` : 'Default seed active'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-sand-400/60 hover:text-sand-200 p-1.5 rounded-lg hover:bg-charcoal-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-b border-emerald-800/40'
                : 'bg-rose-950/60 text-rose-300 border-b border-rose-800/40'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="px-6 border-b border-charcoal-800 flex items-center gap-2 bg-charcoal-900/90 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('banner')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'banner'
                ? 'border-sand-300 text-sand-100 font-bold'
                : 'border-transparent text-sand-400/60 hover:text-sand-300'
            }`}
          >
            <Megaphone size={14} />
            <span>Announcement Banner</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-sand-300 text-sand-100 font-bold'
                : 'border-transparent text-sand-400/60 hover:text-sand-300'
            }`}
          >
            <DollarSign size={14} />
            <span>Pricing Packages</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'hero'
                ? 'border-sand-300 text-sand-100 font-bold'
                : 'border-transparent text-sand-400/60 hover:text-sand-300'
            }`}
          >
            <LayoutTemplate size={14} />
            <span>Hero & Copy</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'faqs'
                ? 'border-sand-300 text-sand-100 font-bold'
                : 'border-transparent text-sand-400/60 hover:text-sand-300'
            }`}
          >
            <HelpCircle size={14} />
            <span>FAQs Accordion</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-sand-200">
          {/* TAB 1: BANNER */}
          {activeTab === 'banner' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800">
                <div>
                  <h4 className="font-bold text-sand-100 text-sm">Enable Announcement Banner</h4>
                  <p className="text-[11px] text-sand-400/70">
                    When active, a sleek banner appears at the very top of the landing page.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draftContent.banner.enabled}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, enabled: e.target.checked }
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-charcoal-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sand-400"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                    Badge Tag (e.g. &ldquo;LIMITED OFFER&rdquo;, &ldquo;NEW&rdquo;)
                  </label>
                  <input
                    type="text"
                    value={draftContent.banner.badgeText}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, badgeText: e.target.value }
                      }))
                    }
                    placeholder="EARLY ACCESS"
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                    Color Accent Theme
                  </label>
                  <select
                    value={draftContent.banner.variant}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, variant: e.target.value as any }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  >
                    <option value="gold">Luxury Gold / Sand</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="amber">Warm Amber</option>
                    <option value="charcoal">Minimal Charcoal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                  Banner Announcement Message
                </label>
                <input
                  type="text"
                  value={draftContent.banner.messageText}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      banner: { ...prev.banner, messageText: e.target.value }
                    }))
                  }
                  placeholder="Claim 30% off Creator Pro with code FOUNDER30 for a limited time."
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={draftContent.banner.ctaText}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, ctaText: e.target.value }
                      }))
                    }
                    placeholder="Claim Offer →"
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                    Target URL (e.g. &ldquo;#pricing&rdquo; or custom link)
                  </label>
                  <input
                    type="text"
                    value={draftContent.banner.ctaUrl}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, ctaUrl: e.target.value }
                      }))
                    }
                    placeholder="#pricing"
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">Section Badge</label>
                  <input
                    type="text"
                    value={draftContent.pricing.badgeText}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pricing: { ...prev.pricing, badgeText: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">Section Headline</label>
                  <input
                    type="text"
                    value={draftContent.pricing.title}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pricing: { ...prev.pricing, title: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">Annual Savings Tag</label>
                  <input
                    type="text"
                    value={draftContent.pricing.billingDiscountBadge}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pricing: { ...prev.pricing, billingDiscountBadge: e.target.value }
                      }))
                    }
                    placeholder="Save 20%"
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>
              </div>

              {/* Package Tiers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sand-100 text-sm">Package Tiers ({draftContent.pricing.packages.length})</h4>
                  <button
                    onClick={() => {
                      const newPkg: CmsPricingPackage = {
                        id: `pkg-${Date.now()}`,
                        name: 'New Tier',
                        tagline: 'Description of who this tier is for.',
                        priceMonthly: 49,
                        priceAnnual: 39,
                        currency: 'USD',
                        isPopular: false,
                        ctaText: 'Choose Plan',
                        ctaUrl: '#auth',
                        features: ['Custom feature 1', 'Custom feature 2']
                      };
                      updateDraft((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          packages: [...prev.pricing.packages, newPkg]
                        }
                      }));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sand-400/15 hover:bg-sand-400/25 text-sand-200 border border-sand-400/30 font-semibold text-xs transition-colors"
                  >
                    <Plus size={12} />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {draftContent.pricing.packages.map((pkg, pIdx) => (
                    <div
                      key={pkg.id || pIdx}
                      className={`p-4 rounded-xl border bg-charcoal-950/90 space-y-3 relative ${
                        pkg.isPopular ? 'border-sand-400/50' : 'border-charcoal-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const pkgs = [...prev.pricing.packages];
                              pkgs[pIdx] = { ...pkgs[pIdx], name: val };
                              return { ...prev, pricing: { ...prev.pricing, packages: pkgs } };
                            });
                          }}
                          placeholder="Tier Name"
                          className="font-bold text-sm text-sand-100 bg-transparent border-b border-charcoal-700 focus:outline-none focus:border-sand-400 px-1 py-0.5"
                        />

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-[10px] text-sand-300 font-mono">
                            <input
                              type="checkbox"
                              checked={pkg.isPopular}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                updateDraft((prev) => {
                                  const pkgs = [...prev.pricing.packages];
                                  pkgs[pIdx] = { ...pkgs[pIdx], isPopular: checked };
                                  return { ...prev, pricing: { ...prev.pricing, packages: pkgs } };
                                });
                              }}
                              className="rounded border-charcoal-700"
                            />
                            Popular
                          </label>

                          {draftContent.pricing.packages.length > 1 && (
                            <button
                              onClick={() => {
                                updateDraft((prev) => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    packages: prev.pricing.packages.filter((_, i) => i !== pIdx)
                                  }
                                }));
                              }}
                              className="text-rose-400/70 hover:text-rose-300 p-1"
                              title="Delete tier"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={pkg.tagline}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const pkgs = [...prev.pricing.packages];
                            pkgs[pIdx] = { ...pkgs[pIdx], tagline: val };
                            return { ...prev, pricing: { ...prev.pricing, packages: pkgs } };
                          });
                        }}
                        placeholder="Tagline / target audience"
                        className="w-full text-[11px] text-sand-400/80 bg-charcoal-900 border border-charcoal-800 rounded px-2 py-1"
                      />

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="text-zinc-400 block mb-0.5">Monthly Price ($)</label>
                          <input
                            type="number"
                            value={pkg.priceMonthly}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateDraft((prev) => {
                                const pkgs = [...prev.pricing.packages];
                                pkgs[pIdx] = { ...pkgs[pIdx], priceMonthly: val };
                                return { ...prev, pricing: { ...prev.pricing, packages: pkgs } };
                              });
                            }}
                            className="w-full bg-charcoal-900 border border-charcoal-800 rounded px-2 py-1 text-sand-100 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-zinc-400 block mb-0.5">Annual Price / Mo ($)</label>
                          <input
                            type="number"
                            value={pkg.priceAnnual}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateDraft((prev) => {
                                const pkgs = [...prev.pricing.packages];
                                pkgs[pIdx] = { ...pkgs[pIdx], priceAnnual: val };
                                return { ...prev, pricing: { ...prev.pricing, packages: pkgs } };
                              });
                            }}
                            className="w-full bg-charcoal-900 border border-charcoal-800 rounded px-2 py-1 text-sand-100 font-mono"
                          />
                        </div>
                      </div>

                      {/* Features bullets */}
                      <div className="space-y-1.5 pt-2 border-t border-charcoal-800">
                        <label className="text-[10px] uppercase font-bold text-sand-400/70 block">
                          Feature Checklist
                        </label>
                        {pkg.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const pkgs = [...prev.pricing.packages];
                                  const feats = [...pkgs[pIdx].features];
                                  feats[fIdx] = val;
                                  pkgs[pIdx] = { ...pkgs[pIdx], features: feats };
                                  return { ...prev, pricing: { ...prev.pricing, packages: pkgs } };
                                });
                              }}
                              className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded px-2 py-0.5 text-[11px] text-sand-200"
                            />
                            <button
                              onClick={() => {
                                updateDraft((prev) => {
                                  const pkgs = [...prev.pricing.packages];
                                  const feats = pkgs[pIdx].features.filter((_, i) => i !== fIdx);
                                  pkgs[pIdx] = { ...pkgs[pIdx], features: feats };
                                  return { ...prev, pricing: { ...prev.pricing, packages: pkgs } };
                                });
                              }}
                              className="text-sand-400/50 hover:text-rose-400 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            updateDraft((prev) => {
                              const pkgs = [...prev.pricing.packages];
                              pkgs[pIdx] = {
                                ...pkgs[pIdx],
                                features: [...pkgs[pIdx].features, 'New feature bullet']
                              };
                              return { ...prev, pricing: { ...prev.pricing, packages: pkgs } };
                            });
                          }}
                          className="text-[10px] text-sand-400 hover:text-sand-200 flex items-center gap-1 pt-1 font-semibold"
                        >
                          <Plus size={10} /> Add bullet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HERO & COPY */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                  Hero Badge (Pill at top of hero)
                </label>
                <input
                  type="text"
                  value={draftContent.hero.badgeText}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, badgeText: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                    Headline Highlight Phrase (e.g. &ldquo;Run Your Creator Career&rdquo;)
                  </label>
                  <input
                    type="text"
                    value={draftContent.hero.titleHighlight}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, titleHighlight: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                    Headline Main Text (e.g. &ldquo;Like a Fortune 500 Enterprise&rdquo;)
                  </label>
                  <input
                    type="text"
                    value={draftContent.hero.titleMain}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, titleMain: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                  Hero Subtitle Description
                </label>
                <textarea
                  rows={3}
                  value={draftContent.hero.subtitle}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={draftContent.hero.primaryCtaText}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, primaryCtaText: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-sand-300 mb-1">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={draftContent.hero.secondaryCtaText}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, secondaryCtaText: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-sand-100 focus:outline-none focus:border-sand-400/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sand-100 text-sm">FAQ Accordion Items ({draftContent.faqs.length})</h4>
                <button
                  onClick={() => {
                    const newFaq: CmsFaqItem = {
                      id: `faq-${Date.now()}`,
                      question: 'New Question?',
                      answer: 'Clear, concise answer explaining the benefit to the creator or sponsor.'
                    };
                    updateDraft((prev) => ({
                      ...prev,
                      faqs: [...prev.faqs, newFaq]
                    }));
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sand-400/15 hover:bg-sand-400/25 text-sand-200 border border-sand-400/30 font-semibold text-xs transition-colors"
                >
                  <Plus size={12} />
                  <span>Add FAQ Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {draftContent.faqs.map((faq, idx) => (
                  <div key={faq.id || idx} className="p-4 rounded-xl border border-charcoal-800 bg-charcoal-950/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-sand-400/60 font-bold">#{idx + 1}</span>
                      <button
                        onClick={() => {
                          updateDraft((prev) => ({
                            ...prev,
                            faqs: prev.faqs.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="text-rose-400/60 hover:text-rose-300 p-1"
                        title="Delete question"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => {
                          const items = [...prev.faqs];
                          items[idx] = { ...items[idx], question: val };
                          return { ...prev, faqs: items };
                        });
                      }}
                      placeholder="Frequently asked question"
                      className="w-full px-3 py-1.5 rounded-lg bg-charcoal-900 border border-charcoal-800 text-sand-100 font-semibold text-xs focus:outline-none focus:border-sand-400"
                    />

                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => {
                          const items = [...prev.faqs];
                          items[idx] = { ...items[idx], answer: val };
                          return { ...prev, faqs: items };
                        });
                      }}
                      placeholder="Detailed answer..."
                      className="w-full px-3 py-1.5 rounded-lg bg-charcoal-900 border border-charcoal-800 text-sand-300/80 text-xs focus:outline-none focus:border-sand-400 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-4 border-t border-charcoal-800 bg-charcoal-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3 py-1.5 rounded-xl border border-charcoal-800 hover:border-charcoal-700 bg-charcoal-900 text-sand-400 hover:text-sand-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Discard unpublished draft changes"
            >
              <RotateCcw size={13} />
              <span>Discard Draft</span>
            </button>

            <button
              type="button"
              onClick={handleTogglePreview}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                previewMode
                  ? 'bg-sand-400 text-charcoal-950 border-sand-300 font-bold'
                  : 'bg-charcoal-900 border-charcoal-800 text-sand-300 hover:border-sand-400/40 hover:text-sand-100'
              }`}
            >
              <Eye size={13} />
              <span>{previewMode ? 'Exit Preview' : 'Live Preview'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-4 py-2 rounded-xl border border-charcoal-700 bg-charcoal-850 hover:bg-charcoal-800 text-sand-200 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save size={13} />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              type="button"
              disabled={publishing}
              onClick={handlePublish}
              className="px-5 py-2 rounded-xl bg-sand-200 hover:bg-sand-100 text-charcoal-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Globe size={14} />
              <span>{publishing ? 'Publishing...' : 'Publish to Live'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
