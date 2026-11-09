import React, { useState, useEffect } from 'react';
import { 
  X, 
  Youtube, 
  Instagram, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Play, 
  Eye, 
  Heart,
  Bot
} from 'lucide-react';
import { fetchIntegrationsStatus, apiTestMediaUrl, apiVerifyInstagramToken, apiSaveInstagramToken, apiDisconnectInstagram } from '../services/api';
import confetti from 'canvas-confetti';

interface IntegrationsModalProps {
  onClose: () => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ onClose }) => {
  const [integrations, setIntegrations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Live URL Tester State
  const [testUrl, setTestUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Meta Graph API Token Setup State
  const [showIgConfig, setShowIgConfig] = useState(false);
  const [igTokenInput, setIgTokenInput] = useState('');
  const [igAccountIdInput, setIgAccountIdInput] = useState('');
  const [igTesting, setIgTesting] = useState(false);
  const [igFeedback, setIgFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchIntegrationsStatus()
      .then(setIntegrations)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleConnectInstagram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!igTokenInput.trim()) return;

    setIgTesting(true);
    setIgFeedback(null);

    try {
      // 1. Verify token with Meta API
      const verifyRes = await apiVerifyInstagramToken(igTokenInput.trim(), igAccountIdInput.trim() || undefined);
      // 2. Save token
      await apiSaveInstagramToken(igTokenInput.trim(), verifyRes.accountId || igAccountIdInput.trim() || undefined);
      setIgFeedback({
        type: 'success',
        message: `✓ Verified & Connected to ${verifyRes.name || 'Instagram Business Account'}! Lifetime views, plays, and reach are now active.`
      });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setIgTokenInput('');
      const updated = await fetchIntegrationsStatus();
      setIntegrations(updated);
    } catch (err: any) {
      setIgFeedback({
        type: 'error',
        message: err.message || 'Meta Graph API token verification failed. Please verify token permissions.'
      });
    } finally {
      setIgTesting(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    try {
      await apiDisconnectInstagram();
      setIgFeedback({
        type: 'success',
        message: 'Instagram Meta Graph API disconnected.'
      });
      const updated = await fetchIntegrationsStatus();
      setIntegrations(updated);
    } catch (err: any) {
      setIgFeedback({
        type: 'error',
        message: err.message || 'Failed to disconnect.'
      });
    }
  };

  const handleRunTest = async (urlToTest?: string) => {
    const target = (urlToTest || testUrl).trim();
    if (!target) return;

    setTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await apiTestMediaUrl(target);
      setTestResult(res.data);
    } catch (err: any) {
      setTestError(err.message || 'Could not verify content URL. Please check link format.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-zinc-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Live Integrations & API Health Center</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">YouTube, Instagram, and AI Reel Pitch engines</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            <X size={16} />
          </button>
        </div>

        {/* Live URL Testing Playground */}
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              Live YouTube & Instagram URL Tester
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">Verify Real-Time Fetch</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste any YouTube video/Shorts or Instagram Reel link..."
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              onClick={() => handleRunTest()}
              disabled={testing || !testUrl.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-all shrink-0"
            >
              {testing ? 'Testing...' : 'Test Live'}
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="text-zinc-500">Quick Test Samples:</span>
            <button
              type="button"
              onClick={() => {
                const sample = 'https://youtube.com/watch?v=dQw4w9WgXcQ';
                setTestUrl(sample);
                handleRunTest(sample);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium"
            >
              <Youtube size={11} /> Sample YouTube Video
            </button>
            <button
              type="button"
              onClick={() => {
                const sample = 'https://instagram.com/reel/C2bN8k9PxZ3';
                setTestUrl(sample);
                handleRunTest(sample);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 transition-colors font-medium"
            >
              <Instagram size={11} /> Sample Instagram Reel
            </button>
          </div>

          {/* Live Test Results Display */}
          {testError && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-300 text-xs">
              {testError}
            </div>
          )}

          {testResult && (
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  <CheckCircle2 size={11} /> {testResult.platform} Verified
                </span>
                {testResult.hasAdDisclosure && (
                  <span className="text-[10px] font-bold text-amber-500">
                    #ad Disclosure Found ✓
                  </span>
                )}
              </div>

              <div className="flex gap-3 items-start">
                {testResult.thumbnailUrl && (
                  <img 
                    src={testResult.thumbnailUrl} 
                    alt="Thumbnail" 
                    className="w-20 h-14 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0" 
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-white line-clamp-1">{testResult.title}</h4>
                  <p className="text-[11px] text-zinc-500">Creator: {testResult.authorName}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                      <Eye size={12} className="text-indigo-500" />
                      {testResult.viewsCount ? testResult.viewsCount.toLocaleString() : 'Ready to sync'} Views
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-pink-600 dark:text-pink-400">
                      <Heart size={12} />
                      {testResult.likesCount ? testResult.likesCount.toLocaleString() : 'Ready'} Likes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Integration Status Cards */}
        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-500">Checking integration status...</div>
        ) : (
          <div className="space-y-3.5 text-xs">
            {/* 1. YouTube Integration Card */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                    <Youtube size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white">YouTube Integration</h4>
                    <span className="text-[10px] text-zinc-500">Data API v3 & oEmbed Protocol</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    integrations?.youtube?.hasKey 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20'
                  }`}>
                    {integrations?.youtube?.statusLabel || 'Active (Zero-Key Mode)'}
                  </span>
                </div>
              </div>

              {/* Active Features Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Real-Time Views Counter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Real-Time Likes & Comments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>oEmbed Video Title & Channel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>In-App Responsive Player</span>
                </div>
              </div>
            </div>

            {/* 2. Instagram Integration Card */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20">
                    <Instagram size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white">Instagram Integration</h4>
                    <span className="text-[10px] text-zinc-500">Meta Graph API & Real Lifetime Insights</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    integrations?.instagram?.hasKey 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20'
                  }`}>
                    {integrations?.instagram?.hasKey ? 'Meta Graph API Connected' : 'Open Graph Crawler Mode'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowIgConfig(!showIgConfig)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
                  >
                    {integrations?.instagram?.hasKey ? 'Manage Token' : 'Connect Meta API'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Real Lifetime Views & Plays {integrations?.instagram?.hasKey && <strong className="text-emerald-400 text-[10px]">(Active)</strong>}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Real Lifetime Reach & Impressions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Native Meta Reel Embed Player</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>#ad Disclosure Verification</span>
                </div>
              </div>

              {/* Collapsible Meta Graph API Token Connection Box */}
              {showIgConfig && (
                <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles size={13} className="text-pink-500" />
                      Configure Meta Graph API Access Key
                    </h5>
                    {integrations?.instagram?.hasKey && (
                      <button
                        type="button"
                        onClick={handleDisconnectInstagram}
                        className="text-[10px] text-red-500 hover:text-red-400 underline font-semibold"
                      >
                        Disconnect Token
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Connecting your Meta Graph API Access Token activates <strong>real lifetime plays, views, reach, and engagement data</strong> for all your Instagram Reels without public scraping limitations.
                  </p>

                  {igFeedback && (
                    <div className={`p-2.5 rounded-lg text-xs font-medium border ${
                      igFeedback.type === 'success'
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/30 border-red-500/40 text-red-300'
                    }`}>
                      {igFeedback.message}
                    </div>
                  )}

                  <form onSubmit={handleConnectInstagram} className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        Meta Graph API Access Token *
                      </label>
                      <input
                        type="password"
                        required
                        value={igTokenInput}
                        onChange={(e) => setIgTokenInput(e.target.value)}
                        placeholder="EAA..."
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        Generate a User or Page Access Token from <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Meta Graph API Explorer</a> with <code className="text-[10px] text-pink-400">instagram_basic</code> & <code className="text-[10px] text-pink-400">instagram_manage_insights</code> permissions.
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        Instagram Account ID (Optional — auto-detected if empty)
                      </label>
                      <input
                        type="text"
                        value={igAccountIdInput}
                        onChange={(e) => setIgAccountIdInput(e.target.value)}
                        placeholder="e.g. 17841405309211993"
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowIgConfig(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={igTesting || !igTokenInput.trim()}
                        className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors shadow-xs"
                      >
                        {igTesting ? 'Verifying with Meta...' : 'Verify & Connect Meta API'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* 3. AI Pitch & Reel Intelligence Studio Card */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white">AI Pitch & Reel Intelligence Studio</h4>
                    <span className="text-[10px] text-zinc-500">Google Gemini 1.5 Flash Free API & Smart Engine</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                    {integrations?.aiPitchEngine?.statusLabel || 'Gemini 1.5 & Built-in Engine Active'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Reel-Wise Historical Summarizer</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Future Pitch Proposal Builder</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Automated Multi-Touch Bundles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Free Google Gemini API Support</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
