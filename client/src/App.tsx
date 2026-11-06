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
import { IntegrationsModal } from './components/IntegrationsModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';

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

  // View mode & state (Simple vs Advanced)
  const [appMode, setAppMode] = useState<'simple' | 'advanced'>(() => {
    const saved = localStorage.getItem('collabflow_app_mode');
    return (saved === 'simple' || saved === 'advanced') ? saved : 'simple';
  });
  const [currentView, setCurrentView] = useState<'kanban' | 'table' | 'cards'>('kanban');
  const [simpleLayout, setSimpleLayout] = useState<'cards' | 'table'>(() => {
    const saved = localStorage.getItem('collabflow_simple_layout');
    return (saved === 'cards' || saved === 'table') ? saved : 'cards';
  });
  const [currency, setCurrency] = useState<Currency>('INR');

  const handleSetAppMode = (mode: 'simple' | 'advanced') => {
    setAppMode(mode);
    localStorage.setItem('collabflow_app_mode', mode);
  };

  const handleSetSimpleLayout = (layout: 'cards' | 'table') => {
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
      {isProfileOpen && user && (
        <ProfileModal
          user={user}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
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
        conflictCount={conflictCount}
      />
    </div>
  );
}

export default App;
