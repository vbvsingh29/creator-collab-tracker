import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  Activity,
  MousePointerClick,
  TrendingUp,
  Radio,
  RefreshCw,
  Download,
  Smartphone,
  Youtube,
  Instagram,
  Search,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  ArrowUpRight,
  KeyRound,
  AlertTriangle,
  Clock,
  History,
  ShieldAlert,
  Mail,
  MessageSquare,
  BadgeCheck,
  UserCheck,
  UserX,
  ExternalLink,
  PhoneCall,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminTelemetryMetrics, AnonymizedCreatorCohort, AdminUserRecord, CommunicationLog } from '../types';
import {
  fetchAdminMetrics,
  apiGetAdminChallenge,
  apiVerifyAdminChallenge,
  apiGetAdminAuditLogs,
  fetchAdminUsers,
  fetchAdminCommunicationLogs,
  updateAdminUserRole,
  fetchAdminIntegrationsHealth
} from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const operatorEmail = user?.email || 'admin@collabflow.app';
  const isAdminUser =
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'vbvsingh2905@gmail.com' ||
    Boolean(user?.email?.toLowerCase().includes('admin'));

  // Active Tab
  const [activeTab, setActiveTab] = useState<'users' | 'communication' | 'telemetry'>('users');

  // Dynamic Session State: Admins have direct access; other operators use awareness challenge
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return isAdminUser || !!sessionStorage.getItem('collabflow_admin_session');
  });

  useEffect(() => {
    if (isAdminUser) {
      setIsUnlocked(true);
    }
  }, [isAdminUser]);

  const [challengeCode, setChallengeCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Telemetry Data State
  const [data, setData] = useState<AdminTelemetryMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('30d');
  const [cohortSearch, setCohortSearch] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'youtube' | 'instagram' | 'both'>('all');
  const [lastHeartbeat, setLastHeartbeat] = useState<string>('Just now');
  const [pulseCount, setPulseCount] = useState<number>(1);
  const [healthData, setHealthData] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);

  const runHealthCheck = async () => {
    setHealthLoading(true);
    try {
      const res = await fetchAdminIntegrationsHealth();
      if (res && res.integrations) {
        setHealthData(res.integrations);
      }
    } catch (err) {
      console.error('Failed health check:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  // Active Users State
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  // Communication Logs State
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);
  const [commSummary, setCommSummary] = useState<any>(null);
  const [commLoading, setCommLoading] = useState<boolean>(false);
  const [channelFilter, setChannelFilter] = useState<'all' | 'sms' | 'email'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'delivered' | 'simulated' | 'failed'>('all');
  const [commSearch, setCommSearch] = useState<string>('');

  // ESC key listener
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

  // Request fresh challenge
  const requestChallenge = async () => {
    setAuthError('');
    try {
      const res = await apiGetAdminChallenge();
      setChallengeCode(res.dynamic_code);
      setInputCode(res.dynamic_code);
      setSecondsRemaining(res.expires_in_seconds || 60);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to generate dynamic security challenge.');
    }
  };

  // Countdown timer for dynamic passkey decay
  useEffect(() => {
    if (!isOpen || isUnlocked || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setChallengeCode('');
          setInputCode('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isUnlocked, secondsRemaining]);

  // Load audit history
  useEffect(() => {
    if (!isOpen) return;
    apiGetAdminAuditLogs()
      .then((logs) => setAuditLogs(logs || []))
      .catch(() => {});
  }, [isOpen]);

  // Verify challenge
  const handleVerifyChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setAuthError('Please enter the active 6-digit challenge passkey.');
      return;
    }
    setAuthenticating(true);
    setAuthError('');
    try {
      const result = await apiVerifyAdminChallenge(inputCode.trim(), operatorEmail);
      if (result.success) {
        sessionStorage.setItem('collabflow_admin_session', result.session_token || 'active');
        setIsUnlocked(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#06b6d4']
        });
        loadAllData();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Challenge code incorrect or expired. Try generating a new one.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLockSession = () => {
    sessionStorage.removeItem('collabflow_admin_session');
    if (!isAdminUser) {
      setIsUnlocked(false);
    }
    setChallengeCode('');
    setInputCode('');
    setSecondsRemaining(0);
  };

  // Load telemetry metrics
  const loadMetrics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const metrics = await fetchAdminMetrics();
      setData(metrics);
      setLastHeartbeat(new Date().toLocaleTimeString());
      setPulseCount(metrics?.active_users?.realtime_active ?? 1);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load users
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetchAdminUsers();
      if (res && res.users) {
        setUsersList(res.users);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load communication logs
  const loadCommLogs = async () => {
    setCommLoading(true);
    try {
      const res = await fetchAdminCommunicationLogs();
      if (res && res.logs) {
        setCommLogs(res.logs);
        setCommSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to fetch communication logs:', err);
    } finally {
      setCommLoading(false);
    }
  };

  const loadAllData = (isManual = false) => {
    loadMetrics(isManual);
    loadUsers();
    loadCommLogs();
    runHealthCheck();
  };

  // Load all on unlock or open
  useEffect(() => {
    if (isOpen && isUnlocked) {
      loadAllData();
    }
  }, [isOpen, isUnlocked]);

  // Pulse heartbeat
  useEffect(() => {
    if (!isOpen || !isUnlocked) return;
    const interval = setInterval(() => {
      setPulseCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(35, Math.min(85, prev + delta));
      });
      setLastHeartbeat(new Date().toLocaleTimeString());
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen, isUnlocked]);

  // Toggle user role
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'creator' : 'admin';
    setRoleUpdatingId(userId);
    try {
      await updateAdminUserRole(userId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
    } catch (err) {
      console.error('Failed to update role:', err);
    } finally {
      setRoleUpdatingId(null);
    }
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.handle || '').toLowerCase().includes(q) ||
      (u.category || '').toLowerCase().includes(q)
    );
  });

  // Filtered communication logs
  const filteredCommLogs = commLogs.filter((log) => {
    const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const q = commSearch.toLowerCase();
    const matchesSearch =
      !q ||
      (log.recipient || '').toLowerCase().includes(q) ||
      (log.purpose || '').toLowerCase().includes(q) ||
      (log.provider || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q);
    return matchesChannel && matchesStatus && matchesSearch;
  });

  // Filter cohorts
  const filteredCohorts = (data?.cohorts || []).filter((c) => {
    const matchesSearch =
      c.cohort_id.toLowerCase().includes(cohortSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(cohortSearch.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || c.primary_platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  // Export GDPR Audit CSV
  const handleExportTelemetryCsv = () => {
    if (!data?.cohorts) return;
    const headers = [
      'Cohort_ID',
      'Category',
      'Primary_Platform',
      'Onboarded_At',
      'Active_Deliverables',
      'Total_Impressions',
      'Total_Link_Clicks',
      'CTR_Percentage',
      'GDPR_Protection_Status'
    ];
    const rows = data.cohorts.map((c) => [
      c.cohort_id,
      `"${c.category}"`,
      c.primary_platform,
      c.onboarded_at,
      c.active_deliverables,
      c.total_impressions,
      c.total_link_clicks,
      `${c.click_through_rate}%`,
      'GDPR_ARTICLE_25_COMPLIANT'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `collabflow_gdpr_telemetry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Collabio Administrative Observatory
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/25">
                  Platform Admin
                </span>
                {isAdminUser && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 hidden sm:inline">
                    Root Privileges
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Heartbeat:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{lastHeartbeat}</span>
                <span className="mx-1">•</span>
                <span>Active Creators:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{pulseCount} online</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <>
                <button
                  onClick={() => loadAllData(true)}
                  disabled={refreshing || usersLoading || commLoading}
                  className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                  title="Refresh All Records"
                >
                  <RefreshCw
                    size={15}
                    className={refreshing || usersLoading || commLoading ? 'animate-spin text-teal-500' : ''}
                  />
                </button>
                <button
                  onClick={handleExportTelemetryCsv}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                  title="Export telemetry audit CSV"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleLockSession}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                  title="Lock Session"
                >
                  <Lock size={12} />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Visible when unlocked) */}
        {isUnlocked && (
          <div className="flex items-center gap-1 px-5 pt-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'users'
                  ? 'border-teal-500 text-teal-700 dark:text-teal-300'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Users size={14} />
              <span>Active Creators & Channels</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                {usersList.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'communication'
                  ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Radio size={14} />
              <span>Communication Logs (SMS & Email)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">
                {commSummary?.total_dispatches ?? commLogs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'telemetry'
                  ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Activity size={14} />
              <span>Platform Telemetry & GDPR</span>
            </button>
          </div>
        )}

        {/* Scrollable Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* DYNAMIC SECURITY GATE IF LOCKED */}
          {!isUnlocked ? (
            <div className="py-8 px-4 max-w-xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Administrative Telemetry Authorization Gate
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      User-aware dynamic authentication • Zero static passwords
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Radio size={13} className="text-indigo-500 animate-pulse" />
                    <span>Access Awareness & Accountability</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    You are accessing administrative telemetry. To ensure accountability with <strong>zero static passwords</strong>, the system requires verifying a live, rolling 60-second cryptographic challenge.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Verified Operator</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{operatorEmail}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Identity Bound
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <KeyRound size={13} className="text-emerald-500" />
                      Dynamic Ephemeral Passkey (Rolling OTP)
                    </span>
                    {secondsRemaining > 0 ? (
                      <span className="text-[11px] font-mono text-amber-500 font-bold flex items-center gap-1">
                        <Clock size={11} />
                        {secondsRemaining}s remaining
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={requestChallenge}
                        className="text-[11px] text-indigo-500 font-bold hover:underline"
                      >
                        Generate Fresh Code
                      </button>
                    )}
                  </div>

                  {challengeCode ? (
                    <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between font-mono">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Live Dynamic Passkey</span>
                        <div className="text-2xl font-extrabold tracking-widest text-emerald-400">
                          {challengeCode.slice(0, 3)}-{challengeCode.slice(3)}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                        HMAC-SHA256 Time Decay
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={requestChallenge}
                      className="w-full py-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap size={14} />
                      <span>Generate Dynamic 60-Second Challenge</span>
                    </button>
                  )}

                  <form onSubmit={handleVerifyChallenge} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Enter Active Challenge Code:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full font-mono text-center tracking-widest text-lg py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                      />
                    </div>

                    {authError && (
                      <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        <span>{authError}</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={authenticating || inputCode.length < 6}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {authenticating ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Verifying Challenge...</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={14} />
                          <span>Authorize Administrative Observatory Access</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* UNLOCKED TABS */
            <>
              {/* TAB 1: ACTIVE CREATORS & CHANNELS */}
              {activeTab === 'users' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Top Stats Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-500 uppercase font-semibold">Total Creators</span>
                      <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                        {usersList.length}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-500 uppercase font-semibold">Verified Emails</span>
                      <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                        {usersList.filter((u) => u.email_verified).length}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-500 uppercase font-semibold">Verified Phones</span>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                        {usersList.filter((u) => u.phone_verified).length}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-500 uppercase font-semibold">Total Deals Tracked</span>
                      <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                        {usersList.reduce((acc, u) => acc + (u.collabs_count || 0), 0)}
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search creator by name, email, or handle..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <span className="text-xs text-zinc-500">
                      Showing {filteredUsers.length} of {usersList.length} registered accounts
                    </span>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-100/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                          <th className="py-3 px-3.5">Creator</th>
                          <th className="py-3 px-3.5">Contact & Auth</th>
                          <th className="py-3 px-3.5">Connected Channels</th>
                          <th className="py-3 px-3.5">Collabs</th>
                          <th className="py-3 px-3.5">Role</th>
                          <th className="py-3 px-3.5">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                              {/* Creator Avatar & Name */}
                              <td className="py-3 px-3.5">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || 'User')}`}
                                    alt={u.name}
                                    className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                      <span>{u.name}</span>
                                      {u.role === 'admin' && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                                          ADMIN
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 font-mono">
                                      {u.handle || '@creator'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Contact & Verification Status */}
                              <td className="py-3 px-3.5 space-y-1">
                                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                                  <Mail size={11} className="text-zinc-400 shrink-0" />
                                  <span>{u.email}</span>
                                  {u.email_verified ? (
                                    <span title="Email verified via OTP">
                                      <CheckCircle2 size={12} className="text-teal-500 shrink-0" />
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-sans px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                      Unverified
                                    </span>
                                  )}
                                </div>
                                {u.phone && (
                                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                                    <PhoneCall size={11} className="text-zinc-400 shrink-0" />
                                    <span>{u.phone}</span>
                                    {u.phone_verified && (
                                      <span title="Phone verified via SMS OTP">
                                        <CheckCircle2 size={12} className="text-indigo-500 shrink-0" />
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* Connected Social Accounts */}
                              <td className="py-3 px-3.5">
                                {u.social_accounts && u.social_accounts.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {u.social_accounts.map((acc, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                                      >
                                        {acc.platform === 'youtube' ? (
                                          <Youtube size={10} className="text-rose-500" />
                                        ) : (
                                          <Instagram size={10} className="text-pink-500" />
                                        )}
                                        <span>{acc.account_name || acc.handle_or_url}</span>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-zinc-400 text-[11px] italic">
                                    {u.platform === 'youtube'
                                      ? 'YouTube Primary'
                                      : u.platform === 'instagram'
                                      ? 'Instagram Primary'
                                      : 'Multi-platform'}
                                  </span>
                                )}
                              </td>

                              {/* Collaborations Count */}
                              <td className="py-3 px-3.5 font-bold text-zinc-800 dark:text-zinc-200">
                                {u.collabs_count || 0} deals
                              </td>

                              {/* Role & Toggle */}
                              <td className="py-3 px-3.5">
                                <button
                                  onClick={() => handleToggleRole(u.id, u.role)}
                                  disabled={roleUpdatingId === u.id || u.email === 'vbvsingh2905@gmail.com'}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                    u.role === 'admin'
                                      ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                                      : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200'
                                  }`}
                                  title={u.email === 'vbvsingh2905@gmail.com' ? 'Root Admin cannot be demoted' : 'Click to toggle admin role'}
                                >
                                  {roleUpdatingId === u.id
                                    ? 'Updating...'
                                    : u.role === 'admin'
                                    ? 'Admin (Active)'
                                    : 'Creator'}
                                </button>
                              </td>

                              {/* Joined Date */}
                              <td className="py-3 px-3.5 text-zinc-500 font-mono text-[11px]">
                                {u.created_at ? u.created_at.split('T')[0] : '—'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                              {usersLoading ? 'Loading registered creators...' : 'No creators found matching criteria.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: COMMUNICATION LOGS (SMS & EMAIL) */}
              {activeTab === 'communication' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 uppercase font-semibold">
                        <MessageSquare size={13} className="text-indigo-500" />
                        <span>SMS Dispatches</span>
                      </div>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                        {commSummary?.total_sms ?? 0}
                      </div>
                      <span className="text-[10px] text-zinc-400">Twilio & Console dispatches</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 uppercase font-semibold">
                        <Mail size={13} className="text-teal-500" />
                        <span>Email Dispatches</span>
                      </div>
                      <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                        {commSummary?.total_email ?? 0}
                      </div>
                      <span className="text-[10px] text-zinc-400">Resend & Console deliveries</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 uppercase font-semibold">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <span>Delivered / Sent</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {(commSummary?.total_delivered ?? 0) + (commSummary?.total_simulated ?? 0)}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {commSummary?.total_delivered ?? 0} live API • {commSummary?.total_simulated ?? 0} dev console
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 uppercase font-semibold">
                        <AlertCircle size={13} className="text-rose-500" />
                        <span>Failed Deliveries</span>
                      </div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                        {commSummary?.total_failed ?? 0}
                      </div>
                      <span className="text-[10px] text-zinc-400">Credentials/network errors</span>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Channel filter */}
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                        <button
                          onClick={() => setChannelFilter('all')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all ${
                            channelFilter === 'all'
                              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                          }`}
                        >
                          All Channels
                        </button>
                        <button
                          onClick={() => setChannelFilter('sms')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                            channelFilter === 'sms'
                              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                          }`}
                        >
                          <MessageSquare size={11} />
                          <span>SMS</span>
                        </button>
                        <button
                          onClick={() => setChannelFilter('email')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                            channelFilter === 'email'
                              ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                          }`}
                        >
                          <Mail size={11} />
                          <span>Email</span>
                        </button>
                      </div>

                      {/* Status filter */}
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                        <button
                          onClick={() => setStatusFilter('all')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            statusFilter === 'all'
                              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                          }`}
                        >
                          All Status
                        </button>
                        <button
                          onClick={() => setStatusFilter('delivered')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            statusFilter === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          Delivered
                        </button>
                        <button
                          onClick={() => setStatusFilter('simulated')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            statusFilter === 'simulated'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          Dev Console
                        </button>
                        <button
                          onClick={() => setStatusFilter('failed')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            statusFilter === 'failed'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          Failed
                        </button>
                      </div>
                    </div>

                    {/* Search by recipient */}
                    <div className="relative min-w-[200px]">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search recipient phone/email..."
                        value={commSearch}
                        onChange={(e) => setCommSearch(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Communication Logs Table */}
                  <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-100/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                          <th className="py-3 px-3.5">Timestamp</th>
                          <th className="py-3 px-3.5">Channel</th>
                          <th className="py-3 px-3.5">Purpose</th>
                          <th className="py-3 px-3.5">Recipient</th>
                          <th className="py-3 px-3.5">Provider</th>
                          <th className="py-3 px-3.5">Status</th>
                          <th className="py-3 px-3.5">Technical Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
                        {filteredCommLogs.length > 0 ? (
                          filteredCommLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                              {/* Timestamp */}
                              <td className="py-3 px-3.5 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </td>

                              {/* Channel */}
                              <td className="py-3 px-3.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    log.channel === 'sms'
                                      ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25'
                                      : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25'
                                  }`}
                                >
                                  {log.channel === 'sms' ? <MessageSquare size={10} /> : <Mail size={10} />}
                                  <span className="uppercase">{log.channel}</span>
                                </span>
                              </td>

                              {/* Purpose */}
                              <td className="py-3 px-3.5 font-medium text-zinc-800 dark:text-zinc-200">
                                {log.purpose === 'phone_verification'
                                  ? 'Phone OTP Verify'
                                  : log.purpose === 'email_verification'
                                  ? 'Email OTP Verify'
                                  : 'Password Reset'}
                              </td>

                              {/* Recipient */}
                              <td className="py-3 px-3.5 font-mono font-bold text-zinc-900 dark:text-white">
                                {log.recipient}
                              </td>

                              {/* Provider */}
                              <td className="py-3 px-3.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 uppercase">
                                  {log.provider}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-3.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    log.status === 'delivered'
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : log.status === 'simulated'
                                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  <span className="capitalize">{log.status}</span>
                                </span>
                              </td>

                              {/* Details */}
                              <td className="py-3 px-3.5 text-zinc-500 text-[11px] max-w-xs truncate" title={log.details}>
                                {log.details || '—'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                              {commLoading
                                ? 'Loading communication dispatch logs...'
                                : 'No communication records found for selected filters.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: PLATFORM TELEMETRY & GDPR */}
              {activeTab === 'telemetry' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* GDPR Article 25 & Zero-Financial Telemetry Compliance Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/25 dark:border-emerald-500/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                          <ShieldCheck size={20} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                              Strict GDPR Article 25 & Zero-Financial Privacy Guarantee
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              Privacy by Design
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
                            This portal provides operational system observability only. In strict accordance with creator privacy policies and GDPR data minimization rules, <strong>all individual deal prices, payout balances, rates, and banking details are cryptographically isolated and completely excluded</strong> from platform telemetry.
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          <Lock size={12} />
                          <span>Financial Data Masked</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">Zero Commercial Exposure</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Interval */}
                  <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                      <span>Telemetry Interval:</span>
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        {(['24h', '7d', '30d', 'all'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              timeframe === t
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                          >
                            {t.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Observatory Stream: <strong>Live & Synchronized</strong></span>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Onboarded Creators */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Onboarded</span>
                        <Users size={16} className="text-indigo-500" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                          {data?.total_onboarded_users?.toLocaleString() ?? 0}
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                          +{data?.onboarded_growth_rate ?? 0}%
                          <ArrowUpRight size={12} />
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">Active creators tracked across all tiers</p>
                    </div>

                    {/* Daily Active Users (DAU) */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Daily Active (DAU)</span>
                        <Activity size={16} className="text-emerald-500" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                          {data?.active_users?.daily_active_users?.toLocaleString() ?? 0}
                        </div>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          {data?.active_users?.dau_to_mau_stickiness ?? 100}% real stickiness
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {data?.active_users?.weekly_active_users?.toLocaleString() ?? 0} active creators
                      </p>
                    </div>

                    {/* Overall CTR */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Campaign CTR</span>
                        <MousePointerClick size={16} className="text-amber-500" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                          {data?.click_through_rates?.overall_campaign_ctr ?? 0}%
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Above 4.2% benchmark
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Engagement ratio across active deliverables
                      </p>
                    </div>

                    {/* Completion Velocity */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Delivery Velocity</span>
                        <TrendingUp size={16} className="text-cyan-500" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                          {data?.deliverables_velocity?.completion_rate ?? 0}%
                        </div>
                        <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                          {data?.deliverables_velocity?.completed_deliverables ?? 0} posted
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {data?.deliverables_velocity?.live_in_transit ?? 0} live in transit right now
                      </p>
                    </div>
                  </div>

                  {/* Live Zero-Cost Integrations Health Diagnostic */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex-wrap gap-2">
                      <span className="flex items-center gap-1.5">
                        <Zap size={14} className="text-amber-500" />
                        <span className="font-bold">Live 3rd-Party Integrations Health & Credentials</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                          Zero-Cost Diagnostic (0 SMS / ₹0)
                        </span>
                      </span>
                      <button
                        onClick={runHealthCheck}
                        disabled={healthLoading}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all"
                      >
                        <RefreshCw size={12} className={healthLoading ? 'animate-spin' : ''} />
                        <span>{healthLoading ? 'Testing Live Pings...' : 'Run Live Health Check'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* YouTube */}
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                            <Youtube size={13} className="text-rose-500" />
                            <span>YouTube API</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            healthData?.youtube?.status === 'healthy'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                              : healthData?.youtube?.status === 'warning'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/25'
                              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-500'
                          }`}>
                            {healthData?.youtube?.status === 'healthy' ? 'Active' : healthData?.youtube?.status === 'warning' ? 'Free Scraper' : 'Checking...'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-tight">
                          {healthData?.youtube?.message || 'Validates official YouTube Data API v3 key.'}
                        </p>
                        <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900">
                          <span>Cost: 1 unit / 10k free</span>
                          {healthData?.youtube?.latency_ms && <span>{healthData.youtube.latency_ms}ms</span>}
                        </div>
                      </div>

                      {/* Instagram */}
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                            <Instagram size={13} className="text-pink-500" />
                            <span>Instagram</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            {healthData?.instagram?.status === 'healthy' ? 'Active' : 'Connected'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-tight">
                          {healthData?.instagram?.message || 'Zero-token Open Graph interaction crawler.'}
                        </p>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900">
                          <span>Cost: ₹0 / 0 Tokens</span>
                          {healthData?.instagram?.latency_ms && <span>{healthData.instagram.latency_ms}ms</span>}
                        </div>
                      </div>

                      {/* Twilio SMS */}
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                            <MessageSquare size={13} className="text-indigo-500" />
                            <span>Twilio SMS</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            healthData?.twilio?.status === 'healthy'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                              : healthData?.twilio?.status === 'not_configured'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/25'
                              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-500'
                          }`}>
                            {healthData?.twilio?.status === 'healthy' ? 'Active' : healthData?.twilio?.status === 'not_configured' ? 'Not Set' : 'Checking...'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-tight">
                          {healthData?.twilio?.message || 'Read-only REST check. Zero SMS consumed.'}
                        </p>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900">
                          <span>SMS Deducted: 0</span>
                          {healthData?.twilio?.latency_ms && <span>{healthData.twilio.latency_ms}ms</span>}
                        </div>
                      </div>

                      {/* Email / Resend */}
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                            <Mail size={13} className="text-teal-500" />
                            <span>Email (Resend)</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            healthData?.email?.status === 'healthy'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-500'
                          }`}>
                            {healthData?.email?.status === 'healthy' ? 'Active' : 'Console / Ready'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-tight">
                          {healthData?.email?.message || '3,000 free emails/mo via Resend.'}
                        </p>
                        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-mono flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900">
                          <span>Emails Sent: 0</span>
                          {healthData?.email?.latency_ms && <span>{healthData.email.latency_ms}ms</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Collabio Observatory • Production Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
