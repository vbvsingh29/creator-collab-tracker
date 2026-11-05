import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  DollarSign, 
  Sliders, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Database, 
  FileText, 
  Save 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency } from '../types';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  appMode: 'simple' | 'advanced';
  setAppMode: (m: 'simple' | 'advanced') => void;
  simpleLayout: 'cards' | 'table';
  setSimpleLayout: (l: 'cards' | 'table') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currency,
  setCurrency,
  appMode,
  setAppMode,
  simpleLayout,
  setSimpleLayout
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Invoicing defaults stored in localStorage
  const [legalName, setLegalName] = useState(() => localStorage.getItem('collabflow_biz_name') || 'Creator Studio');
  const [taxId, setTaxId] = useState(() => localStorage.getItem('collabflow_biz_tax') || 'GSTIN / PAN / Tax ID');
  const [bankInfo, setBankInfo] = useState(() => localStorage.getItem('collabflow_biz_bank') || 'HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0000123 | UPI: creator@okaxis');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('collabflow_biz_name', legalName);
    localStorage.setItem('collabflow_biz_tax', taxId);
    localStorage.setItem('collabflow_biz_bank', bankInfo);
    setSavedSuccess(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClearCache = () => {
    if (confirm('Clear local browser cache and saved display preferences?')) {
      localStorage.removeItem('collabflow_biz_name');
      localStorage.removeItem('collabflow_biz_tax');
      localStorage.removeItem('collabflow_biz_bank');
      alert('Local workspace preferences refreshed.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Settings size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Workspace Settings</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Configure theme appearance, financial defaults, and invoicing</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 text-xs max-h-[82vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 flex items-center gap-2">
              <Check size={14} />
              <span>Workspace settings saved successfully!</span>
            </div>
          )}

          {/* 1. Appearance / Theme */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Appearance & Theme Interface
            </label>

            <div className="grid grid-cols-3 gap-3">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Sun size={16} />
                </div>
                <div>
                  <div className="font-bold text-xs">Light Mode</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Crisp, clean & bright</div>
                </div>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Moon size={16} />
                </div>
                <div>
                  <div className="font-bold text-xs">Dark Mode</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">High-contrast charcoal</div>
                </div>
              </button>

              {/* Auto / System Mode */}
              <button
                type="button"
                onClick={() => setTheme('auto')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  theme === 'auto'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-zinc-500/10 text-zinc-400 flex items-center justify-center">
                  <Monitor size={16} />
                </div>
                <div>
                  <div className="font-bold text-xs">Auto System</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Sync with OS ({resolvedTheme})</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Workspace Defaults */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Workspace & Financial Preferences
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Currency Selector */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">Primary Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </select>
              </div>

              {/* Default App Mode */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">Default View Mode</label>
                <select
                  value={appMode}
                  onChange={(e) => setAppMode(e.target.value as 'simple' | 'advanced')}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="simple">Simple Mode (Quick & Minimal)</option>
                  <option value="advanced">Advanced Mode (Full Pipeline & Radar)</option>
                </select>
              </div>

              {/* Simple Mode Layout */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">Simple Mode Layout</label>
                <select
                  value={simpleLayout}
                  onChange={(e) => setSimpleLayout(e.target.value as 'cards' | 'table')}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="cards">Cards Grid View</option>
                  <option value="table">9-Column Simple Table</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Invoicing Defaults Form */}
          <form onSubmit={handleSaveDefaults} className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Default Invoicing & Billing Info
              </label>
              <button
                type="submit"
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Save size={12} /> Save Billing Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">Creator Business Name</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">GST / Tax Identification</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 uppercase block mb-1">Bank Remittance & UPI QR Text</label>
              <input
                type="text"
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </form>

          {/* 4. Security & Data Management */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Security & Workspace Data
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Zero Data Leakage Encryption</div>
                  <div className="text-[10px] text-zinc-500">Every query strictly filtered by creator user_id with NIST scrypt hashing</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearCache}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
              >
                <Trash2 size={12} />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold shadow transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
