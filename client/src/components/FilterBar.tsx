import React, { useState } from 'react';
import { 
  Search, 
  Instagram, 
  Youtube, 
  Layers, 
  X, 
  Filter, 
  Download, 
  Sparkles, 
  Bot,
  FileText,
  AlertTriangle,
  Zap,
  Gift,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Platform, CommercialType } from '../types';

interface FilterBarProps {
  appMode?: 'simple' | 'advanced';
  search: string;
  setSearch: (s: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (p: string) => void;
  selectedCommercial: string;
  setSelectedCommercial: (c: string) => void;
  selectedDateFilter?: string;
  setSelectedDateFilter?: (df: string) => void;
  filterOverdueOnly: boolean;
  setFilterOverdueOnly: (b: boolean) => void;
  filterWhitelistingOnly: boolean;
  setFilterWhitelistingOnly: (b: boolean) => void;
  totalFilteredCount: number;
  totalCount: number;
  onExportCSV?: () => void;
  onOpenMediaKit?: () => void;
  onOpenPitchGenerator?: () => void;
  onOpenPitch?: () => void;
  onViewCalendar?: () => void;


}

export const FilterBar: React.FC<FilterBarProps> = ({
  appMode = 'simple',
  search,
  setSearch,
  selectedPlatform,
  setSelectedPlatform,
  selectedCommercial,
  setSelectedCommercial,
  selectedDateFilter = 'all',
  setSelectedDateFilter,
  filterOverdueOnly,
  setFilterOverdueOnly,
  filterWhitelistingOnly,
  setFilterWhitelistingOnly,
  totalFilteredCount,
  totalCount,
  onExportCSV,
  onOpenMediaKit,
  onOpenPitchGenerator,
  onOpenPitch,
  onViewCalendar
}) => {
  const [showSimpleQuickFilters, setShowSimpleQuickFilters] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const handleOpenPitch = onOpenPitchGenerator || onOpenPitch;
  const isFiltered = search !== '' || selectedPlatform !== 'all' || selectedCommercial !== 'all' || filterOverdueOnly || filterWhitelistingOnly;

  const handleReset = () => {
    setSearch('');
    setSelectedPlatform('all');
    setSelectedCommercial('all');
    setFilterOverdueOnly(false);
    setFilterWhitelistingOnly(false);
  };

  // SIMPLE MODE FILTER BAR: Minimal, clear search + platform filter + optional quick filter tags
  if (appMode === 'simple') {
    return (
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3 mb-6 space-y-2 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Simple Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Search deals, brands, formats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  title="Clear search (Esc)"
                >
                  <X size={12} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border border-zinc-300 dark:border-zinc-700 pointer-events-none">
                  /
                </kbd>
              )}
            </div>

            {/* Simple Platform Buttons */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setSelectedPlatform('all')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedPlatform === 'all'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedPlatform('instagram')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedPlatform === 'instagram'
                    ? 'bg-pink-500/20 text-pink-500 dark:text-pink-400 border border-pink-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Instagram size={12} className="text-pink-500" />
                Instagram
              </button>
              <button
                onClick={() => setSelectedPlatform('youtube')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedPlatform === 'youtube'
                    ? 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Youtube size={12} className="text-red-500" />
                YouTube
              </button>
            </div>

            {/* Date Filters Popover with Calendar View */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                  selectedDateFilter !== 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 border-slate-900 dark:border-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Calendar size={12} />
                <span>{selectedDateFilter === 'all' ? 'Date Filters' : selectedDateFilter === 'this_month' ? 'This Month' : 'Next 30 Days'}</span>
                <ChevronDown size={11} />
              </button>

              {showDateDropdown && (
                <div className="absolute left-0 mt-1.5 z-30 w-52 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl space-y-1 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => { setSelectedDateFilter && setSelectedDateFilter('all'); setShowDateDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${selectedDateFilter === 'all' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                  >
                    All Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDateFilter && setSelectedDateFilter('this_month'); setShowDateDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${selectedDateFilter === 'this_month' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                  >
                    Releasing This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDateFilter && setSelectedDateFilter('next_30_days'); setShowDateDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${selectedDateFilter === 'next_30_days' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                  >
                    Releasing Next 30 Days
                  </button>
                  
                  {onViewCalendar && (
                    <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => { setShowDateDropdown(false); onViewCalendar(); }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-colors shadow-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>Calendar View</span>
                        </span>
                        <span>→</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Filters toggle for starter users */}
            <button
              onClick={() => setShowSimpleQuickFilters(!showSimpleQuickFilters)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                showSimpleQuickFilters || filterOverdueOnly || selectedCommercial !== 'all'
                  ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Show quick filter pills (Overdue, Barter, Whitelisting)"
            >
              <Filter size={11} />
              <span>Filters</span>
              {showSimpleQuickFilters ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {handleOpenPitch && (
              <button
                onClick={handleOpenPitch}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold transition-colors"
                title="AI Sponsor Pitch & Multi-Tier Package Studio"
              >
                <Bot size={11} className="text-purple-500" />
                <span>AI Pitch</span>
              </button>
            )}

            {onOpenMediaKit && (
              <button
                onClick={onOpenMediaKit}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold transition-colors"
                title="1-Click Creator Media Kit & Rate Card"
              >
                <Sparkles size={11} className="text-amber-500" />
                <span>Media Kit</span>
              </button>
            )}

            {onExportCSV && (
              <button
                onClick={onExportCSV}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-semibold transition-colors"
                title="Export deals to CSV/Excel for accounting"
              >
                <Download size={11} />
                <span>CSV</span>
              </button>
            )}

            {isFiltered && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              >
                <X size={12} /> Clear Filter
              </button>
            )}

            <div className="text-[11px] text-zinc-500">
              Showing <span className="font-semibold text-zinc-800 dark:text-zinc-300">{totalFilteredCount}</span> of {totalCount} collabs
            </div>
          </div>
        </div>

        {/* Quick Filter Pills in Simple Mode */}
        {showSimpleQuickFilters && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-2 animate-in fade-in duration-100">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">Quick Filters:</span>

            <button
              onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                filterOverdueOnly
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <AlertTriangle size={10} className={filterOverdueOnly ? 'text-red-400' : 'text-zinc-400'} />
              Overdue Only
            </button>

            <button
              onClick={() => setSelectedCommercial(selectedCommercial === 'barter' ? 'all' : 'barter')}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                selectedCommercial === 'barter'
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/40 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Gift size={10} className={selectedCommercial === 'barter' ? 'text-violet-400' : 'text-zinc-400'} />
              Barter Gifts Only
            </button>

            <button
              onClick={() => setFilterWhitelistingOnly(!filterWhitelistingOnly)}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                filterWhitelistingOnly
                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Zap size={10} className={filterWhitelistingOnly ? 'text-indigo-400' : 'text-zinc-400'} />
              Ad Whitelisting Deals
            </button>
          </div>
        )}
      </div>
    );
  }

  // ADVANCED MODE FILTER BAR: Comprehensive multi-attribute filtering
  return (
    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Left: Search & Platform Pills */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search deals, brands, promo codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              title="Clear search (Esc)"
            >
              <X size={12} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border border-zinc-300 dark:border-zinc-700 pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* Platform Pills */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedPlatform === 'all'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedPlatform('instagram')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedPlatform === 'instagram'
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Instagram size={11} className="text-pink-400" />
            IG
          </button>
          <button
            onClick={() => setSelectedPlatform('youtube')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedPlatform === 'youtube'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Youtube size={11} className="text-red-500" />
            YT
          </button>
        </div>

        {/* Date Filters Popover with Calendar View */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              selectedDateFilter !== 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 border-slate-900 dark:border-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={12} />
            <span>{selectedDateFilter === 'all' ? 'Date Filters' : selectedDateFilter === 'this_month' ? 'This Month' : 'Next 30 Days'}</span>
            <ChevronDown size={11} />
          </button>

          {showDateDropdown && (
            <div className="absolute left-0 mt-1.5 z-30 w-52 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl space-y-1 animate-in fade-in">
              <button
                type="button"
                onClick={() => { setSelectedDateFilter && setSelectedDateFilter('all'); setShowDateDropdown(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${selectedDateFilter === 'all' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
              >
                All Dates
              </button>
              <button
                type="button"
                onClick={() => { setSelectedDateFilter && setSelectedDateFilter('this_month'); setShowDateDropdown(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${selectedDateFilter === 'this_month' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
              >
                Releasing This Month
              </button>
              <button
                type="button"
                onClick={() => { setSelectedDateFilter && setSelectedDateFilter('next_30_days'); setShowDateDropdown(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${selectedDateFilter === 'next_30_days' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
              >
                Releasing Next 30 Days
              </button>
              
              {onViewCalendar && (
                <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => { setShowDateDropdown(false); onViewCalendar(); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-colors shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>Calendar View</span>
                    </span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Commercial Type Dropdown */}
        <select
          value={selectedCommercial}
          onChange={(e) => setSelectedCommercial(e.target.value)}
          className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Deal Types</option>
          <option value="paid">Paid Cash</option>
          <option value="barter">Barter (Product)</option>
          <option value="hybrid">Hybrid</option>
          <option value="affiliate">Affiliate</option>
        </select>

        {/* Overdue Debt Filter Toggle */}
        <button
          onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
            filterOverdueOnly
              ? 'bg-red-500/20 text-red-400 border-red-500/40 font-semibold'
              : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Filter only overdue receivables"
        >
          <AlertTriangle size={12} className={filterOverdueOnly ? 'text-red-400' : 'text-zinc-400'} />
          <span>Overdue</span>
        </button>

        {/* Ad Whitelisting Filter Toggle */}
        <button
          onClick={() => setFilterWhitelistingOnly(!filterWhitelistingOnly)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
            filterWhitelistingOnly
              ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-semibold'
              : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Filter deals granting paid advertising rights"
        >
          <Zap size={12} className={filterWhitelistingOnly ? 'text-indigo-400' : 'text-zinc-400'} />
          <span>Whitelisted</span>
        </button>
      </div>

      {/* Right: Actions, Clear & Count */}
      <div className="flex items-center gap-2.5">
        {handleOpenPitch && (
          <button
            onClick={handleOpenPitch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold transition-colors shadow-xs"
            title="AI Sponsor Pitch & Multi-Tier Package Studio"
          >
            <Bot size={13} className="text-purple-500" />
            <span>AI Pitch Studio</span>
          </button>
        )}

        {onOpenMediaKit && (
          <button
            onClick={onOpenMediaKit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold transition-colors"
            title="1-Click Creator Media Kit & Rate Card"
          >
            <Sparkles size={12} className="text-amber-500" />
            <span>Media Kit</span>
          </button>
        )}

        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="Export deals to CSV/Excel for accounting"
          >
            <Download size={12} />
            <span>CSV Export</span>
          </button>
        )}

        {isFiltered && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          >
            <X size={12} /> Clear
          </button>
        )}

        <div className="text-[11px] text-zinc-500 pl-1 border-l border-zinc-200 dark:border-zinc-800">
          <span className="font-semibold text-zinc-800 dark:text-zinc-300">{totalFilteredCount}</span> of {totalCount} collabs
        </div>
      </div>
    </div>
  );
};


