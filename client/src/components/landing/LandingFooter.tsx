import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

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
    <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-100">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
              CF
            </div>
            <span className="font-bold text-sm text-slate-900">
              CollabFlow
            </span>
            <span className="text-slate-400 text-[11px]">
              — Sponsorship Management for Creators
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <button
              onClick={() => onDemoLogin('aarav@tech.com')}
              className="hover:text-slate-900 transition-colors"
            >
              1-Click Demo
            </button>
            <button
              onClick={onOpenAuth}
              className="hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-teal-700 transition-colors flex items-center gap-1 text-teal-600"
              >
                <Activity size={12} />
                <span>Admin Gate</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} CollabFlow. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>Encrypted data & private creator workspace</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
