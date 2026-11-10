import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LandingNavbarProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onOpenAuth,
  onDemoLogin,
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
    <header className="sticky top-0 z-40 w-full bg-charcoal-950/80 backdrop-blur-xl border-b border-charcoal-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-charcoal-900 border border-sand-400/30 flex items-center justify-center text-sand-100 shadow-md transition-all group-hover:border-sand-400/60 group-hover:shadow-[0_0_15px_rgba(217,199,178,0.15)]">
              <span className="font-extrabold text-xs tracking-tight text-sand-300">CO</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-sand-100 group-hover:text-sand-200 transition-colors">
                  Collabio
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-charcoal-850 text-sand-300 border border-sand-400/20">
                  OS 2.5
                </span>
              </div>
              <span className="text-[10px] text-sand-300/60 font-medium hidden sm:inline">
                Creator Sponsorship System
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-sand-300/70">
            <button 
              onClick={() => scrollTo('features')} 
              className="hover:text-sand-100 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollTo('calculator')} 
              className="hover:text-sand-100 transition-colors"
            >
              Rate Calculator
            </button>
            <button 
              onClick={() => scrollTo('pricing')} 
              className="hover:text-sand-100 transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollTo('faq')} 
              className="hover:text-sand-100 transition-colors"
            >
              FAQ
            </button>
          </nav>
        </div>

        {/* Action Controls & CTAs */}
        <div className="flex items-center gap-3">
          {/* Sign In Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sand-200 hover:bg-sand-100 text-charcoal-950 text-xs font-semibold shadow-[0_2px_10px_rgba(217,199,178,0.15)] transition-all active:scale-95 hover:shadow-[0_4px_16px_rgba(217,199,178,0.25)]"
          >
            <User size={13} />
            <span>Sign In</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-charcoal-800 text-sand-200 hover:bg-charcoal-900"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-800 bg-charcoal-950/95 backdrop-blur-xl p-4 space-y-3 text-xs font-semibold text-sand-200 shadow-2xl">
          <button onClick={() => scrollTo('features')} className="block w-full text-left py-2 hover:text-sand-100">
            Features
          </button>
          <button onClick={() => scrollTo('calculator')} className="block w-full text-left py-2 hover:text-sand-100">
            Rate Calculator
          </button>
          <button onClick={() => scrollTo('pricing')} className="block w-full text-left py-2 hover:text-sand-100">
            Pricing
          </button>
          <button onClick={() => scrollTo('faq')} className="block w-full text-left py-2 hover:text-sand-100">
            FAQ
          </button>
          <div className="pt-2 border-t border-charcoal-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-2.5 rounded-xl bg-sand-200 text-charcoal-950 text-center font-semibold"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
