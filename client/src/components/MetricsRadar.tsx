import React from 'react';
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Gift, 
  Wallet,
  CheckCircle2,
  Percent
} from 'lucide-react';
import { Currency, StatsSummary } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MetricsRadarProps {
  stats: StatsSummary | null;
  currency: Currency;
  mode: 'simple' | 'advanced';
  onFilterOverdue: () => void;
  activeFilterOverdue: boolean;
}

export const MetricsRadar: React.FC<MetricsRadarProps> = ({
  stats,
  currency,
  mode,
  onFilterOverdue,
  activeFilterOverdue
}) => {
  if (!stats) return null;

  const isINR = currency === 'INR';
  const totalRevenue = isINR ? stats.total_revenue_inr : stats.total_revenue_usd;
  const totalPaid = isINR ? stats.total_paid_inr : stats.total_paid_usd;
  const totalPending = isINR ? stats.total_pending_inr : stats.total_pending_usd;
  const overdueAmount = isINR ? stats.overdue_amount_inr : stats.overdue_amount_usd;
  const barterValue = isINR ? stats.barter_total_value_inr : stats.barter_total_value_usd;

  // True Net Take Home Calculation (TDS & Agency cut)
  const estimatedTax = totalRevenue * 0.10;
  const estimatedAgencyFee = totalRevenue * 0.15;
  const trueNetCash = Math.max(0, totalRevenue - estimatedTax - estimatedAgencyFee);

  // If in SIMPLE MODE: show only 3 clean essential metrics
  if (mode === 'simple') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        {/* 1. Total Deals Value */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Collaborations</span>
            <div className="text-xl font-extrabold text-white mt-1">
              {formatCurrency(totalRevenue, currency)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">{stats.total_deals} active brand deals</p>
          </div>
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
            <DollarSign size={18} />
          </div>
        </div>

        {/* 2. Received / Paid in Bank */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Paid in Bank</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">
              {formatCurrency(totalPaid, currency)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Cleared creator payments</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* 3. Pending Payouts */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Pending Payouts</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              {formatCurrency(totalPending, currency)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {stats.overdue_count > 0 ? `${stats.overdue_count} overdue invoice(s)` : 'Awaiting scheduled terms'}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={18} />
          </div>
        </div>
      </div>
    );
  }

  // ADVANCED MODE: Full 6-metric Financial & Cashflow Radar
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Gross Revenue Pipeline */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between text-zinc-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Gross Pipeline</span>
          <div className="p-1 rounded bg-zinc-800 text-zinc-300">
            <DollarSign size={13} />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-white tracking-tight">
            {formatCurrency(totalRevenue, currency)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Across {stats.total_deals} collaborations
          </p>
        </div>
      </div>

      {/* 2. True Net Take-Home (Tax & Agency Adjusted) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between text-zinc-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <Percent size={11} /> Net Take-Home
          </span>
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet size={13} />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-emerald-400 tracking-tight">
            {formatCurrency(trueNetCash, currency)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            After 10% TDS & 15% agency cut
          </p>
        </div>
      </div>

      {/* 3. Pending Payouts */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between text-zinc-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Pending Inflow</span>
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={13} />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-amber-400 tracking-tight">
            {formatCurrency(totalPending, currency)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Collected: {formatCurrency(totalPaid, currency)}
          </p>
        </div>
      </div>

      {/* 4. Overdue Invoices Alert */}
      <div 
        onClick={onFilterOverdue}
        className={`rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all border ${
          activeFilterOverdue
            ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500/50'
            : stats.overdue_count > 0 
              ? 'bg-red-950/20 border-red-500/40 hover:bg-red-950/30' 
              : 'bg-zinc-900/90 border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-red-400 flex items-center gap-1">
            <AlertTriangle size={11} /> Overdue Debt
          </span>
          {stats.overdue_count > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500 text-white animate-pulse">
              {stats.overdue_count} Due
            </span>
          )}
        </div>
        <div>
          <div className="text-lg font-bold text-red-400 tracking-tight">
            {formatCurrency(overdueAmount, currency)}
          </div>
          <p className="text-[10px] text-red-300/80 mt-0.5">
            {stats.overdue_count > 0 ? 'Click to view & send notices' : 'Zero overdue payments!'}
          </p>
        </div>
      </div>

      {/* 5. Paid Ad Whitelisting Active */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between text-zinc-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-indigo-400">Ad Whitelisting</span>
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap size={13} />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-indigo-300 tracking-tight">
            {stats.whitelisting_active_count} Active
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Meta / Google rights running
          </p>
        </div>
      </div>

      {/* 6. Barter / Gifting Fair Market Value */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between text-zinc-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-violet-400">Barter Value</span>
          <div className="p-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Gift size={13} />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-violet-300 tracking-tight">
            {formatCurrency(barterValue, currency)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Gifted gear & products
          </p>
        </div>
      </div>
    </div>
  );
};
