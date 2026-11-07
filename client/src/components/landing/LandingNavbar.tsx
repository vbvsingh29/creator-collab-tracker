import React, { useState } from 'react';
import { 
  Instagram, 
  Youtube, 
  Sparkles, 
  Zap, 
  Sun, 
  Moon, 
  Activity, 
  ArrowRight, 
  Menu, 
  X, 
  ShieldCheck,
  Calculator,
  ChevronRight
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                  CF
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                  CollabFlow
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  OS 2.5
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium hidden sm:inline">
                Creator Sponsorship System
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <button 
              onClick={() => scrollTo('features')} 
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollTo('live-preview')} 
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Live Command Center
            </button>
            <button 
              onClick={() => scrollTo('calculator')} 
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Rate Estimator
            </button>
            <button 
              onClick={() => scrollTo('pricing')} 
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollTo('faq')} 
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
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
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-xs font-semibold text-teal-700 dark:text-teal-300 transition-all shadow-xs"
            title="Open Platform Telemetry & GDPR-Safe Monitoring"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Activity size={12} className="text-teal-500" />
            <span>Admin Gate</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-indigo-600" />
            )}
          </button>

          {/* 1-Click Instant Demo Button */}
          <button
            onClick={() => onDemoLogin('aarav@tech.com')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 hover:from-indigo-500/25 hover:to-pink-500/25 border border-indigo-500/30 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-all shadow-xs active:scale-95"
            title="Experience the complete app instantly with pre-loaded sponsor deals"
          >
            <Zap size={13} className="text-amber-500 fill-amber-500 animate-bounce" />
            <span className="hidden sm:inline">1-Click Live Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Standard Sign In */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <span>Sign In</span>
            <ChevronRight size={13} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            <button
              onClick={() => scrollTo('features')}
              className="p-2 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              ✨ Features
            </button>
            <button
              onClick={() => scrollTo('live-preview')}
              className="p-2 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              💻 Live Preview
            </button>
            <button
              onClick={() => scrollTo('calculator')}
              className="p-2 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              💰 Rate Estimator
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className="p-2 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              💳 Pricing Plans
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1.5"
            >
              <Activity size={13} />
              <span>Admin Observatory</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onDemoLogin('priya@lifestyle.com');
              }}
              className="text-xs text-pink-600 dark:text-pink-400 font-semibold flex items-center gap-1"
            >
              <Instagram size={12} />
              <span>Priya Demo</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
