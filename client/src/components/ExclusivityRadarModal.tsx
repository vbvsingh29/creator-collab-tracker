import React, { useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Calendar, Building2 } from 'lucide-react';
import { Collab } from '../types';

interface ExclusivityRadarModalProps {
  collabs: Collab[];
  onClose: () => void;
}

export const ExclusivityRadarModal: React.FC<ExclusivityRadarModalProps> = ({ collabs, onClose }) => {
  // Find all collabs with exclusivity
  const exclusiveDeals = collabs.filter((c) => c.has_category_exclusivity);

  // Group by category to find collisions
  const categoryMap: Record<string, Collab[]> = {};
  for (const deal of exclusiveDeals) {
    const cat = deal.brand_category || 'General';
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(deal);
  }

  // Categories with more than 1 deal = collision alert!
  const categories = Object.keys(categoryMap);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Competitor Exclusivity Collision Radar</h3>
              <p className="text-[11px] text-zinc-400">Avoid legal contract breaches and category lockouts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X size={16} />
          </button>
        </div>

        {/* Status Banner */}
        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
          <p className="leading-relaxed">
            Brands enforce strict lockout clauses prohibiting mentions of competing brands.
            CollabFlow continuously monitors category locks across Instagram and YouTube.
          </p>
        </div>

        {/* Active Category Locks */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {categories.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <span>Zero category locks! You are completely free to pitch any sponsor category.</span>
            </div>
          ) : (
            categories.map((cat) => {
              const deals = categoryMap[cat];
              const hasCollision = deals.length > 1;

              return (
                <div
                  key={cat}
                  className={`p-3.5 rounded-xl border ${
                    hasCollision
                      ? 'bg-red-950/20 border-red-500/40'
                      : 'bg-zinc-900/80 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      {hasCollision ? (
                        <AlertTriangle size={13} className="text-red-400" />
                      ) : (
                        <ShieldAlert size={13} className="text-amber-400" />
                      )}
                      {cat}
                    </span>
                    {hasCollision ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                        ⚠️ Conflict Detected ({deals.length} Brands)
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Active Lock
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {deals.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between text-xs bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/80"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 size={12} className="text-zinc-500" />
                          <span className="font-semibold text-zinc-200">{d.brand_name}</span>
                          <span className="text-[10px] text-zinc-500 truncate max-w-[180px]">({d.title})</span>
                        </div>

                        <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{d.exclusivity_days || 30} Days Lockout</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
