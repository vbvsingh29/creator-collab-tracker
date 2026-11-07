import React from 'react';
import { Youtube, Instagram, ShieldCheck, Activity, Zap, Heart } from 'lucide-react';

interface LandingFooterProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
  onOpenAdmin: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenAuth,
  onDemoLogin,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-200 dark:border-zinc-800">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5">
                <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[6px] flex items-center justify-center">
                  <span className="font-extrabold text-xs bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                    CF
                  </span>
                </div>
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                CollabFlow
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-indigo-500/10 text-indigo-500 font-bold">
                OS 2.5
              </span>
            </div>

            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              The professional sponsorship command center engineered for YouTube & Instagram creators. Built with privacy-by-design, anti-slop ergonomics, and zero static passwords.
            </p>

            <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Strict GDPR Article 25 Financial Isolation</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Product Tools
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onDemoLogin('aarav@tech.com')} className="hover:text-indigo-500 transition-colors">
                  1-Click Live Sandbox
                </button>
              </li>
              <li>
                <a href="#calculator" className="hover:text-indigo-500 transition-colors">
                  Dynamic Rate Card Engine
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-500 transition-colors">
                  Exclusivity Conflict Radar
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-indigo-500 transition-colors">
                  Pricing & SaaS Tiers
                </a>
              </li>
            </ul>
          </div>

          {/* Access & Monitoring */}
          <div className="space-y-2.5">
            <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Platform & Access
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-medium"
                >
                  <Activity size={12} />
                  <span>Admin Telemetry Observatory</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenAuth} className="hover:text-indigo-500 transition-colors">
                  Creator Sign In / Register
                </button>
              </li>
              <li>
                <span className="text-zinc-400">Keyboard Shortcut: Press <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono">o</kbd> for Admin</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} CollabFlow OS. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>Made with</span>
              <Heart size={11} className="text-red-500 fill-red-500" />
              <span>for content creators</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
