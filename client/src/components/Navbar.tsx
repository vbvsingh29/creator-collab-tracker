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
  Zap,
  Sun,
  Moon,
  Monitor,
  Settings,
  Keyboard,
  Crown,
  ListFilter,
  Bot,
  Activity
} from 'lucide-react';
import { Currency, User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  appMode: 'simple' | 'advanced';
  setAppMode: (mode: 'simple' | 'advanced') => void;
  currentView: 'kanban' | 'table' | 'cards';
  setCurrentView: (view: 'kanban' | 'table' | 'cards') => void;
  simpleLayout?: 'cards' | 'detailed' | 'table';
  setSimpleLayout?: (layout: 'cards' | 'detailed' | 'table') => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenNewCollab: () => void;
  onOpenRateCard: () => void;
  onOpenExclusivity: () => void;
  onOpenBrands: () => void;
  onOpenIntegrations: () => void;
  conflictCount: number;
  onDemoLogin?: (email: string) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
  onOpenPricing?: () => void;
  onOpenMediaKit?: () => void;
  onOpenPitch?: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onDemoLogin,
  onOpenProfile,
  onOpenSettings,
  onOpenShortcuts,
  onOpenPricing,
  onOpenMediaKit,
  onOpenPitch,
  onOpenAdmin,
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
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 transition-colors duration-150">
      {/* Brand & Platform Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center shadow-inner">
            <span className="font-extrabold text-sm tracking-tighter bg-gradient-to-br from-indigo-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">
              CF
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                CollabFlow
              </h1>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border hidden sm:inline-flex ${
                appMode === 'simple'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
              }`}>
                {appMode === 'simple' ? 'Simple Mode' : 'Advanced Mode'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-pink-600 dark:text-pink-400">
                <Instagram size={11} /> Instagram
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">â€¢</span>
              <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400">
                <Youtube size={11} /> YouTube
              </span>
            </p>
          </div>
        </div>

        {/* View Switcher: Board vs Table vs Cards Grid (Shown in Advanced Mode) */}
        {appMode === 'advanced' && (
          <div className="ml-6 hidden md:flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-lg">
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Kanban size={13} />
              Pipeline Board
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <TableProperties size={13} />
              Data Table
            </button>
            <button
              onClick={() => setCurrentView('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid size={13} />
              Cards Grid
            </button>
          </div>
        )}

        {/* View Switcher in Simple Mode: Cards vs Detailed Cards vs Simple Table */}
        {appMode === 'simple' && setSimpleLayout && (
          <div className="ml-6 hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setSimpleLayout('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                simpleLayout === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Clean starter cards"
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setSimpleLayout('detailed')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                simpleLayout === 'detailed'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Detailed cards with checklists, promo codes & quick actions"
            >
              <ListFilter size={13} />
              <span>Detailed</span>
            </button>
            <button
              onClick={() => setSimpleLayout('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                simpleLayout === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Clean spreadsheet data table"
            >
              <TableProperties size={13} />
              <span>Table</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Tools, Mode Toggle & Creator Profile */}
      <div className="flex items-center gap-2">
        {/* SIMPLE vs ADVANCED MODE TOGGLE */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setAppMode('simple')}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-md transition-colors ${
              appMode === 'simple'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Clean, minimal view with only essential details"
          >
            <span>Simple</span>
          </button>
          <button
            onClick={() => setAppMode('advanced')}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-md transition-colors ${
              appMode === 'advanced'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Full agency suite: Whitelisting, Exclusivity Radar, Rate Calculator, Kanban"
          >
            <Zap size={11} className="hidden sm:inline" />
            <span>Adv<span className="hidden sm:inline">anced</span></span>
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setCurrency('INR')}
            className={`px-2 py-1 rounded-md transition-colors ${
              currency === 'INR' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            â‚¹
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2 py-1 rounded-md transition-colors ${
              currency === 'USD' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            $
          </button>
        </div>

        {/* Tools (Only visible in Advanced Mode to avoid clutter in Simple Mode) */}
        {appMode === 'advanced' && (
          <>
            {/* AI Pitch Studio Button */}
            {onOpenPitch && (
              <button
                onClick={onOpenPitch}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-700 dark:text-purple-300 transition-colors shadow-xs"
                title="AI Sponsor Pitch & Multi-Tier Package Studio"
              >
                <Bot size={13} className="text-purple-500" />
                <span className="hidden sm:inline">AI Pitch</span>
              </button>
            )}

            {/* Live Integrations Health Status Pill */}
            <button
              onClick={onOpenIntegrations}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Live YouTube & Instagram API Health Status"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Integrations</span>
            </button>

            {/* Exclusivity Collision Radar Button */}
            <button
              onClick={onOpenExclusivity}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors relative"
              title="Exclusivity Conflict Scanner"
            >
              <ShieldAlert size={14} className={conflictCount > 0 ? "text-amber-500" : "text-zinc-400"} />
              <span className="hidden sm:inline">Exclusivity Radar</span>
              {conflictCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            {/* Dynamic Rate Card Calculator */}
            <button
              onClick={onOpenRateCard}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Dynamic Scope & Rate Card Calculator"
            >
              <Calculator size={14} className="text-indigo-500" />
              <span className="hidden sm:inline">Rate Card</span>
            </button>

            {/* Brand Directory */}
            <button
              onClick={onOpenBrands}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Brand CRM Directory"
            >
              <Building2 size={14} className="text-zinc-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">Brands</span>
            </button>
          </>
        )}

        {/* 1-Click Theme Switcher (Light / Dark) */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-xs"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={15} className="text-amber-400" />
          ) : (
            <Moon size={15} className="text-indigo-600" />
          )}
        </button>

        {/* Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="hidden md:flex p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-xs"
            title="Workspace Settings (,)"
          >
            <Settings size={15} />
          </button>
        )}

        {/* Keyboard Shortcuts Button */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-xs text-xs font-medium"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={14} />
            <span className="text-[10px] font-mono font-bold text-zinc-400">?</span>
          </button>
        )}

        {/* Platform Observability / Admin Telemetry */}
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-xs font-semibold text-teal-700 dark:text-teal-300 transition-all shadow-xs"
            title="Platform Admin Observatory (GDPR-Safe Active Users & CTR)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Activity size={13} className="text-teal-500" />
            <span className="hidden sm:inline">Observatory</span>
            <span className="sm:hidden">Admin</span>
          </button>
        )}

        {/* Upgrade Pro CTA */}
        {onOpenPricing && (
          <button
            onClick={onOpenPricing}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all shadow-xs"
            title="SaaS Upgrade Plans ($19-$79/mo)"
          >
            <Crown size={13} className="text-amber-500" />
            <span>Upgrade Pro</span>
          </button>
        )}

        {/* New Collab CTA */}
        <button
          onClick={onOpenNewCollab}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={14} />
          <span>New Collab</span>
        </button>

        {/* Creator Auth Profile / Switcher */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
            >
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 object-cover"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-none">{user.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono leading-none mt-0.5">{user.handle}</div>
              </div>
              <ChevronDown size={12} className="text-zinc-500 ml-0.5" />
            </button>

            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 text-zinc-800 dark:text-zinc-200"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{user.name}</div>
                  <div className="text-[11px] text-zinc-500">{user.email}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{user.handle}</div>
                </div>

                {onOpenPricing && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenPricing();
                    }}
                    className="w-full text-left px-3.5 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors flex items-center justify-between font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <Crown size={13} />
                      <span>Upgrade to Pro / Agency</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500">
                      $19/mo
                    </span>
                  </button>
                )}

                {onOpenPitch && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenPitch();
                    }}
                    className="w-full text-left px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
                  >
                    <Bot size={13} className="text-purple-500" />
                    <span>AI Sponsor Pitch Studio</span>
                  </button>
                )}

                {onOpenMediaKit && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenMediaKit();
                    }}
                    className="w-full text-left px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={13} className="text-pink-500" />
                    <span>Media Kit One-Pager</span>
                  </button>
                )}

                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left px-3.5 py-2 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Activity size={13} className="text-teal-500" />
                    <span>Admin Observatory (GDPR)</span>
                  </button>
                )}

                {onOpenProfile && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
                  >
                    <UserIcon size={13} className="text-indigo-500" />
                    <span>My Creator Profile & Kit</span>
                  </button>
                )}

                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full text-left px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
                  >
                    <Settings size={13} className="text-zinc-400" />
                    <span>Workspace Settings</span>
                  </button>
                )}

                {onOpenShortcuts && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenShortcuts();
                    }}
                    className="w-full text-left px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Keyboard size={13} className="text-zinc-400" />
                      <span>Keyboard Shortcuts</span>
                    </div>
                    <kbd className="text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">?</kbd>
                  </button>
                )}

                {/* Inline Theme Switcher Row in Dropdown */}
                <div className="px-3.5 py-2 border-t border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Theme</span>
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-1 rounded ${theme === 'light' ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-xs' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                      title="Light Mode"
                    >
                      <Sun size={12} />
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-1 rounded ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 text-indigo-400 shadow-xs' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                      title="Dark Mode"
                    >
                      <Moon size={12} />
                    </button>
                    <button
                      onClick={() => setTheme('auto')}
                      className={`p-1 rounded ${theme === 'auto' ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                      title="Auto System Mode"
                    >
                      <Monitor size={12} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={onOpenAuth}
                  className="w-full text-left px-3.5 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
                >
                  <UserIcon size={13} />
                  <span>Switch Creator Account</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full text-left px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800/80"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 transition-all shadow-xs"
                title="Platform Admin Observatory (GDPR Telemetry)"
              >
                <Activity size={12} className="text-teal-500" />
                <span className="hidden sm:inline">Observatory</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

            {onOpenMediaKit && (
              <button
                onClick={onOpenMediaKit}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 text-xs font-semibold text-pink-700 dark:text-pink-300 hover:bg-pink-500/20 transition-all shadow-xs"
                title="Creator Media Kit Preview"
              >
                <Sparkles size={12} className="text-pink-500" />
                <span>Media Kit</span>
              </button>
            )}
            <button
              onClick={() => onDemoLogin?.('aarav@tech.com')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/15 to-purple-500/15 hover:from-indigo-500/25 hover:to-purple-500/25 border border-indigo-500/30 text-xs font-semibold text-indigo-600 dark:text-indigo-300 transition-all shadow-xs"
              title="1-Click Instant Demo Login (Aarav Tech)"
            >
              <Zap size={13} className="text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">1-Click Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white"
            >
              <UserIcon size={13} />
              <span>Sign In</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
