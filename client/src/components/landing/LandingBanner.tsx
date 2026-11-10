import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Eye } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export const LandingBanner: React.FC = () => {
  const { content, previewMode, setPreviewMode } = useCms();
  const banner = content.banner;

  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if dismissed for session (do not dismiss in preview mode)
    if (!previewMode) {
      const isDismissed = sessionStorage.getItem('collabio_banner_dismissed') === 'true';
      setDismissed(isDismissed);
    } else {
      setDismissed(false);
    }
  }, [previewMode, banner.messageText]);

  const handleDismiss = () => {
    setDismissed(true);
    if (!previewMode) {
      sessionStorage.setItem('collabio_banner_dismissed', 'true');
    }
  };

  // Color variants
  const variantStyles = {
    gold: {
      border: 'border-sand-400/25',
      badge: 'bg-sand-400/15 text-sand-200 border-sand-400/30',
      text: 'text-sand-100',
      cta: 'text-sand-300 hover:text-sand-100 hover:underline',
      icon: 'text-sand-300'
    },
    emerald: {
      border: 'border-emerald-500/25',
      badge: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
      text: 'text-emerald-50',
      cta: 'text-emerald-300 hover:text-emerald-100 hover:underline',
      icon: 'text-emerald-400'
    },
    amber: {
      border: 'border-amber-500/25',
      badge: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
      text: 'text-amber-50',
      cta: 'text-amber-300 hover:text-amber-100 hover:underline',
      icon: 'text-amber-400'
    },
    charcoal: {
      border: 'border-charcoal-700',
      badge: 'bg-charcoal-800 text-sand-200 border-charcoal-600',
      text: 'text-sand-100',
      cta: 'text-sand-300 hover:text-sand-100 hover:underline',
      icon: 'text-sand-400'
    }
  }[banner.variant || 'gold'];

  if (!banner.enabled || dismissed) {
    if (!previewMode) return null;
  }

  return (
    <>
      {/* Preview Mode Ribbon for Admins */}
      {previewMode && (
        <div className="bg-sand-400 text-charcoal-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between sticky top-0 z-[60] shadow-md">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Eye size={14} className="animate-pulse shrink-0" />
            <span>
              <strong>Admin Preview Mode Active:</strong> You are viewing unpublished draft content. Live visitors see published version.
            </span>
          </div>
          <button
            onClick={() => setPreviewMode(false)}
            className="text-[11px] uppercase tracking-wider font-bold bg-charcoal-950 text-sand-200 px-2.5 py-0.5 rounded hover:bg-charcoal-900 transition-colors ml-4 shrink-0"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* Announcement Banner */}
      {banner.enabled && !dismissed && (
        <aside aria-label="Announcement banner" className={`relative z-50 bg-charcoal-950/95 backdrop-blur-md border-b ${variantStyles.border} py-2 px-4 text-xs transition-all`}>
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center justify-center gap-2.5 flex-wrap text-center">
              {banner.badgeText && (
                <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${variantStyles.badge} uppercase tracking-wider`}>
                  <Sparkles size={10} className={variantStyles.icon} />
                  {banner.badgeText}
                </span>
              )}

              <span className={`font-medium text-xs ${variantStyles.text}`}>
                {banner.messageText}
              </span>

              {banner.ctaText && (
                <a
                  href={banner.ctaUrl || '#pricing'}
                  className={`inline-flex items-center gap-1 font-semibold text-xs transition-colors group ${variantStyles.cta}`}
                >
                  <span>{banner.ctaText}</span>
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </a>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="text-sand-400/60 hover:text-sand-200 p-1 rounded-md hover:bg-charcoal-900 transition-colors shrink-0"
              title="Dismiss announcement"
              aria-label="Dismiss banner"
            >
              <X size={14} />
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
