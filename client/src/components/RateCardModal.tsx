import React, { useState } from 'react';
import { X, Calculator, Plus, Check, Percent, Zap, ShieldAlert, Clock, Sparkles } from 'lucide-react';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface RateCardModalProps {
  currency: Currency;
  onClose: () => void;
  onApplyRate: (rate: { title: string; format: string; amount: number; hasWhitelisting: boolean; hasExclusivity: boolean }) => void;
}

interface DeliverableOption {
  id: string;
  name: string;
  platform: 'youtube' | 'instagram';
  baseINR: number;
  baseUSD: number;
}

const BASE_OPTIONS: DeliverableOption[] = [
  { id: 'yt_integrated_midroll', name: 'YouTube 60s Mid-Roll Sponsor', platform: 'youtube', baseINR: 80000, baseUSD: 1500 },
  { id: 'yt_dedicated_video', name: 'YouTube 10-Min Dedicated Video', platform: 'youtube', baseINR: 130000, baseUSD: 2400 },
  { id: 'yt_short', name: 'YouTube Short (Dedicated)', platform: 'youtube', baseINR: 45000, baseUSD: 800 },
  { id: 'ig_dedicated_reel', name: 'Instagram Dedicated High-Prod Reel', platform: 'instagram', baseINR: 95000, baseUSD: 1700 },
  { id: 'ig_integrated_reel', name: 'Instagram 30s Integrated Reel', platform: 'instagram', baseINR: 60000, baseUSD: 1100 },
  { id: 'ig_story', name: 'Instagram 3-Frame Story Set + Sticker', platform: 'instagram', baseINR: 25000, baseUSD: 450 },
  { id: 'ig_mention', name: 'Soft Name Mention / Caption Tag', platform: 'instagram', baseINR: 15000, baseUSD: 250 },
];

export const RateCardModal: React.FC<RateCardModalProps> = ({ currency, onClose, onApplyRate }) => {
  const [selectedFormatId, setSelectedFormatId] = useState<string>('yt_integrated_midroll');
  const [addWhitelisting, setAddWhitelisting] = useState(true);
  const [addExclusivity, setAddExclusivity] = useState(false);
  const [addRushTurnaround, setAddRushTurnaround] = useState(false);
  const [addPinnedComment, setAddPinnedComment] = useState(true);
  const [addBonusStory, setAddBonusStory] = useState(false);

  const selectedOption = BASE_OPTIONS.find((b) => b.id === selectedFormatId) || BASE_OPTIONS[0];

  const basePrice = currency === 'INR' ? selectedOption.baseINR : selectedOption.baseUSD;

  // Add-on percentage multipliers
  let totalMultiplier = 1.0;
  if (addWhitelisting) totalMultiplier += 0.35; // +35% for 30-day Meta/Google paid ad whitelisting
  if (addExclusivity) totalMultiplier += 0.25;  // +25% for 30-day category competitor lock
  if (addRushTurnaround) totalMultiplier += 0.20; // +20% rush fee

  // Fixed add-ons
  const pinnedFee = addPinnedComment ? (currency === 'INR' ? 8000 : 150) : 0;
  const storyFee = addBonusStory ? (currency === 'INR' ? 18000 : 300) : 0;

  const totalFairDeal = Math.round(basePrice * totalMultiplier + pinnedFee + storyFee);

  // Take-home math
  const tds = Math.round(totalFairDeal * 0.10);
  const agency = Math.round(totalFairDeal * 0.15);
  const netBankCash = totalFairDeal - tds - agency;

  const handleApply = () => {
    onApplyRate({
      title: `${selectedOption.name} Sponsorship`,
      format: selectedOption.id,
      amount: totalFairDeal,
      hasWhitelisting: addWhitelisting,
      hasExclusivity: addExclusivity,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calculator size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Dynamic Scope & Rate Card Calculator</h3>
              <p className="text-[11px] text-zinc-400">Stop scope-creep and calculate fair sponsorship rates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X size={16} />
          </button>
        </div>

        {/* 1. Base Deliverable Format Picker */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
            1. Select Base Deliverable
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BASE_OPTIONS.map((opt) => {
              const isSelected = opt.id === selectedFormatId;
              const price = currency === 'INR' ? opt.baseINR : opt.baseUSD;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedFormatId(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-zinc-100">{opt.name}</div>
                  <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                    Base: {formatCurrency(price, currency)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Scope Creep Add-ons */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
            2. Scope Add-ons & Licensing Rights
          </label>
          <div className="space-y-2">
            <div 
              onClick={() => setAddWhitelisting(!addWhitelisting)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${addWhitelisting ? 'bg-indigo-600 border-indigo-500' : 'border-zinc-700'}`}>
                  {addWhitelisting && <Check size={11} className="text-white" />}
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">30-Day Meta / Google Ad Whitelisting</span>
                  <p className="text-[10px] text-zinc-500">Brand runs paid ads through creator handle</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-400">+35%</span>
            </div>

            <div 
              onClick={() => setAddExclusivity(!addExclusivity)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${addExclusivity ? 'bg-indigo-600 border-indigo-500' : 'border-zinc-700'}`}>
                  {addExclusivity && <Check size={11} className="text-white" />}
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">30-Day Competitor Category Lock</span>
                  <p className="text-[10px] text-zinc-500">Locks you out of rival sponsor deals</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400">+25%</span>
            </div>

            <div 
              onClick={() => setAddRushTurnaround(!addRushTurnaround)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${addRushTurnaround ? 'bg-indigo-600 border-indigo-500' : 'border-zinc-700'}`}>
                  {addRushTurnaround && <Check size={11} className="text-white" />}
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">Rush Turnaround (&lt; 72 Hours)</span>
                  <p className="text-[10px] text-zinc-500">Fast priority scripting and filming</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400">+20%</span>
            </div>

            <div 
              onClick={() => setAddPinnedComment(!addPinnedComment)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${addPinnedComment ? 'bg-indigo-600 border-indigo-500' : 'border-zinc-700'}`}>
                  {addPinnedComment && <Check size={11} className="text-white" />}
                </div>
                <div>
                  <span className="font-semibold text-zinc-200">Pinned Sponsor Comment & Bio Link</span>
                  <p className="text-[10px] text-zinc-500">Guaranteed top exposure for 30 days</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">+{formatCurrency(currency === 'INR' ? 8000 : 150, currency)}</span>
            </div>
          </div>
        </div>

        {/* 3. Output Valuation & Take-Home Ledger */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Recommended Fair Quote
            </span>
            <span className="text-xl font-extrabold text-emerald-400">
              {formatCurrency(totalFairDeal, currency)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 text-[11px] text-zinc-400">
            <div>
              <span className="text-zinc-500 block text-[10px]">TDS / Tax (10%)</span>
              <span className="text-red-400 font-semibold">-{formatCurrency(tds, currency)}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Agency Cut (15%)</span>
              <span className="text-amber-400 font-semibold">-{formatCurrency(agency, currency)}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Net Creator Cash</span>
              <span className="text-emerald-300 font-bold">{formatCurrency(netBankCash, currency)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95"
          >
            Use This Quote in New Collab →
          </button>
        </div>
      </div>
    </div>
  );
};
