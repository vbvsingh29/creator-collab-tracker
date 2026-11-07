import React, { useState } from 'react';
import { 
  Zap, 
  Sun, 
  Moon, 
  Activity, 
  Menu, 
  X, 
  User
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LandingNavbarProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
  onOpenAdmin: () => void;
  onOpenRateCalculatorModal?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onOpenAuth,
  onDemoLogin,
  onOpenAdmin,
}) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200/90 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-zinc-900 border border-slate-800 flex items-center justify-center text-white shadow-xs">
              <span className="font-extrabold text-xs tracking-tight">CF</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-zinc-100">
                  CollabFlow
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  OS 2.5
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                Creator Sponsorship System
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-zinc-400">
            <button 
              onClick={() => scrollTo('features')} 
              className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollTo('live-preview')} 
              className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              Live Preview
            </button>
            <button 
              onClick={() => scrollTo('calculator')} 
              className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              Rate Calculator
            </button>
            <button 
              onClick={() => scrollTo('pricing')} 
              className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollTo('faq')} 
              className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              FAQ
            </button>
          </nav>
        </div>

        {/* Action Controls & CTAs */}
        <div className="flex items-center gap-2.5">
          {/* Admin Observatory Pill */}
          <button
            onClick={onOpenAdmin}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 text-xs font-semibold text-teal-800 dark:text-teal-300 transition-all shadow-xs"
            title="Open Platform Telemetry & GDPR-Safe Monitoring"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Activity size={12} className="text-teal-600" />
            <span>Admin Gate</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-slate-700" />
            )}
          </button>

          {/* 1-Click Instant Demo Button */}
          <button
            onClick={() => onDemoLogin('aarav@tech.com')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition-all shadow-xs active:scale-95"
            title="Experience the complete app instantly with pre-loaded sponsor deals"
          >
            <Zap size={13} className="text-amber-500 fill-amber-500" />
            <span className="hidden sm:inline">1-Click Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Sign In Button */}
          <button
            onClick={onOpenAuth}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <User size={13} />
            <span>Sign In</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 text-xs font-semibold text-slate-700 shadow-xl">
          <button onClick={() => scrollTo('features')} className="block w-full text-left py-2 hover:text-slate-900">
            Features
          </button>
          <button onClick={() => scrollTo('live-preview')} className="block w-full text-left py-2 hover:text-slate-900">
            Live Preview
          </button>
          <button onClick={() => scrollTo('calculator')} className="block w-full text-left py-2 hover:text-slate-900">
            Rate Calculator
          </button>
          <button onClick={() => scrollTo('pricing')} className="block w-full text-left py-2 hover:text-slate-900">
            Pricing
          </button>
          <button onClick={() => scrollTo('faq')} className="block w-full text-left py-2 hover:text-slate-900">
            FAQ
          </button>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-center font-semibold"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
