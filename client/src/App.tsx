import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './context/AuthContext';
import { 
  fetchCollabs, 
  fetchBrands, 
  fetchStats, 
  createCollab, 
  updateCollab, 
  updateCollabStage, 
  updateCollabPayment, 
  deleteCollab 
} from './services/api';
import { Collab, Brand, StatsSummary, Currency, PipelineStage } from './types';
import { Navbar } from './components/Navbar';
import { MetricsRadar } from './components/MetricsRadar';
import { FilterBar } from './components/FilterBar';
import { SimpleView } from './components/SimpleView';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { CollabDrawer } from './components/CollabDrawer';
import { NewCollabModal } from './components/NewCollabModal';
import { RateCardModal } from './components/RateCardModal';
import { ExclusivityRadarModal } from './components/ExclusivityRadarModal';
import { BrandDirectoryModal } from './components/BrandDirectoryModal';
import { ProofCardModal } from './components/ProofCardModal';
import { FollowUpModal } from './components/FollowUpModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './views/LandingPage';
import { IntegrationsModal } from './components/IntegrationsModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SecurityLockModal } from './components/SecurityLockModal';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { InvoiceModal } from './components/InvoiceModal';
import { PitchGeneratorModal } from './components/PitchGeneratorModal';
import { ProPricingModal } from './components/ProPricingModal';
import { MediaKitModal } from './components/MediaKitModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { exportCollabsToCSV } from './utils/csvExport';
import { useTheme } from './context/ThemeContext';

const STAGES: PipelineStage[] = [
  'pitch_inquiry',
  'negotiating',
  'script_approved',
  'content_production',
  'brand_review',
  'scheduled',
  'posted_live',
  'completed'
];

