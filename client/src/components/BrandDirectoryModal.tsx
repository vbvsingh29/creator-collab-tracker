import React from 'react';
import { X, Building2, Star, Clock, DollarSign, Mail, Phone } from 'lucide-react';
import { Brand, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BrandDirectoryModalProps {
  brands: Brand[];
  currency: Currency;
  onClose: () => void;
}

export const BrandDirectoryModal: React.FC<BrandDirectoryModalProps> = ({ brands, currency, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
              <Building2 size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Brand & Agency CRM Directory</h3>
              <p className="text-[11px] text-zinc-400">Track payment reliability and agency contacts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X size={16} />
          </button>
        </div>

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto">
          {brands.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-colors text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-zinc-100">{b.name}</h4>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star size={12} className="fill-amber-400" />
                    <span className="text-[11px] font-bold">{b.rating}.0</span>
                  </div>
                </div>

                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block mb-2">
                  {b.category}
                </span>

                <div className="space-y-1 text-zinc-400 text-[11px] mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-zinc-500" />
                    <span>Avg Payment Speed: <strong className="text-zinc-200">{b.avg_payment_speed_days || 30} Days</strong></span>
                  </div>
                  {b.contact_person && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} className="text-zinc-500" />
                      <span className="truncate">{b.contact_person}</span>
                    </div>
                  )}
                </div>

                {b.notes && (
                  <p className="p-2 rounded bg-zinc-950 text-[11px] text-zinc-400 italic line-clamp-2 border border-zinc-850">
                    "{b.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">
                  {b.collabs_count || 1} Collaboration{(b.collabs_count || 1) > 1 ? 's' : ''}
                </span>
                <span className="font-bold text-emerald-400">
                  {b.total_spent ? formatCurrency(b.total_spent, currency) : 'Active Partner'}
                </span>
              </div>
            </div>
          ))}
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
