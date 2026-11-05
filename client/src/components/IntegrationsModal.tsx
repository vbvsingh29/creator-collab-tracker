import React, { useState, useEffect } from 'react';
import { X, Youtube, Instagram, CheckCircle2, AlertCircle, Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { fetchIntegrationsStatus } from '../services/api';

interface IntegrationsModalProps {
  onClose: () => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ onClose }) => {
  const [integrations, setIntegrations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrationsStatus()
      .then(setIntegrations)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Live Integrations & API Health Center</h3>
              <p className="text-[11px] text-zinc-400">Status, quotas, and active tracking capabilities</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Checking integration status...</div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* 1. YouTube Integration Card */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    <Youtube size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">YouTube Integration</h4>
                    <span className="text-[10px] text-zinc-400">Data API v3 & oEmbed Protocol</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    integrations?.youtube?.hasKey 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}>
                    {integrations?.youtube?.statusLabel || 'Active (Zero-Key Mode)'}
                  </span>
                </div>
              </div>

              {/* Quota & Mode Info */}
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Free Daily Quota:</span>
                <span className="font-bold text-emerald-400">{integrations?.youtube?.quota || '10,000 checks/day'}</span>
              </div>

              {/* Active Features Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Real-Time Views Counter</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Real-Time Likes & Comments</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>oEmbed Video Title & Channel</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>In-App Responsive Player</span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-800/80 pt-2">
                💡 {integrations?.youtube?.hint}
              </p>
            </div>

            {/* 2. Instagram Integration Card */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <Instagram size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Instagram Integration</h4>
                    <span className="text-[10px] text-zinc-400">Open Graph & Meta Reel Embed Protocol</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    integrations?.instagram?.hasKey
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                  }`}>
                    {integrations?.instagram?.statusLabel || 'Public Open Graph Active'}
                  </span>
                </div>
              </div>

              {/* Active Features Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Native Meta Reel Embed Player</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Public Likes & Comments Inspector</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>#ad Disclosure Tag Verification</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Engagement Rate Calculator</span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-800/80 pt-2">
                💡 {integrations?.instagram?.hint}
              </p>
            </div>

            {/* 3. In-App Embed Video & Reel Players */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <div>
                  <span className="font-semibold text-zinc-200">Native In-App Content Players</span>
                  <p className="text-[10px] text-zinc-500">Play live YouTube videos and Instagram Reels directly inside deals</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Operational
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