export function App() {
  const { user, token, loading: authLoading, logout, demoLogin, setSession } = useAuth() as any;

  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [showLandingPreview, setShowLandingPreview] = useState(false);

  // View mode & state (Simple vs Advanced)
  const [appMode, setAppMode] = useState<'simple' | 'advanced'>(() => {
    const saved = localStorage.getItem('collabflow_app_mode');
    return (saved === 'simple' || saved === 'advanced') ? saved : 'simple';
  });
  const [currentView, setCurrentView] = useState<'kanban' | 'table' | 'cards'>('kanban');
  const [simpleLayout, setSimpleLayout] = useState<'cards' | 'detailed' | 'table'>(() => {
    const saved = localStorage.getItem('collabflow_simple_layout');
    return (saved === 'cards' || saved === 'detailed' || saved === 'table') ? (saved as 'cards' | 'detailed' | 'table') : 'cards';
  });
  const [currency, setCurrency] = useState<Currency>('INR');

  const handleSetAppMode = (mode: 'simple' | 'advanced') => {
    setAppMode(mode);
    localStorage.setItem('collabflow_app_mode', mode);
  };

  const handleSetSimpleLayout = (layout: 'cards' | 'detailed' | 'table') => {
    setSimpleLayout(layout);
    localStorage.setItem('collabflow_simple_layout', layout);
  };

  // Filters
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCommercial, setSelectedCommercial] = useState('all');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);
  const [filterWhitelistingOnly, setFilterWhitelistingOnly] = useState(false);

  // Modals & Drawers
  const [selectedCollab, setSelectedCollab] = useState<Collab | null>(null);
  const [proofCollab, setProofCollab] = useState<Collab | null>(null);
  const [followUpCollab, setFollowUpCollab] = useState<Collab | null>(null);
  const [isNewCollabOpen, setIsNewCollabOpen] = useState(false);
  const [isRateCardOpen, setIsRateCardOpen] = useState(false);
  const [isExclusivityOpen, setIsExclusivityOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [newCollabPrefill, setNewCollabPrefill] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [invoiceCollab, setInvoiceCollab] = useState<Collab | null>(null);
  const [pitchCollab, setPitchCollab] = useState<Collab | null>(null);
  const [isPitchOpen, setIsPitchOpen] = useState<boolean>(false);
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [isMediaKitOpen, setIsMediaKitOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const { setTheme, resolvedTheme } = useTheme();

  const handleOpenPitch = (collab?: Collab | null) => {
    setPitchCollab(collab || null);
    setIsPitchOpen(true);
  };

  // Fetch creator's private data
  const loadData = async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [collabsData, brandsData, statsData] = await Promise.all([
        fetchCollabs(),
        fetchBrands(),
        fetchStats(),
      ]);
      setCollabs(collabsData);
      setBrands(brandsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    } else {
      setCollabs([]);
      setStats(null);
    }
  }, [token, user?.id]);

  // If not logged in and auth check finished, automatically sign in as demo Aarav or show auth modal
  useEffect(() => {
    if (!authLoading && !token) {
      // Prompt auth modal
      setIsAuthModalOpen(true);
    }
  }, [authLoading, token]);

  // Filtered collaborations
  const filteredCollabs = collabs.filter((c) => {
    if (selectedPlatform !== 'all' && c.platform !== selectedPlatform && c.platform !== 'both') {
      return false;
    }
    if (selectedCommercial !== 'all' && c.commercial_type !== selectedCommercial) {
      return false;
    }
    if (filterOverdueOnly && c.payment_status !== 'overdue') {
      return false;
    }
    if (filterWhitelistingOnly && !c.has_ads_whitelisting) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.brand_name.toLowerCase().includes(q) ||
        (c.promo_code && c.promo_code.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Exclusivity collision check count
  const exclusiveCategories = collabs
    .filter((c) => c.has_category_exclusivity)
    .map((c) => c.brand_category);
  const conflictCount = exclusiveCategories.filter(
    (item, index) => exclusiveCategories.indexOf(item) !== index
  ).length;

  // Handlers
  const handleAdvanceStage = async (id: string, currentStage: PipelineStage, direction: 'next' | 'prev') => {
    const currentIndex = STAGES.indexOf(currentStage);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= STAGES.length) return;

    const nextStage = STAGES[nextIndex];
    try {
      const updated = await updateCollabStage(id, nextStage);
      setCollabs((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (selectedCollab && selectedCollab.id === id) {
        setSelectedCollab(updated);
      }
      fetchStats().then(setStats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickMarkPaid = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const collab = collabs.find((c) => c.id === id);
    if (!collab) return;

    try {
      const updated = await updateCollabPayment(id, {
        payment_status: 'paid',
        amount_paid: collab.deal_amount,
        payment_received_date: new Date().toISOString().split('T')[0],
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#10b981', '#3b82f6', '#ec4899'],
      });

      setCollabs((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (selectedCollab && selectedCollab.id === id) {
        setSelectedCollab(updated);
      }
      fetchStats().then(setStats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCollab = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this collaboration?')) return;

    try {
      await deleteCollab(id);
      setCollabs((prev) => prev.filter((c) => c.id !== id));
      if (selectedCollab && selectedCollab.id === id) {
        setSelectedCollab(null);
      }
      fetchStats().then(setStats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCollab = async (data: Partial<Collab>) => {
    try {
      const created = await createCollab(data);
      setCollabs((prev) => [created, ...prev]);
      fetchStats().then(setStats);
      fetchBrands().then(setBrands);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCollab = async (id: string, data: Partial<Collab>) => {
    try {
      const updated = await updateCollab(id, data);
      setCollabs((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setSelectedCollab(updated);
      fetchStats().then(setStats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyRateQuote = (quote: any) => {
    setNewCollabPrefill(quote);
    setIsNewCollabOpen(true);
  };


  // Global Keyboard Shortcuts (Linear / Superhuman / Raycast style)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.tagName === 'SELECT' || 
        (activeEl as HTMLElement).isContentEditable
      );

      // Escape key handles input blur or top-most modal close (LIFO Stack)
      if (e.key === 'Escape') {
        if (isInputActive) {
          (activeEl as HTMLElement).blur();
          return;
        }
        if (invoiceCollab) { setInvoiceCollab(null); return; }
        if (isPitchOpen || pitchCollab) { setIsPitchOpen(false); setPitchCollab(null); return; }
        if (isPricingOpen) { setIsPricingOpen(false); return; }
        if (isMediaKitOpen) { setIsMediaKitOpen(false); return; }
        if (proofCollab) { setProofCollab(null); return; }
        if (followUpCollab) { setFollowUpCollab(null); return; }
        if (isShortcutsOpen) { setIsShortcutsOpen(false); return; }
        if (isSettingsOpen) { setIsSettingsOpen(false); return; }
        if (isProfileOpen) { setIsProfileOpen(false); return; }
        if (isIntegrationsOpen) { setIsIntegrationsOpen(false); return; }
        if (isBrandsOpen) { setIsBrandsOpen(false); return; }
        if (isExclusivityOpen) { setIsExclusivityOpen(false); return; }
        if (isRateCardOpen) { setIsRateCardOpen(false); return; }
        if (isNewCollabOpen) { setIsNewCollabOpen(false); return; }
        if (selectedCollab) { setSelectedCollab(null); return; }
        if (isAuthModalOpen && user) { setIsAuthModalOpen(false); return; }
        if (search) { setSearch(''); return; }
        return;
      }

      // Do NOT trigger letter/number shortcuts if actively typing in inputs
      if (isInputActive) return;

      // Do NOT trigger if a modal is open
      const isAnyModalOpen = isShortcutsOpen || isSettingsOpen || isProfileOpen || isAuthModalOpen || 
        isIntegrationsOpen || isBrandsOpen || isExclusivityOpen || isRateCardOpen || isNewCollabOpen || 
        proofCollab !== null || followUpCollab !== null || selectedCollab !== null;
      if (isAnyModalOpen) return;

      // Shortcut: '?' => Keyboard Shortcuts Modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      // Shortcut: '/' or 's' => Focus Search
      if (e.key === '/' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Shortcut: 'c' or 'n' => New Collab
      if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (!user) {
          setIsAuthModalOpen(true);
        } else {
          setNewCollabPrefill(null);
          setIsNewCollabOpen(true);
        }
        return;
      }

      // Shortcut: '1' => Simple View Mode
      if (e.key === '1') {
        e.preventDefault();
        handleSetAppMode('simple');
        return;
      }

      // Shortcut: '2' => Advanced View Mode
      if (e.key === '2') {
        e.preventDefault();
        handleSetAppMode('advanced');
        return;
      }

      // Shortcut: 'm' => Creator Media Kit
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMediaKitOpen(true);
        return;
      }

      // Shortcut: 'k' => Toggle Kanban Board vs Table View
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (appMode === 'advanced') {
          setCurrentView((prev) => (prev === 'kanban' ? 'table' : 'kanban'));
        } else {
          handleSetSimpleLayout(simpleLayout === 'cards' ? 'table' : 'cards');
        }
        return;
      }

      // Shortcut: 'a' => AI Sponsor Pitch Studio
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleOpenPitch(filteredCollabs[0] || collabs[0]);
        return;
      }

      // Shortcut: 'r' => Rate Card Calculator
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsRateCardOpen(true);
        return;
      }

      // Shortcut: 'o' => Platform Admin Observatory (GDPR Telemetry)
      if (e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setIsAdminOpen(true);
        return;
      }

      // Shortcut: 'e' => Exclusivity Collision Radar
      if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExclusivityOpen(true);
        return;
      }

      // Shortcut: 'b' => Brands CRM Directory
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsBrandsOpen(true);
        return;
      }

      // Shortcut: 'p' => Creator Profile & Kit
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsProfileOpen(true);
        return;
      }

      // Shortcut: ',' => Workspace Settings
      if (e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      // Shortcut: 't' => Toggle Light / Dark Theme
      if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    user,
    appMode,
    currentView,
    simpleLayout,
    search,
    resolvedTheme,
    setTheme,
    isShortcutsOpen,
    isSettingsOpen,
    isProfileOpen,
    isAuthModalOpen,
    isIntegrationsOpen,
    isBrandsOpen,
    isExclusivityOpen,
    isRateCardOpen,
    isNewCollabOpen,
    proofCollab,
    followUpCollab,
    selectedCollab,
  ]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center text-zinc-500 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="font-mono text-xs">Loading CollabFlow OS...</span>
        </div>
      </div>
    );
  }

  if (!user || showLandingPreview) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
        {showLandingPreview && (
          <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-between shadow-md">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Previewing Public Landing Page (Logged in as {user?.name || 'Creator'})</span>
            </span>
            <button
              onClick={() => setShowLandingPreview(false)}
              className="bg-white text-indigo-700 hover:bg-zinc-100 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Return to Workspace Dashboard &rarr;
            </button>
          </div>
        )}

        <LandingPage
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onDemoLogin={(email) => {
            demoLogin(email);
            setShowLandingPreview(false);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          canClose={true}
        />

        <AdminPortalModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Navigation with Creator Profile */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={logout}
        onDemoLogin={demoLogin}
        appMode={appMode}
        setAppMode={handleSetAppMode}
        currentView={currentView}
        setCurrentView={setCurrentView}
        simpleLayout={simpleLayout}
        setSimpleLayout={handleSetSimpleLayout}
        currency={currency}
        setCurrency={setCurrency}
        onOpenNewCollab={() => {
          if (!user) {
            setIsAuthModalOpen(true);
            return;
          }
          setNewCollabPrefill(null);
          setIsNewCollabOpen(true);
        }}
        onOpenRateCard={() => setIsRateCardOpen(true)}
        onOpenExclusivity={() => setIsExclusivityOpen(true)}
        onOpenBrands={() => setIsBrandsOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        conflictCount={conflictCount}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenMediaKit={() => setIsMediaKitOpen(true)}
        onOpenPitch={() => handleOpenPitch(filteredCollabs[0] || collabs[0])}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenLandingPreview={() => setShowLandingPreview(true)}

      />

      {/* Main Content Area */}
      <main className="flex-1 px-3 sm:px-6 py-3.5 sm:py-6 max-w-[1600px] w-full mx-auto pb-24 md:pb-6">
        {/* Creator Greeting Banner if logged in */}
        {user && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs gap-1">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 dark:text-zinc-400">Creator Workspace:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-200">{user.name}</span>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">{user.handle}</span>
            </div>
            <div className="text-[11px] text-zinc-500 hidden sm:block">
              Only your private brand deals and revenues are shown.
            </div>
          </div>
        )}

        {/* Mobile View Recommendation Pill */}
        {appMode === 'simple' && (
          <div className="md:hidden mb-3.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              ðŸ“± <strong>Mobile View</strong>: Fast card tracking & 1-tap payouts
            </span>
            <button
              onClick={() => handleSetAppMode('advanced')}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 underline shrink-0 ml-2"
            >
              Agency Mode â†’
            </button>
          </div>
        )}

        {/* Statistics & Financial Radar */}
        <MetricsRadar
          stats={stats}
          currency={currency}
          mode={appMode}
          onFilterOverdue={() => setFilterOverdueOnly(!filterOverdueOnly)}
          activeFilterOverdue={filterOverdueOnly}
        />

        {/* Search & Filter Bar */}
        <FilterBar
          appMode={appMode}
          search={search}
          setSearch={setSearch}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          selectedCommercial={selectedCommercial}
          setSelectedCommercial={setSelectedCommercial}
          filterOverdueOnly={filterOverdueOnly}
          setFilterOverdueOnly={setFilterOverdueOnly}
          filterWhitelistingOnly={filterWhitelistingOnly}
          setFilterWhitelistingOnly={setFilterWhitelistingOnly}
          totalFilteredCount={filteredCollabs.length}
          totalCount={collabs.length}
          onExportCSV={() => exportCollabsToCSV(filteredCollabs, currency)}
          onOpenMediaKit={() => setIsMediaKitOpen(true)}
        onOpenPitch={() => handleOpenPitch(filteredCollabs[0] || collabs[0])}
          onOpenPitchGenerator={() => {
            setPitchCollab(filteredCollabs[0] || collabs[0] || null);
            setIsPitchOpen(true);
          }}
        />

        {/* View Component: Simple Cards, Kanban Board, or Data Table */}
        {dataLoading || authLoading ? (
          <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">
            Loading creator collaborations...
          </div>
        ) : !user ? (
          <div className="py-20 text-center space-y-3">
            <h3 className="text-base font-bold text-zinc-200">Sign in to view your collaborations</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              CollabFlow isolates deals per creator. Click below to log in or try a 1-click demo creator profile.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
            >
              Log In / Select Creator Profile
            </button>
          </div>
        ) : appMode === 'simple' ? (
          <SimpleView
            collabs={filteredCollabs}
            currency={currency}
            layout={simpleLayout}
            setLayout={handleSetSimpleLayout}
            onSelectCollab={(c) => setSelectedCollab(c)}
            onQuickMarkPaid={handleQuickMarkPaid}
            onOpenNewCollab={() => setIsNewCollabOpen(true)}
            onOpenInvoice={(c) => setInvoiceCollab(c)}
            onOpenPitch={(c) => { setPitchCollab(c); setIsPitchOpen(true); }}
          />
        ) : currentView === 'kanban' ? (
          <KanbanBoard
            collabs={filteredCollabs}
            currency={currency}
            onSelectCollab={(c) => setSelectedCollab(c)}
            onAdvanceStage={handleAdvanceStage}
          />
        ) : currentView === 'table' ? (
          <TableView
            collabs={filteredCollabs}
            currency={currency}
            onSelectCollab={(c) => setSelectedCollab(c)}
            onQuickMarkPaid={handleQuickMarkPaid}
            onDeleteCollab={handleDeleteCollab}
            onOpenInvoice={(c) => setInvoiceCollab(c)}
            onOpenPitch={(c) => { setPitchCollab(c); setIsPitchOpen(true); }}
          />
        ) : (
          <SimpleView
            collabs={filteredCollabs}
            currency={currency}
            layout={simpleLayout}
            setLayout={handleSetSimpleLayout}
            onSelectCollab={(c) => setSelectedCollab(c)}
            onQuickMarkPaid={handleQuickMarkPaid}
            onOpenNewCollab={() => setIsNewCollabOpen(true)}
            onOpenInvoice={(c) => setInvoiceCollab(c)}
            onOpenPitch={(c) => { setPitchCollab(c); setIsPitchOpen(true); }}
          />
        )}
      </main>

      {/* Slide-over Inspection Drawer */}
      {selectedCollab && (
        <CollabDrawer
          collab={selectedCollab}
          currency={currency}
          appMode={appMode}
          onClose={() => setSelectedCollab(null)}
          onUpdateCollab={handleUpdateCollab}
          onOpenProofCard={(c) => setProofCollab(c)}
          onOpenFollowUp={(c) => setFollowUpCollab(c)}
          onMarkPaid={(c) => handleQuickMarkPaid(c.id)}
          onOpenInvoice={(c) => setInvoiceCollab(c)}
          onOpenPitchGenerator={(c) => { setPitchCollab(c); setIsPitchOpen(true); }}
        />
      )}

      {/* New Collab Modal */}
      {isNewCollabOpen && (
        <NewCollabModal
          currency={currency}
          defaultMode={appMode}
          onClose={() => {
            setIsNewCollabOpen(false);
            setNewCollabPrefill(null);
          }}
          onCreateCollab={handleCreateCollab}
          initialData={newCollabPrefill}
        />
      )}

      {/* Dynamic Rate Card Calculator Modal */}
      {isRateCardOpen && (
        <RateCardModal
          currency={currency}
          onClose={() => setIsRateCardOpen(false)}
          onApplyRate={handleApplyRateQuote}
        />
      )}

      {/* Competitor Exclusivity Radar Modal */}
      {isExclusivityOpen && (
        <ExclusivityRadarModal
          collabs={collabs}
          onClose={() => setIsExclusivityOpen(false)}
        />
      )}

      {/* Brand & Agency CRM Directory Modal */}
      {isBrandsOpen && (
        <BrandDirectoryModal
          brands={brands}
          currency={currency}
          onClose={() => setIsBrandsOpen(false)}
        />
      )}

      {/* 1-Click Live Campaign Proof Card Modal */}
      {proofCollab && (
        <ProofCardModal
          collab={proofCollab}
          onClose={() => setProofCollab(null)}
        />
      )}

      {/* Escalation Payment Follow-Up Modal */}
      {followUpCollab && (
        <FollowUpModal
          collab={followUpCollab}
          onClose={() => setFollowUpCollab(null)}
        />
      )}

      {/* Live Integrations Health Status Modal */}
      {isIntegrationsOpen && (
        <IntegrationsModal
          onClose={() => setIsIntegrationsOpen(false)}
        />
      )}

      {/* Complete Creator Profile & Brand Kit Modal */}
      {isProfileOpen && (
        <ProfileModal
          user={user}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onOpenAuth={() => {
            setIsProfileOpen(false);
            setIsAuthModalOpen(true);
          }}
          onProfileUpdated={(updatedUser) => {
            if (setSession && token) {
              setSession(token, updatedUser);
            }
          }}
        />
      )}

      {/* Comprehensive Workspace Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currency={currency}
        setCurrency={setCurrency}
        appMode={appMode}
        setAppMode={handleSetAppMode}
        simpleLayout={simpleLayout}
        setSimpleLayout={handleSetSimpleLayout}
        onOpenPitch={() => handleOpenPitch(filteredCollabs[0] || collabs[0])}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        onOpenMediaKit={() => setIsMediaKitOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenRateCard={() => setIsRateCardOpen(true)}
        onOpenExclusivity={() => setIsExclusivityOpen(true)}
        onOpenBrands={() => setIsBrandsOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Auth Modal (Log in / Sign up / 1-Click Demo Profiles) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        canClose={!!user}
      />

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <MobileBottomNav
        appMode={appMode}
        onOpenNewCollab={() => {
          if (!user) {
            setIsAuthModalOpen(true);
            return;
          }
          setNewCollabPrefill(null);
          setIsNewCollabOpen(true);
        }}
        onOpenRateCard={() => setIsRateCardOpen(true)}
        onOpenExclusivity={() => setIsExclusivityOpen(true)}
        onOpenBrands={() => setIsBrandsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPitch={() => handleOpenPitch(filteredCollabs[0] || collabs[0])}
        conflictCount={conflictCount}
      />

      {/* PWA 1-Click Install Banner for Mobile */}
      <InstallPwaBanner />

      {/* 1-Click Professional Brand Invoice Modal */}
      {invoiceCollab && (
        <InvoiceModal
          collab={invoiceCollab}
          isOpen={!!invoiceCollab}
          onClose={() => setInvoiceCollab(null)}
          currency={currency}
          onMarkInvoiced={(id, invoiceNumber, invoiceDate, dueDate) => {
            handleUpdateCollab(id, {
              payment_status: 'invoiced',
              invoice_number: invoiceNumber,
              invoice_date: invoiceDate,
              payment_due_date: dueDate,
            });
          }}
        />
      )}

      {/* AI Sponsor Pitch & Counter-Offer Generator Modal */}
      {isPitchOpen && (
        <PitchGeneratorModal
          collab={pitchCollab}
          collabs={collabs}
          user={user}
          isOpen={isPitchOpen}
          onClose={() => {
            setIsPitchOpen(false);
            setPitchCollab(null);
          }}
          currency={currency}
        />
      )}

      {/* Commercial SaaS Pro / Agency Pricing Modal */}
      <ProPricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        currency={currency}
      />

      {/* 1-Click Creator Media Kit & Rate Card One-Pager Modal */}
      <MediaKitModal
        user={user}
        currency={currency}
        isOpen={isMediaKitOpen}
        onClose={() => setIsMediaKitOpen(false)}
        onOpenAuth={() => {
          setIsMediaKitOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Platform Admin Observatory & Telemetry Portal (GDPR Safe) */}
      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Biometric & 4-Digit Security PIN App Lock */}
      <SecurityLockModal onLogoutFallback={logout} />
    </div>
  );
}

export default App;




