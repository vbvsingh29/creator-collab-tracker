import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface LandingFooterProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenAuth,
  onDemoLogin,
}) => {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-850 text-slate-500 dark:text-zinc-400 text-xs py-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-100 dark:border-zinc-850">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xs transition-colors">
              CF
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              CollabFlow
            </span>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
              — Sponsorship Management for Creators
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-zinc-400">
            <button
              onClick={() => onDemoLogin('aarav@tech.com')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              1-Click Demo
            </button>
            <button
              onClick={onOpenAuth}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-zinc-500">
          <span>&copy; {new Date().getFullYear()} CollabFlow. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>Encrypted data & private creator workspace</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
