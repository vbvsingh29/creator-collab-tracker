import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface LandingFooterProps {
  onOpenAuth: () => void;
  onDemoLogin?: (email: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenAuth,
}) => {
  return (
    <footer className="bg-charcoal-950 border-t border-charcoal-800/80 text-sand-300/60 text-xs py-12 transition-colors duration-200 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-8 border-b border-charcoal-850">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-charcoal-900 border border-sand-400/30 flex items-center justify-center text-sand-300 font-bold text-xs shadow-md">
              CO
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-sand-100">
                Collabio
              </span>
              <span className="text-sand-400/40 text-[11px]">
                — The Luxury Sponsorship Workspace for Creators
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-6 text-xs font-medium text-sand-300/70">
            <button
              onClick={onOpenAuth}
              className="hover:text-sand-100 transition-colors"
            >
              Register Account
            </button>
            <button
              onClick={onOpenAuth}
              className="hover:text-sand-100 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-sand-400/50">
          <span>&copy; {new Date().getFullYear()} Collabio. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-sand-400" />
            <span>Encrypted data & private creator workspace</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
