import React, { useEffect } from 'react';
import { X, Command, Keyboard, Zap, LayoutGrid, Sliders, ShieldCheck } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Actions & Tools' | 'Preferences' | 'Dialogs';
}

const SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { keys: ['1'], description: 'Switch to Simple Mode (minimal card view)', category: 'Navigation' },
  { keys: ['2'], description: 'Switch to Advanced Mode (agency pipeline)', category: 'Navigation' },
  { keys: ['k'], description: 'Toggle Kanban Board / Table View', category: 'Navigation' },

  // Actions & Tools
  { keys: ['c'], description: 'Create New Collaboration', category: 'Actions & Tools' },
  { keys: ['n'], description: 'Create New Collaboration (alternative)', category: 'Actions & Tools' },
  { keys: ['/'], description: 'Focus Deal Search Bar', category: 'Actions & Tools' },
  { keys: ['r'], description: 'Open Dynamic Rate Card Calculator', category: 'Actions & Tools' },
  { keys: ['e'], description: 'Open Exclusivity Collision Radar', category: 'Actions & Tools' },
  { keys: ['b'], description: 'Open Brands & Agency CRM Directory', category: 'Actions & Tools' },
  { keys: ['a'], description: 'Open AI Sponsor Pitch & Package Studio', category: 'Actions & Tools' },
  { keys: ['m'], description: 'Open Creator Media Kit & Rate Card', category: 'Actions & Tools' },
  { keys: ['o'], description: 'Open Platform Admin Observatory (GDPR Telemetry)', category: 'Actions & Tools' },

  // Preferences
  { keys: ['t'], description: 'Toggle Light / Dark Theme', category: 'Preferences' },
  { keys: ['p'], description: 'Open Creator Profile & Baseline Rates', category: 'Preferences' },
  { keys: [','], description: 'Open Workspace Settings', category: 'Preferences' },

  // Dialogs
  { keys: ['?'], description: 'Open this Keyboard Shortcuts cheat sheet', category: 'Dialogs' },
  { keys: ['Esc'], description: 'Close any active modal, drawer, or clear search', category: 'Dialogs' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['Navigation', 'Actions & Tools', 'Preferences', 'Dialogs'] as const;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Keyboard size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Navigate CollabFlow at lightning speed like Linear & Superhuman</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {categories.map((category) => {
            const items = SHORTCUTS.filter((s) => s.category === category);
            return (
              <div key={category} className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {category}
                </h4>

                <div className="grid grid-cols-1 gap-1.5 bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-2.5">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white dark:hover:bg-zinc-850/60 transition-colors"
                    >
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="min-w-[22px] px-2 py-1 text-[11px] font-mono font-bold rounded-md bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs text-center inline-block"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Shortcuts are disabled while typing inside inputs.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold shadow transition-colors"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
