import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Youtube, 
  Instagram, 
  Layers, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { Collab, Currency } from '../types';
import { formatCurrency, getStageConfig } from '../utils/formatters';

interface CalendarViewProps {
  collabs: Collab[];
  currency: Currency;
  onSelectCollab: (collab: Collab) => void;
  onOpenNewCollab?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  collabs,
  currency,
  onSelectCollab,
  onOpenNewCollab
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [filterType, setFilterType] = useState<'all' | 'scheduled' | 'live' | 'due'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & number of days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  // Map collabs by date for fast lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Array<{ collab: Collab; type: 'scheduled' | 'live' | 'due' }>>();

    for (const c of collabs) {
      if (c.scheduled_post_date && (filterType === 'all' || filterType === 'scheduled')) {
        const dateKey = c.scheduled_post_date.split('T')[0];
        const existing = map.get(dateKey) || [];
        existing.push({ collab: c, type: 'scheduled' });
        map.set(dateKey, existing);
      }
      if (c.actual_posted_date && (filterType === 'all' || filterType === 'live')) {
        const dateKey = c.actual_posted_date.split('T')[0];
        const existing = map.get(dateKey) || [];
        // Avoid duplicate if same as scheduled
        if (!existing.some(e => e.collab.id === c.id && e.type === 'live')) {
          existing.push({ collab: c, type: 'live' });
          map.set(dateKey, existing);
        }
      }
      if (c.payment_due_date && (filterType === 'all' || filterType === 'due')) {
        const dateKey = c.payment_due_date.split('T')[0];
        const existing = map.get(dateKey) || [];
        if (!existing.some(e => e.collab.id === c.id && e.type === 'due')) {
          existing.push({ collab: c, type: 'due' });
          map.set(dateKey, existing);
        }
      }
    }
    return map;
  }, [collabs, filterType]);

  // Generate calendar grid days
  const calendarCells = useMemo(() => {
    const cells = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate.get(dateStr) || []
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: true,
        events: eventsByDate.get(dateStr) || []
      });
    }

    // Next month padding days to fill 35 or 42 grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate.get(dateStr) || []
      });
    }

    return cells;
  }, [firstDayIndex, totalDays, prevMonthTotalDays, year, month, eventsByDate]);

  // Count scheduled and live items this month
  const monthStats = useMemo(() => {
    let scheduledCount = 0;
    let liveCount = 0;
    let dueCount = 0;
    calendarCells.filter(c => c.isCurrentMonth).forEach(c => {
      c.events.forEach(e => {
        if (e.type === 'scheduled') scheduledCount++;
        if (e.type === 'live') liveCount++;
        if (e.type === 'due') dueCount++;
      });
    });
    return { scheduledCount, liveCount, dueCount };
  }, [calendarCells]);

  return (
    <div className="space-y-4">
      {/* Editorial Calendar Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-800 dark:text-zinc-200">
            <CalendarIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {MONTH_NAMES[month]} {year}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                {collabs.length} Deals Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {monthStats.scheduledCount} scheduled release(s) • {monthStats.liveCount} live post(s) • {monthStats.dueCount} invoice due(s)
            </p>
          </div>
        </div>

        {/* Controls: Prev / Today / Next & Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterType('scheduled')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'scheduled'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setFilterType('live')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'live'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Live Posts
            </button>
            <button
              onClick={() => setFilterType('due')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'due'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Payout Due
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {onOpenNewCollab && (
            <button
              onClick={onOpenNewCollab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-colors shadow-xs"
            >
              <Plus size={13} />
              <span>New Deal</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/50 text-center">
          {DAY_NAMES.map((d, idx) => (
            <div
              key={d}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6
                  ? 'text-slate-400 dark:text-zinc-500'
                  : 'text-slate-700 dark:text-zinc-300'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 7-column Calendar Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-zinc-850">
          {calendarCells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            return (
              <div
                key={idx}
                className={`min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/40 dark:bg-zinc-950/40 text-slate-400 dark:text-zinc-600'
                    : 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-200'
                } ${isToday ? 'ring-1 ring-inset ring-slate-900 dark:ring-white bg-slate-50/60 dark:bg-zinc-900/40' : ''}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                        : cell.isCurrentMonth
                        ? 'text-slate-700 dark:text-zinc-300'
                        : 'text-slate-400 dark:text-zinc-600'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {cell.events.length > 0 && (
                    <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                      {cell.events.length} item{cell.events.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px]">
                  {cell.events.slice(0, 3).map((event, eIdx) => {
                    const collab = event.collab;
                    const stageConfig = getStageConfig(collab.pipeline_stage);

                    return (
                      <button
                        key={`${collab.id}-${event.type}-${eIdx}`}
                        onClick={() => onSelectCollab(collab)}
                        className={`w-full text-left p-1 rounded-md text-[11px] font-medium transition-all flex items-center justify-between gap-1 truncate ${
                          event.type === 'live'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100'
                            : event.type === 'due'
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100'
                            : 'bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-800'
                        }`}
                        title={`${collab.brand_name}: ${collab.title} (${event.type})`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          {collab.platform === 'youtube' ? (
                            <Youtube size={10} className="text-red-500 shrink-0" />
                          ) : collab.platform === 'instagram' ? (
                            <Instagram size={10} className="text-pink-500 shrink-0" />
                          ) : (
                            <Layers size={10} className="text-indigo-500 shrink-0" />
                          )}
                          <span className="font-bold truncate">{collab.brand_name}</span>
                        </div>

                        {event.type === 'live' ? (
                          <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                            LIVE
                          </span>
                        ) : event.type === 'due' ? (
                          <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                            DUE
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-500 dark:text-zinc-400 shrink-0">
                            POST
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {cell.events.length > 3 && (
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold pl-1">
                      +{cell.events.length - 3} more deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
