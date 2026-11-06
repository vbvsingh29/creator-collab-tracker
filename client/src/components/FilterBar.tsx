import React from 'react';
import { Search, Instagram, Youtube, Layers, X, Filter } from 'lucide-react';
import { Platform, CommercialType } from '../types';

interface FilterBarProps {
  appMode?: 'simple' | 'advanced';
  search: string;
  setSearch: (s: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (p: string) => void;
  selectedCommercial: string;
  setSelectedCommercial: (c: string) => void;
  filterOverdueOnly: boolean;
  setFilterOverdueOnly: (b: boolean) => void;
  filterWhitelistingOnly: boolean;
  setFilterWhitelistingOnly: (b: boolean) => void;
  totalFilteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  appMode = 'simple',
  search,
  setSearch,
  selectedPlatform,
  setSelectedPlatform,
  selectedCommercial,
  setSelectedCommercial,
  filterOverdueOnly,
  setFilterOverdueOnly,
  filterWhitelistingOnly,
  setFilterWhitelistingOnly,
  totalFilteredCount,
  totalCount
}) => {
  const isFiltered = search !== '' || selectedPlatform !== 'all' || selectedCommercial !== 'all' || filterOverdueOnly || filterWhitelistingOnly;

  const handleReset = () => {
    setSearch('');
    setSelectedPlatform('all');
    setSelectedCommercial('all');
    setFilterOverdueOnly(false);
    setFilterWhitelistingOnly(false);
  };

  // SIMPLE MODE FILTER BAR: Minimal, clear search + platform filter
  if (appMode === 'simple') {
    return (
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Simple Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search by brand name or collab title..."
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
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Instagram size={12} className="text-pink-400" />
              Instagram
            </button>
            <button
              onClick={() => setSelectedPlatform('youtube')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                selectedPlatform === 'youtube'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Youtube size={12} className="text-red-500" />
              YouTube
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

        {/* Platform Filter Buttons */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedPlatform === 'all'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => setSelectedPlatform('youtube')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedPlatform === 'youtube'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Youtube size={12} className="text-red-500" />
            YouTube
          </button>
          <button
            onClick={() => setSelectedPlatform('instagram')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedPlatform === 'instagram'
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Instagram size={12} className="text-pink-400" />
            Instagram
          </button>
          <button
            onClick={() => setSelectedPlatform('both')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedPlatform === 'both'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers size={12} className="text-indigo-400" />
            Both
          </button>
        </div>

        {/* Commercial Filter Selector */}
        <select
          value={selectedCommercial}
          onChange={(e) => setSelectedCommercial(e.target.value)}
          className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Deal Types</option>
          <option value="paid">Paid Cash Deals</option>
          <option value="barter">Barter / Gifting (Free Product)</option>
          <option value="affiliate">Affiliate / RevShare</option>
          <option value="hybrid">Hybrid Deals</option>
        </select>
      </div>

      {/* Right: Toggle Pills & Counter */}
      <div className="flex items-center gap-2">
        {/* Overdue Quick Toggle */}
        <button
          onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            filterOverdueOnly
              ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm'
              : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          ⚠️ Overdue Only
        </button>

        {/* Whitelisting Toggle */}
        <button
          onClick={() => setFilterWhitelistingOnly(!filterWhitelistingOnly)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            filterWhitelistingOnly
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
              : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          ⚡ Whitelisting
        </button>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1"
          >
            <X size={12} /> Reset
          </button>
        )}

        <div className="text-[11px] text-zinc-500 pl-1">
          Showing <span className="font-semibold text-zinc-800 dark:text-zinc-300">{totalFilteredCount}</span> of {totalCount}
        </div>
      </div>
    </div>
  );
};
