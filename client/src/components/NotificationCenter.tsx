import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  UserPlus, 
  DollarSign, 
  AlertCircle, 
  X,
  ExternalLink
} from 'lucide-react';
import { NotificationItem } from '../types';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, acceptTeamInvite } from '../services/api';

interface NotificationCenterProps {
  onRefreshData?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onRefreshData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetchNotifications();
      const list = (res as any)?.notifications || [];
      setNotifications(list);
      setUnreadCount((res as any)?.unreadCount || 0);
    } catch (err) {
      console.warn('⚠️ [NotificationCenter] Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 45000); // Polling every 45s
    return () => clearInterval(interval);
  }, []);

  // Close when clicked outside
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

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleAcceptInvite = async (notif: NotificationItem) => {
    const token = notif.actionPayload?.token;
    if (!token) return;
    try {
      setActionLoading(notif.id);
      await acceptTeamInvite(token);
      await markNotificationRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      onRefreshData?.();
    } catch (err) {
      console.error('Failed to accept invite:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'team_invite':
      case 'team_invite_accepted':
        return <UserPlus size={15} className="text-sand-400" />;
      case 'payment_overdue':
        return <DollarSign size={15} className="text-amber-400" />;
      default:
        return <AlertCircle size={15} className="text-sand-300" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="relative p-2 rounded-xl border border-charcoal-800 bg-charcoal-900/90 text-sand-200 hover:text-sand-100 hover:border-sand-400/30 transition-all shadow-sm active:scale-95"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full bg-sand-300 text-charcoal-950 text-[10px] font-bold font-mono flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-charcoal-800 bg-charcoal-900/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-charcoal-800 flex items-center justify-between bg-charcoal-950/60">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-sand-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-charcoal-800 text-sand-300 border border-sand-400/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-medium text-sand-400/70 hover:text-sand-300 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck size={12} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-sand-400/50 hover:text-sand-300 hover:bg-charcoal-800 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="overflow-y-auto divide-y divide-charcoal-850 flex-1">
            {loading && notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-sand-400/50">
                Loading updates...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-10 h-10 rounded-full bg-charcoal-850 border border-charcoal-800 text-sand-400 flex items-center justify-center mx-auto mb-3">
                  <Check size={18} />
                </div>
                <p className="text-xs font-medium text-sand-200">All caught up</p>
                <p className="text-[11px] text-sand-400/50 mt-1">No pending invitations or alerts.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={`p-3.5 px-4 transition-colors flex gap-3 cursor-pointer ${
                    notif.isRead 
                      ? 'bg-transparent hover:bg-charcoal-850/40 text-sand-400/70' 
                      : 'bg-sand-400/[0.04] hover:bg-sand-400/[0.07] text-sand-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-charcoal-800/80 border border-charcoal-700/80 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xs font-semibold truncate text-sand-100">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-sand-400/40 font-mono shrink-0 flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-sand-300/80 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Action button (e.g. Accept team invite) */}
                    {notif.type === 'team_invite' && notif.actionPayload?.token && !notif.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptInvite(notif);
                        }}
                        disabled={actionLoading === notif.id}
                        className="mt-2 px-3 py-1 rounded-lg bg-sand-200 hover:bg-sand-100 text-charcoal-950 font-semibold text-[11px] transition-all shadow-xs disabled:opacity-50"
                      >
                        {actionLoading === notif.id ? 'Accepting...' : 'Accept Invite'}
                      </button>
                    )}
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={(e) => handleMarkRead(notif.id, e)}
                      className="text-sand-400/40 hover:text-sand-200 p-1 shrink-0 self-center"
                      title="Mark as read"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
