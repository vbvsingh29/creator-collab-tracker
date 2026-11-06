import React, { useEffect } from 'react';
import { X, Building2, Star, Clock, DollarSign, Mail, Sparkles } from 'lucide-react';
import { Brand, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BrandDirectoryModalProps {
  brands: Brand[];
  currency: Currency;
  onClose: () => void;
}

const DEMO_BRANDS: Brand[] = [
  {
    id: 'demo-b1',
    name: 'Keychron India',
    category: 'Computer Hardware',
    contact_person: 'Rohan Mehta (Marketing Lead)',
    contact_email: 'rohan@keychron.in',
    avg_payment_speed_days: 14,
    rating: 5,
    notes: 'Prompt NET-15 payments. Values mechanical keyboard detail shots and dedicated link stickers.',
    collabs_count: 2,
    total_spent: 95000,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-b2',
    name: 'Nothing Tech',
    category: 'Consumer Electronics',
    contact_person: 'Sarah Jenkins (PR & Talent)',
    contact_email: 'sarah@nothing.tech',
    avg_payment_speed_days: 21,
    rating: 5,
    notes: 'Strict aesthetic guidelines (minimalist, clean dark frames). High-volume sponsor.',
    collabs_count: 1,
    total_spent: 110000,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-b3',
    name: 'NordVPN',
    category: 'Cybersecurity SaaS',
    contact_person: 'Liam O’Connor (Affiliate Lead)',
    contact_email: 'creator-partners@nordvpn.com',
    avg_payment_speed_days: 7,
    rating: 4,
    notes: 'Requires 60-day cookie window and pinned link in YouTube/IG bio.',
    collabs_count: 3,
    total_spent: 70000,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-b4',
    name: 'boAt Lifestyle',
    category: 'Audio & Wearables',
    contact_person: 'Vikram Sethi (Influencer Lead)',
    contact_email: 'campaigns@boat-lifestyle.com',
    avg_payment_speed_days: 30,
    rating: 4,
    notes: 'Fast approvals on scripts. NET-30 payment via bank transfer.',
    collabs_count: 2,
    total_spent: 45000,
    created_at: new Date().toISOString()
  }
];

export const BrandDirectoryModal: React.FC<BrandDirectoryModalProps> = ({ brands = [], currency, onClose }) => {
  const isDemo = !brands || brands.length === 0;
  const activeBrands = isDemo ? DEMO_BRANDS : brands;

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

        {isDemo && (
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span>Viewing Demo Brand Partner Directory. Sign in to link contacts and log deals with your personal brands.</span>
          </div>
        )}

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto">
          {activeBrands.map((b) => (
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
