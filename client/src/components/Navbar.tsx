import React, { useState } from 'react';
import { 
  Instagram, 
  Youtube, 
  Plus, 
  Calculator, 
  ShieldAlert, 
  Building2, 
  Kanban, 
  TableProperties,
  LayoutGrid,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Zap
} from 'lucide-react';
import { Currency, User } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  appMode: 'simple' | 'advanced';
  setAppMode: (mode: 'simple' | 'advanced') => void;
  currentView: 'kanban' | 'table' | 'cards';
  setCurrentView: (view: 'kanban' | 'table' | 'cards') => void;
  simpleLayout?: 'cards' | 'table';
  setSimpleLayout?: (layout: 'cards' | 'table') => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenNewCollab: () => void;
  onOpenRateCard: () => void;
  onOpenExclusivity: () => void;
  onOpenBrands: () => void;
  onOpenIntegrations: () => void;
  conflictCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  appMode,
  setAppMode,
  currentView,
  setCurrentView,
  simpleLayout = 'cards',
  setSimpleLayout,
  currency,
  setCurrency,
  onOpenNewCollab,
  onOpenRateCard,
  onOpenExclusivity,
  onOpenBrands,
  onOpenIntegrations,
  conflictCount
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
      {/* Brand & Platform Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-inner">
            <span className="font-extrabold text-sm tracking-tighter bg-gradient-to-br from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              CF
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                CollabFlow
              </h1>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                appMode === 'simple'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {appMode === 'simple' ? 'Simple Mode' : 'Advanced Mode'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-pink-400">
                <Instagram size={11} /> Instagram
              </span>
              <span className="text-zinc-600">•</span>
              <span className="inline-flex items-center gap-0.5 text-red-400">
                <Youtube size={11} /> YouTube
              </span>
            </p>
          </div>
        </div>

        {/* View Switcher: Board vs Table vs Cards Grid (Shown in Advanced Mode) */}
        {appMode === 'advanced' && (
          <div className="ml-6 hidden md:flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'kanban'
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Kanban size={13} />
              Pipeline Board
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'table'
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TableProperties size={13} />
              Data Table
            </button>
            <button
              onClick={() => setCurrentView('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'cards'
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid size={13} />
              Cards Grid
            </button>
          </div>
        )}

        {/* View Switcher in Simple Mode: Cards vs Simple Table */}
        {appMode === 'simple' && setSimpleLayout && (
          <div className="ml-6 hidden sm:flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setSimpleLayout('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                simpleLayout === 'cards'
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid size={13} />
              Cards
            </button>
            <button
              onClick={() => setSimpleLayout('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                simpleLayout === 'table'
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TableProperties size={13} />
              Simple Table
            </button>
          </div>
        )}
      </div>

      {/* Right Tools, Mode Toggle & Creator Profile */}
      <div className="flex items-center gap-2.5">
        {/* SIMPLE vs ADVANCED MODE TOGGLE */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setAppMode('simple')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
              appMode === 'simple'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Clean, minimal view with only essential details"
          >
            <span>Simple</span>
          </button>
          <button
            onClick={() => setAppMode('advanced')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
              appMode === 'advanced'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Full agency suite: Whitelisting, Exclusivity Radar, Rate Calculator, Kanban"
          >
            <Zap size={11} />
            <span>Advanced</span>
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setCurrency('INR')}
            className={`px-2 py-1 rounded-md transition-colors ${
              currency === 'INR' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ₹
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2 py-1 rounded-md transition-colors ${
              currency === 'USD' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            $
          </button>
        </div>

        {/* Tools (Only visible in Advanced Mode to avoid clutter in Simple Mode) */}
        {appMode === 'advanced' && (
          <>
            {/* Live Integrations Health Status Pill */}
            <button
              onClick={onOpenIntegrations}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
              title="Live YouTube & Instagram API Health Status"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Integrations</span>
            </button>

            {/* Exclusivity Collision Radar Button */}
            <button
              onClick={onOpenExclusivity}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors relative"
              title="Exclusivity Conflict Scanner"
            >
              <ShieldAlert size={14} className={conflictCount > 0 ? "text-amber-400" : "text-zinc-400"} />
              <span className="hidden sm:inline">Exclusivity Radar</span>
              {conflictCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            {/* Dynamic Rate Card Calculator */}
            <button
              onClick={onOpenRateCard}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
              title="Dynamic Scope & Rate Card Calculator"
            >
              <Calculator size={14} className="text-indigo-400" />
              <span className="hidden sm:inline">Rate Card</span>
            </button>

            {/* Brand Directory */}
            <button
              onClick={onOpenBrands}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
              title="Brand CRM Directory"
            >
              <Building2 size={14} className="text-zinc-400" />
              <span className="hidden sm:inline">Brands</span>
            </button>
          </>
        )}

        {/* New Collab CTA */}
        <button
          onClick={onOpenNewCollab}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Collab</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* Creator Auth Profile / Switcher */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-6 h-6 rounded-full bg-zinc-800"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-zinc-200 leading-none">{user.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono leading-none mt-0.5">{user.handle}</div>
              </div>
              <ChevronDown size={12} className="text-zinc-500 ml-0.5" />
            </button>

            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 text-xs"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-zinc-800">
                  <div className="font-bold text-zinc-200">{user.name}</div>
                  <div className="text-[11px] text-zinc-400">{user.email}</div>
                  <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{user.handle}</div>
                </div>

                <button
                  onClick={onOpenAuth}
                  className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-900 transition-colors flex items-center gap-2"
                >
                  <UserIcon size={13} />
                  <span>Switch Creator Account</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/20 transition-colors flex items-center gap-2 border-t border-zinc-800/80"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-xs font-semibold text-white"
          >
            <UserIcon size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
