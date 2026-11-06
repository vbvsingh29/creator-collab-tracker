import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, Sparkles } from 'lucide-react';

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(true);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('collabflow_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    // Check if running in standalone mode (PWA installed)
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(checkStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Android / Chrome install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (isStandalone || dismissed) {
    return null;
  }

  // Only show on mobile viewports (< 768px) or when install prompt is available
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setDismissed(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('collabflow_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Floating Bottom Card Banner */}
      <div className="fixed bottom-14 md:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-zinc-900/95 dark:bg-zinc-900/95 border border-zinc-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 p-0.5 shrink-0 shadow-md">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center font-black text-xs text-white">
                CF
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold leading-tight">Install Mobile App</h4>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  Zero App Store
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                Add to home screen for Touch ID unlock, offline access & full-screen view.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
            title="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Download size={13} />
            <span>{isIOS ? 'How to Install on iPhone' : 'Install to Home Screen'}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="py-1.5 px-3 rounded-xl hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition-colors"
          >
            Not now
          </button>
        </div>
      </div>

      {/* iOS Safari 2-Step Popup Guide */}
      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-indigo-400" />
                <h3 className="font-bold text-sm">Add to iPhone Home Screen</h3>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="p-1 rounded-lg text-zinc-400">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Share size={16} />
                </div>
                <div>
                  <div className="font-semibold text-white">Step 1: Tap Share</div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Tap the <strong>Share</strong> button in the bottom Safari toolbar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 shrink-0">
                  <PlusSquare size={16} />
                </div>
                <div>
                  <div className="font-semibold text-white">Step 2: Add to Home Screen</div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Scroll down and tap <strong>'Add to Home Screen'</strong>, then tap <strong>Add</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
