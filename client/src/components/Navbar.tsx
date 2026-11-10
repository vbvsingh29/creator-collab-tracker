import React, { useState, useRef, useEffect } from 'react';
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
  Activity,
  Globe,
  Share2,
  Wrench,
  Calendar,
  ShieldCheck,
  Users
} from 'lucide-react';
import { Currency, User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { AccountSwitcher } from './AccountSwitcher';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenTeam?: () => void;
  appMode: 'simple' | 'advanced';
  setAppMode: (mode: 'simple' | 'advanced') => void;
  currentView: 'kanban' | 'table' | 'cards' | 'calendar';
  setCurrentView: (view: 'kanban' | 'table' | 'cards' | 'calendar') => void;
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
  onOpenLandingPreview?: () => void;
  onOpenCms?: () => void;
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
  onOpenLandingPreview,
  onOpenCms,
  onOpenTeam,
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
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'vbvsingh2905@gmail.com' || Boolean(user?.email?.toLowerCase().includes('admin'));
  const { theme, setTheme } = useTheme();

  const toolsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 transition-colors">
      {/* LEFT: Clean Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-zinc-900 border border-slate-800 flex items-center justify-center text-white shadow-xs">
            <span className="font-extrabold text-xs tracking-tight">CO</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Collabio
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hidden sm:inline">
                {isAdmin ? 'Admin' : appMode === 'simple' ? 'Starter' : 'Agency'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:flex items-center gap-1.5">
              <span>Creator Sponsorship System</span>
            </p>
          </div>
        </div>

        {/* Multi-Account Channel Switcher */}
        {user && (
          <div className="hidden lg:block ml-2">
            <AccountSwitcher />
          </div>
        )}

        {/* CENTER-LEFT: Pipeline Core Tabs */}
        <div className="ml-4 hidden md:flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold">
          {/* Kanban ONLY in Advanced Mode as explicitly requested by user */}
          {appMode === 'advanced' && (
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban size={13} />
              <span>Kanban Board</span>
            </button>
          )}

          <button
            onClick={() => setCurrentView('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'cards'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid size={13} />
            <span>{appMode === 'simple' ? 'Deals Pipeline' : 'Cards'}</span>
          </button>

          <button
            onClick={() => setCurrentView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'table'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TableProperties size={13} />
            <span>Deliverables & Payouts</span>
          </button>

          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'calendar'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* RIGHT: Primary Action, Secondary Tools Drawer, and Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* In-App Notification Center */}
        {user && <NotificationCenter onRefreshData={onOpenTeam} />}

        {/* PRIMARY CTA: + New Deal */}
        <button
          onClick={onOpenNewCollab}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus size={14} />
          <span>New Deal</span>
        </button>

        {/* SECONDARY TOOLS: Distilled into Single Clean Menu */}
        <div className="relative" ref={toolsRef}>
          <button
            onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all relative ${
              toolsDropdownOpen
                ? 'bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white'
                : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70'
            }`}
            title="Creator Secondary Tools (Rate Card, Exclusivity, Brands, Integrations)"
          >
            <Wrench size={13} className="text-slate-600 dark:text-zinc-400" />
            <span className="hidden sm:inline">Tools</span>
            {conflictCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
            )}
            <ChevronDown size={11} className="text-slate-400 ml-0.5" />
          </button>

          {toolsDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 text-slate-800 dark:text-zinc-200">
              {/* Quick Currency Selector inside Tools */}
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Display Currency</span>
                <div className="flex items-center bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setCurrency('INR')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      currency === 'INR' 
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                    }`}
                  >
                    ₹ INR
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      currency === 'USD' 
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                    }`}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-zinc-800">
                Creator Utilities
              </div>

              {/* Dynamic Rate Card Calculator */}
              <button
                onClick={() => {
                  setToolsDropdownOpen(false);
                  onOpenRateCard();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Calculator size={13} className="text-emerald-600" />
                  <span className="font-medium">Rate Card Calculator</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Quotes</span>
              </button>

              {/* Exclusivity Collision Radar */}
              <button
                onClick={() => {
                  setToolsDropdownOpen(false);
                  onOpenExclusivity();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert size={13} className={conflictCount > 0 ? "text-amber-500" : "text-slate-500"} />
                  <span className="font-medium">Exclusivity Radar</span>
                </div>
                {conflictCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {conflictCount} conflict
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-medium">Safe</span>
                )}
              </button>

              {/* Brand Directory & CRM */}
              <button
                onClick={() => {
                  setToolsDropdownOpen(false);
                  onOpenBrands();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 size={13} className="text-indigo-600" />
                  <span className="font-medium">Brand Directory & CRM</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Contacts</span>
              </button>

              {/* Team & Manager Access */}
              {onOpenTeam && (
                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    onOpenTeam();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Users size={13} className="text-sand-400" />
                    <span className="font-medium">Team & Manager Access</span>
                  </div>
                  <span className="text-[10px] text-sand-400 font-mono">Roles</span>
                </button>
              )}

              {/* AI Pitch Studio */}
              {onOpenPitch && (
                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    onOpenPitch();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Bot size={13} className="text-purple-600" />
                    <span className="font-medium">AI Pitch & Media Kit</span>
                  </div>
                  <span className="text-[10px] text-purple-600 font-medium">AI</span>
                </button>
              )}

              {/* Platform Integrations Status (YouTube / Instagram) */}
              <button
                onClick={() => {
                  setToolsDropdownOpen(false);
                  onOpenIntegrations();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-medium">YouTube & IG Connectors</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Live</span>
              </button>

              {/* Admin Observatory */}
              {onOpenAdmin && (
                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-teal-800 dark:text-teal-300 transition-colors flex items-center justify-between font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity size={13} className="text-teal-600" />
                    <span>Admin Observatory</span>
                  </div>
                  <span className="text-[10px] font-mono px-1 rounded bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                    GDPR
                  </span>
                </button>
              )}

              {/* Admin CMS Studio */}
              {onOpenCms && (
                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    onOpenCms();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-sand-400/10 text-sand-300 transition-colors flex items-center justify-between font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={13} className="text-sand-400" />
                    <span>Content Studio (CMS)</span>
                  </div>
                  <span className="text-[10px] font-mono px-1 rounded bg-sand-400/20 text-sand-200">
                    LIVE
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* CREATOR PROFILE & SETTINGS DROPDOWN */}
        {user ? (
          <div className="flex items-center gap-1.5">
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs mr-1"
                title="Manage Creator Profile & Verification"
              >
                <UserIcon size={13} className="text-indigo-500" />
                <span>Profile</span>
                {user.email_verified && <ShieldCheck size={12} className="text-emerald-500" />}
              </button>
            )}
            <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
            >
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 object-cover"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-none">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">{user.handle}</div>
              </div>
              <ChevronDown size={11} className="text-slate-400 ml-0.5" />
            </button>

            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 text-slate-800 dark:text-zinc-200"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  <div className="text-[10px] text-slate-600 dark:text-zinc-400 font-mono mt-0.5">{user.handle}</div>
                </div>

                {onOpenProfile && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2 font-medium"
                  >
                    <UserIcon size={13} className="text-slate-500" />
                    <span>My Creator Profile</span>
                  </button>
                )}

                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Settings size={13} className="text-slate-500" />
                    <span>Workspace Settings</span>
                  </button>
                )}

                {onOpenShortcuts && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenShortcuts();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <Keyboard size={13} className="text-slate-500" />
                      <span>Keyboard Shortcuts</span>
                    </div>
                    <kbd className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-slate-500">?</kbd>
                  </button>
                )}

                {onOpenLandingPreview && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenLandingPreview();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Globe size={13} className="text-slate-500" />
                    <span>View Public Landing Page</span>
                  </button>
                )}

                {/* Inline Theme Switcher */}
                <div className="px-3.5 py-2 border-t border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Theme</span>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-1 rounded ${theme === 'light' ? 'bg-white dark:bg-zinc-800 text-amber-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Light Mode"
                    >
                      <Sun size={12} />
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-1 rounded ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Dark Mode"
                    >
                      <Moon size={12} />
                    </button>
                    <button
                      onClick={() => setTheme('auto')}
                      className={`p-1 rounded ${theme === 'auto' ? 'bg-white dark:bg-zinc-800 text-slate-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Auto System Mode"
                    >
                      <Monitor size={12} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={onOpenAuth}
                  className="w-full text-left px-3.5 py-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2 font-medium"
                >
                  <UserIcon size={13} />
                  <span>Switch Creator Account</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full text-left px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2 border-t border-slate-100 dark:border-zinc-800 font-medium"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-zinc-950 text-xs font-semibold shadow-xs transition-all active:scale-95"
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
