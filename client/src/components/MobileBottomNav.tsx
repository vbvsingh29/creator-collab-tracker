import React from 'react';
import { 
  Kanban, 
  Plus, 
  Calculator, 
  ShieldAlert, 
  Building2, 
  Settings, 
  Sparkles,
  Bot
} from 'lucide-react';

interface MobileBottomNavProps {
  appMode: 'simple' | 'advanced';
  onOpenNewCollab: () => void;
  onOpenRateCard: () => void;
  onOpenExclusivity: () => void;
  onOpenBrands: () => void;
  onOpenSettings: () => void;
  onOpenPitch?: () => void;
  conflictCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  appMode,
  onOpenNewCollab,
  onOpenRateCard,
  onOpenExclusivity,
  onOpenBrands,
  onOpenSettings,
  onOpenPitch,
  conflictCount
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800/90 backdrop-blur-lg px-2 py-1.5 transition-colors duration-150">
      <div className="flex items-center justify-around max-w-lg mx-auto text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
        {/* Rate Card Calculator */}
        <button
          onClick={onOpenRateCard}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg active:scale-95 transition-all text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <Calculator size={18} />
          <span>Rate Card</span>
        </button>

        {/* Exclusivity Radar */}
        <button
          onClick={onOpenExclusivity}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg active:scale-95 transition-all text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 relative"
        >
          <ShieldAlert size={18} className={conflictCount > 0 ? "text-amber-500" : ""} />
          <span>Radar</span>
          {conflictCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute top-0.5 right-2" />
          )}
        </button>

        {/* Floating Center Action: New Collab */}
        <button
          onClick={onOpenNewCollab}
          className="flex flex-col items-center justify-center -mt-5 w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-90 transition-all border-2 border-white dark:border-zinc-950"
          title="Create New Collaboration"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>

        {/* AI Pitch Studio */}
        {onOpenPitch ? (
          <button
            onClick={onOpenPitch}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg active:scale-95 transition-all text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
          >
            <Bot size={18} />
            <span>AI Pitch</span>
          </button>
        ) : (
          <button
            onClick={onOpenBrands}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg active:scale-95 transition-all text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <Building2 size={18} />
            <span>Brands</span>
          </button>
        )}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg active:scale-95 transition-all text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </nav>
  );
};
