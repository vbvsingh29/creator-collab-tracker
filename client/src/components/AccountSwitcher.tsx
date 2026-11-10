import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Plus, 
  Instagram, 
  Youtube, 
  Check, 
  Layers,
  Trash2,
  X
} from 'lucide-react';
import { useAccounts } from '../context/AccountContext';

export const AccountSwitcher: React.FC = () => {
  const { accounts, selectedAccountId, setSelectedAccountId, addAccount, removeAccount } = useAccounts();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [platform, setPlatform] = useState<'instagram' | 'youtube'>('instagram');
  const [handle, setHandle] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedAccount = selectedAccountId === 'all' 
    ? null 
    : accounts.find(a => a.id === selectedAccountId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      const newAcc = await addAccount({ platform, handle: handle.trim(), name: name.trim() || undefined });
      if (newAcc) {
        setSelectedAccountId(newAcc.id);
        setShowAddModal(false);
        setHandle('');
        setName('');
        setIsOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this channel profile?')) {
      try {
        await removeAccount(id);
      } catch (err: any) {
        alert(err.message || 'Failed to remove account');
      }
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Switcher Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-charcoal-800 bg-charcoal-900/90 text-xs text-sand-200 hover:text-sand-100 hover:border-sand-400/30 transition-all shadow-sm"
        >
          {selectedAccountId === 'all' ? (
            <>
              <Layers size={13} className="text-sand-400" />
              <span className="font-semibold text-sand-100">All Channels</span>
            </>
          ) : (
            <>
              {selectedAccount?.platform === 'youtube' ? (
                <Youtube size={13} className="text-red-400" />
              ) : (
                <Instagram size={13} className="text-pink-400" />
              )}
              <span className="font-semibold text-sand-100 max-w-[110px] truncate">
                {selectedAccount?.handle || selectedAccount?.name}
              </span>
            </>
          )}
          <ChevronDown size={13} className={`text-sand-400/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-charcoal-800 bg-charcoal-900/95 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden divide-y divide-charcoal-850">
            <div className="p-2 space-y-1">
              {/* Option: All Channels */}
              <button
                onClick={() => {
                  setSelectedAccountId('all');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                  selectedAccountId === 'all' 
                    ? 'bg-sand-400/10 text-sand-100 font-semibold' 
                    : 'text-sand-300 hover:bg-charcoal-850 text-left'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-sand-400" />
                  <span>All Channels & Handles</span>
                </div>
                {selectedAccountId === 'all' && <Check size={14} className="text-sand-300" />}
              </button>

              {/* Individual Accounts */}
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors group ${
                    selectedAccountId === acc.id 
                      ? 'bg-sand-400/10 text-sand-100 font-semibold' 
                      : 'text-sand-300 hover:bg-charcoal-850'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {acc.platform === 'youtube' ? (
                      <Youtube size={14} className="text-red-400 shrink-0" />
                    ) : (
                      <Instagram size={14} className="text-pink-400 shrink-0" />
                    )}
                    <div className="flex flex-col truncate">
                      <span className="truncate text-sand-100 font-medium">{acc.handle}</span>
                      {acc.name && acc.name !== acc.handle && (
                        <span className="text-[10px] text-sand-400/50 truncate">{acc.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedAccountId === acc.id && <Check size={14} className="text-sand-300 mr-1" />}
                    {accounts.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(acc.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-charcoal-800 text-charcoal-600 hover:text-red-400 transition-all"
                        title="Delete Channel"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Channel Button */}
            <div className="p-2 bg-charcoal-950/40">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-charcoal-700 hover:border-sand-400/40 text-sand-300 hover:text-sand-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={13} className="text-sand-400" />
                <span>Add Channel / Account</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-charcoal-800 bg-charcoal-900/95 backdrop-blur-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-800 mb-5">
              <h3 className="font-bold text-sm text-sand-100">Add Creator Channel</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-sand-400/50 hover:text-sand-100 hover:bg-charcoal-800"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sand-300 mb-2">Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('instagram')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      platform === 'instagram'
                        ? 'bg-pink-500/10 border-pink-500/40 text-pink-300 shadow-sm'
                        : 'bg-charcoal-850 border-charcoal-800 text-sand-400 hover:border-charcoal-700'
                    }`}
                  >
                    <Instagram size={14} />
                    <span>Instagram</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('youtube')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      platform === 'youtube'
                        ? 'bg-red-500/10 border-red-500/40 text-red-300 shadow-sm'
                        : 'bg-charcoal-850 border-charcoal-800 text-sand-400 hover:border-charcoal-700'
                    }`}
                  >
                    <Youtube size={14} />
                    <span>YouTube</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sand-300 mb-1.5">Channel / Profile Handle</label>
                <input
                  type="text"
                  placeholder="@aarav_tech"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-800 bg-charcoal-950 text-sand-100 placeholder:text-sand-400/30 text-xs focus:outline-hidden focus:border-sand-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sand-300 mb-1.5">Channel Label (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Hindi Tech Channel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-800 bg-charcoal-950 text-sand-100 placeholder:text-sand-400/30 text-xs focus:outline-hidden focus:border-sand-400/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-sand-300 hover:bg-charcoal-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sand-200 hover:bg-sand-100 text-charcoal-950 font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
