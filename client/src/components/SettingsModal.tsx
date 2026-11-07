import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Sliders, 
  ShieldCheck, 
  Check, 
  FileText, 
  Save,
  Lock,
  Fingerprint,
  Smartphone,
  Sparkles,
  Users,
  KeyRound,
  Download,
  Trash2,
  Briefcase,
  AlertTriangle,
  Youtube,
  Instagram,
  Plus,
  Mail,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Tv
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency, SocialAccount, TeamMember } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAppLock } from '../context/AppLockContext';
import { useAuth } from '../context/AuthContext';
import { 
  apiSendEmailVerify, 
  apiVerifyEmailCode, 
  apiSendSmsOtp, 
  apiVerifyAccountPhone, 
  apiUpdateProfile 
} from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  appMode: 'simple' | 'advanced';
  setAppMode: (m: 'simple' | 'advanced') => void;
  simpleLayout: 'cards' | 'detailed' | 'table';
  setSimpleLayout: (l: 'cards' | 'detailed' | 'table') => void;
  onOpenPitch?: () => void;
  onOpenIntegrations?: () => void;
  onOpenMediaKit?: () => void;
  onOpenProfile?: () => void;
  onOpenRateCard?: () => void;
  onOpenExclusivity?: () => void;
  onOpenBrands?: () => void;
  onOpenPricing?: () => void;
  onOpenAdmin?: () => void;
}

type SettingsTab = 
  | 'general' 
  | 'verification'
  | 'channels'
  | 'team' 
  | 'commercial' 
  | 'invoicing' 
  | 'security' 
  | 'privacy';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currency,
  setCurrency,
  appMode,
  setAppMode,
  simpleLayout,
  setSimpleLayout,
  onOpenIntegrations
}) => {
  const { theme, setTheme } = useTheme();
  const { user, updateUser, refreshUser } = useAuth();
  const {
    isPinEnabled,
    isBiometricsEnabled,
    hasBiometricHardware,
    autoLockTimeout,
    enablePinLock,
    disablePinLock,
    setAutoLockTimeout,
    lockApp
  } = useAppLock();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // 1. General Workspace Profile State (Clean defaults, zero fake data)
  const [workspaceName, setWorkspaceName] = useState(() => localStorage.getItem('collabflow_ws_name') || (user?.name ? `${user.name} Workspace` : ''));
  const [creatorHandle, setCreatorHandle] = useState(() => localStorage.getItem('collabflow_creator_handle') || user?.handle || '');
  const [creatorNiche, setCreatorNiche] = useState(() => localStorage.getItem('collabflow_creator_niche') || user?.category || '');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('collabflow_ws_tz') || 'Asia/Kolkata (IST +5:30)');
  const [businessAddress, setBusinessAddress] = useState(() => localStorage.getItem('collabflow_biz_address') || '');

  // 2. Email & Phone Verification State
  const [emailVerifyCode, setEmailVerifyCode] = useState('');
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error'; message: string; previewCode?: string } | null>(null);

  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneFeedback, setPhoneFeedback] = useState<{ type: 'success' | 'error'; message: string; previewCode?: string } | null>(null);

  // 3. Multi-Channel & Multi-Page Management State
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(() => {
    return user?.social_accounts || [];
  });
  const [newAccPlatform, setNewAccPlatform] = useState<'youtube' | 'instagram' | 'tiktok' | 'x' | 'podcast'>('youtube');
  const [newAccName, setNewAccName] = useState('');
  const [newAccHandle, setNewAccHandle] = useState('');
  const [newAccNiche, setNewAccNiche] = useState('');

  // 4. Team & Client RBAC Permissions State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    return user?.team_members || [];
  });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<string>('Talent & Deal Manager');
  const [newMemberCanViewFinances, setNewMemberCanViewFinances] = useState(true);
  const [newMemberCanEditDeals, setNewMemberCanEditDeals] = useState(true);
  const [newMemberAllowedAccounts, setNewMemberAllowedAccounts] = useState<string[]>([]);

  // 5. Invoicing & Payout Defaults
  const [legalName, setLegalName] = useState(() => localStorage.getItem('collabflow_biz_name') || user?.name || '');
  const [taxId, setTaxId] = useState(() => localStorage.getItem('collabflow_biz_tax') || '');
  const [bankInfo, setBankInfo] = useState(() => localStorage.getItem('collabflow_biz_bank') || '');
  const [invoiceTerms, setInvoiceTerms] = useState(() => localStorage.getItem('collabflow_invoice_terms') || 'Payment due strictly within agreed terms.');

  // 6. Security App Lock State
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPinToRemove, setCurrentPinToRemove] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bioToggle, setBioToggle] = useState(isBiometricsEnabled);

  // Sync state if user loads later
  useEffect(() => {
    if (user) {
      if (user.social_accounts) setSocialAccounts(user.social_accounts);
      if (user.team_members) setTeamMembers(user.team_members);
      if (user.phone && !phoneInput) setPhoneInput(user.phone);
    }
  }, [user]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerSaveNotification = (msg: string) => {
    setSavedFeedback(msg);
    confetti({ particleCount: 35, spread: 45, origin: { y: 0.7 } });
    setTimeout(() => setSavedFeedback(null), 2500);
  };

  // Save General Workspace Settings
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('collabflow_ws_name', workspaceName);
    localStorage.setItem('collabflow_creator_handle', creatorHandle);
    localStorage.setItem('collabflow_creator_niche', creatorNiche);
    localStorage.setItem('collabflow_ws_tz', timezone);
    localStorage.setItem('collabflow_biz_address', businessAddress);

    if (user) {
      try {
        await apiUpdateProfile({
          handle: creatorHandle,
          category: creatorNiche,
        });
        updateUser({ handle: creatorHandle, category: creatorNiche });
      } catch (err) {}
    }

    triggerSaveNotification('Workspace configuration saved!');
  };

  // Email verification handlers
  const handleSendEmailVerification = async () => {
    setIsSendingEmailCode(true);
    setEmailFeedback(null);
    try {
      const res = await apiSendEmailVerify();
      setEmailFeedback({
        type: 'success',
        message: res.message,
        previewCode: res.preview_code
      });
      if (res.preview_code) {
        setEmailVerifyCode(res.preview_code);
      }
    } catch (err: any) {
      setEmailFeedback({
        type: 'error',
        message: err.message || 'Failed to send verification code.'
      });
    } finally {
      setIsSendingEmailCode(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVerifyCode.trim()) return;
    setIsVerifyingEmail(true);
    try {
      const res = await apiVerifyEmailCode(emailVerifyCode.trim());
      updateUser({ email_verified: true });
      setEmailFeedback({
        type: 'success',
        message: '✓ Email address verified successfully!'
      });
      confetti({ particleCount: 40, spread: 50 });
    } catch (err: any) {
      setEmailFeedback({
        type: 'error',
        message: err.message || 'Invalid or expired verification code.'
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Phone verification handlers
  const handleSendPhoneOtp = async () => {
    if (!phoneInput || phoneInput.trim().length < 8) {
      setPhoneFeedback({ type: 'error', message: 'Please enter a valid phone number first.' });
      return;
    }
    setIsSendingPhoneOtp(true);
    setPhoneFeedback(null);
    try {
      const res = await apiSendSmsOtp(phoneInput.trim());
      setPhoneFeedback({
        type: 'success',
        message: res.message,
        previewCode: res.preview_code
      });
      if (res.preview_code) {
        setPhoneOtp(res.preview_code);
      }
    } catch (err: any) {
      setPhoneFeedback({
        type: 'error',
        message: err.message || 'Failed to send SMS OTP.'
      });
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp.trim()) return;
    setIsVerifyingPhone(true);
    try {
      const res = await apiVerifyAccountPhone(phoneInput.trim(), phoneOtp.trim());
      updateUser({ phone_verified: true, phone: res.phone });
      setPhoneFeedback({
        type: 'success',
        message: '✓ Phone number verified successfully!'
      });
      confetti({ particleCount: 40, spread: 50 });
    } catch (err: any) {
      setPhoneFeedback({
        type: 'error',
        message: err.message || 'Invalid or expired SMS OTP code.'
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  // Multi-Channel Handlers
  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccHandle.trim()) return;
    const newAccount: SocialAccount = {
      id: 'acc-' + Date.now(),
      platform: newAccPlatform,
      name: newAccName.trim(),
      handle: newAccHandle.trim().startsWith('@') ? newAccHandle.trim() : '@' + newAccHandle.trim(),
      niche: newAccNiche.trim() || undefined
    };
    const updated = [...socialAccounts, newAccount];
    setSocialAccounts(updated);
    setNewAccName('');
    setNewAccHandle('');
    setNewAccNiche('');

    if (user) {
      try {
        await apiUpdateProfile({ social_accounts: updated });
        updateUser({ social_accounts: updated });
      } catch (err) {}
    }
    triggerSaveNotification(`${newAccount.name} channel linked!`);
  };

  const handleRemoveChannel = async (id: string) => {
    const updated = socialAccounts.filter(a => a.id !== id);
    setSocialAccounts(updated);
    if (user) {
      try {
        await apiUpdateProfile({ social_accounts: updated });
        updateUser({ social_accounts: updated });
      } catch (err) {}
    }
  };

  // Team & RBAC Handlers
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const newMember: TeamMember = {
      id: 'member-' + Date.now(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim().toLowerCase(),
      role: newMemberRole,
      status: 'Active',
      can_view_finances: newMemberCanViewFinances,
      can_edit_deals: newMemberCanEditDeals,
      allowed_account_ids: newMemberAllowedAccounts
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('Talent & Deal Manager');
    setNewMemberCanViewFinances(true);
    setNewMemberCanEditDeals(true);
    setNewMemberAllowedAccounts([]);

    if (user) {
      try {
        await apiUpdateProfile({ team_members: updated });
        updateUser({ team_members: updated });
      } catch (err) {}
    }
    triggerSaveNotification(`${newMember.name} added to workspace team!`);
  };

  const handleRemoveTeamMember = async (id: string) => {
    const updated = teamMembers.filter(m => m.id !== id);
    setTeamMembers(updated);
    if (user) {
      try {
        await apiUpdateProfile({ team_members: updated });
        updateUser({ team_members: updated });
      } catch (err) {}
    }
  };

  // Save Invoicing
  const handleSaveInvoicing = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('collabflow_biz_name', legalName);
    localStorage.setItem('collabflow_biz_tax', taxId);
    localStorage.setItem('collabflow_biz_bank', bankInfo);
    localStorage.setItem('collabflow_invoice_terms', invoiceTerms);
    triggerSaveNotification('Legal invoicing remittance saved!');
  };

  // PIN Lock Handlers
  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setPinFeedback({ type: 'error', text: 'PIN must be exactly 4 digits.' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinFeedback({ type: 'error', text: 'PINs do not match.' });
      return;
    }
    await enablePinLock(newPin, bioToggle);
    setNewPin('');
    setConfirmPin('');
    setPinFeedback({ type: 'success', text: 'Hardware app lock activated successfully!' });
    setTimeout(() => setPinFeedback(null), 3000);
  };

  const handleDisablePin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = disablePinLock(currentPinToRemove);
    if (ok) {
      setCurrentPinToRemove('');
      setPinFeedback({ type: 'success', text: 'PIN security app lock disabled.' });
      setTimeout(() => setPinFeedback(null), 3000);
    } else {
      setPinFeedback({ type: 'error', text: 'Incorrect current PIN.' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-xs">
              <Settings size={15} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Workspace Configuration</h3>
              <p className="text-[11px] text-zinc-500">Preferences, verifications, connected channels, and team controls</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body with Sidebar Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Tabs */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-2 md:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'general'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Briefcase size={14} />
              <span>General & View</span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'verification'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Email & Phone OTP</span>
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'channels'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Tv size={14} />
              <span>Channels & Pages</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'team'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Users size={14} />
              <span>Team & Client Access</span>
            </button>

            <button
              onClick={() => setActiveTab('invoicing')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'invoicing'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <FileText size={14} />
              <span>Invoicing & Remittance</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'security'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Lock size={14} />
              <span>PIN & App Lock</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'privacy'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Shield size={14} />
              <span>Data & GDPR</span>
            </button>
          </div>

          {/* Right Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs space-y-6">
            {savedFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
                <Check size={14} />
                <span className="font-semibold">{savedFeedback}</span>
              </div>
            )}

            {/* TAB 1: GENERAL WORKSPACE PROFILE */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveGeneral} className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Briefcase size={16} className="text-slate-900 dark:text-white" />
                    <span>General Workspace & Localization</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Set your legal workspace name, handle, timezones, and currency.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Workspace / Creator Studio Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Skyline Media Studio"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Primary Creator Handle</label>
                    <input
                      type="text"
                      placeholder="@yourhandle"
                      value={creatorHandle}
                      onChange={(e) => setCreatorHandle(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Primary Niche / Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Technology, Gaming, Lifestyle"
                      value={creatorNiche}
                      onChange={(e) => setCreatorNiche(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    >
                      <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                      <option value="America/New_York (EST -5:00)">America/New_York (EST -5:00)</option>
                      <option value="America/Los_Angeles (PST -8:00)">America/Los_Angeles (PST -8:00)</option>
                      <option value="Europe/London (GMT +0:00)">Europe/London (GMT +0:00)</option>
                      <option value="Asia/Dubai (GST +4:00)">Asia/Dubai (GST +4:00)</option>
                    </select>
                  </div>
                </div>

                {/* Appearance & Currency */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">
                    Pipeline Operational Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAppMode('simple')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        appMode === 'simple'
                          ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-zinc-900 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="text-xs text-zinc-900 dark:text-white font-bold">Starter / Simple Mode</span>
                      <span className="text-[10px] font-normal text-zinc-500">Fast card pipeline, instant deliverable checklist & 1-tap payouts. (No Kanban clutter)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAppMode('advanced')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        appMode === 'advanced'
                          ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-zinc-900 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="text-xs text-zinc-900 dark:text-white font-bold">Agency / Advanced Mode</span>
                      <span className="text-[10px] font-normal text-zinc-500">Unlocks Kanban drag & advance board, deliverable Gantt dates, and full financial analytics.</span>
                    </button>
                  </div>
                </div>

                {/* Theme & Currency */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      theme === 'light' ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                    }`}
                  >
                    <Sun size={15} />
                    <span className="text-[11px]">Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      theme === 'dark' ? 'border-slate-800 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                    }`}
                  >
                    <Moon size={15} />
                    <span className="text-[11px]">Dark Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      currency === 'INR' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                    }`}
                  >
                    <span className="font-bold">₹</span>
                    <span className="text-[11px]">INR Rupee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      currency === 'USD' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                    }`}
                  >
                    <span className="font-bold">$</span>
                    <span className="text-[11px]">USD Dollar</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs transition-colors shadow-xs"
                >
                  Save Workspace Details
                </button>
              </form>
            )}

            {/* TAB 2: EMAIL & PHONE VERIFICATION */}
            {activeTab === 'verification' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span>Identity Verification & Security OTP</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Verify your email address and mobile phone number for deal notices, contract authorizations, and payout security.
                  </p>
                </div>

                {/* Email Verification Card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        <Mail size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-900 dark:text-white">Email Address</span>
                          {user?.email_verified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <AlertTriangle size={11} /> Unverified
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 font-mono">{user?.email || 'No email associated'}</span>
                      </div>
                    </div>

                    {!user?.email_verified && (
                      <button
                        type="button"
                        disabled={isSendingEmailCode}
                        onClick={handleSendEmailVerification}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                      >
                        {isSendingEmailCode ? 'Sending Code...' : 'Send Verification Code'}
                      </button>
                    )}
                  </div>

                  {emailFeedback && (
                    <div className={`p-3 rounded-xl border text-xs ${
                      emailFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300'
                    }`}>
                      <p>{emailFeedback.message}</p>
                      {emailFeedback.previewCode && (
                        <p className="mt-1 font-mono font-bold">Instant Code Preview: {emailFeedback.previewCode}</p>
                      )}
                    </div>
                  )}

                  {!user?.email_verified && (
                    <form onSubmit={handleVerifyEmailCode} className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={emailVerifyCode}
                        onChange={(e) => setEmailVerifyCode(e.target.value.replace(/\D/g, ''))}
                        className="w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-slate-800"
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingEmail || emailVerifyCode.length !== 6}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                      >
                        {isVerifyingEmail ? 'Verifying...' : 'Confirm Email'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Mobile Phone Verification Card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        <Smartphone size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-900 dark:text-white">Mobile Phone (SMS Gateway)</span>
                          {user?.phone_verified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <AlertTriangle size={11} /> Unverified
                            </span>
                          )}
                        </div>
                        <input
                          type="tel"
                          placeholder="+91 98000 00000"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-slate-800"
                        />
                      </div>
                    </div>

                    {!user?.phone_verified && (
                      <button
                        type="button"
                        disabled={isSendingPhoneOtp}
                        onClick={handleSendPhoneOtp}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                      >
                        {isSendingPhoneOtp ? 'Sending SMS...' : 'Send SMS OTP'}
                      </button>
                    )}
                  </div>

                  {phoneFeedback && (
                    <div className={`p-3 rounded-xl border text-xs ${
                      phoneFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300'
                    }`}>
                      <p>{phoneFeedback.message}</p>
                      {phoneFeedback.previewCode && (
                        <p className="mt-1 font-mono font-bold">Instant Sandbox OTP: {phoneFeedback.previewCode}</p>
                      )}
                    </div>
                  )}

                  {!user?.phone_verified && (
                    <form onSubmit={handleVerifyPhoneOtp} className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-slate-800"
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingPhone || phoneOtp.length !== 6}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                      >
                        {isVerifyingPhone ? 'Verifying...' : 'Confirm Phone OTP'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MULTI-CHANNEL & MULTI-PAGE MANAGEMENT */}
            {activeTab === 'channels' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Tv size={16} className="text-slate-900 dark:text-white" />
                    <span>Connected Channels & Social Pages</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    A single creator can operate multiple YouTube Channels and Instagram Pages. Link all your pages below so you can tag and assign sponsorships per channel.
                  </p>
                </div>

                {/* Connected Channels List */}
                <div className="space-y-2.5">
                  {socialAccounts.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-1">
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">No extra channels or pages linked yet</p>
                      <p className="text-[11px] text-zinc-500">Add your secondary YouTube channels, Shorts channels, or Instagram pages below.</p>
                    </div>
                  ) : (
                    socialAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            account.platform === 'youtube'
                              ? 'bg-red-500/10 text-red-500'
                              : account.platform === 'instagram'
                              ? 'bg-pink-500/10 text-pink-500'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600'
                          }`}>
                            {account.platform === 'youtube' ? <Youtube size={16} /> : <Instagram size={16} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-zinc-900 dark:text-white">{account.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
                                {account.platform}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                              <span className="font-mono text-indigo-600 dark:text-indigo-400">{account.handle}</span>
                              {account.niche && <span>• {account.niche}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveChannel(account.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Remove channel"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Channel Form */}
                <form onSubmit={handleAddChannel} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Plus size={14} />
                    <span>Link New YouTube Channel or Instagram Page</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <select
                      value={newAccPlatform}
                      onChange={(e: any) => setNewAccPlatform(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    >
                      <option value="youtube">YouTube Channel</option>
                      <option value="instagram">Instagram Page</option>
                      <option value="tiktok">TikTok Profile</option>
                      <option value="x">X / Twitter</option>
                      <option value="podcast">Podcast Show</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Page Name (e.g. Daily Shorts)"
                      value={newAccName}
                      onChange={(e) => setNewAccName(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    />

                    <input
                      type="text"
                      placeholder="Handle (e.g. @dailyshorts)"
                      value={newAccHandle}
                      onChange={(e) => setNewAccHandle(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800 font-mono"
                    />

                    <input
                      type="text"
                      placeholder="Niche (e.g. Tech Shorts)"
                      value={newAccNiche}
                      onChange={(e) => setNewAccNiche(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs transition-colors shadow-xs"
                  >
                    Add Channel
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: TEAM & CLIENT RBAC PERMISSIONS */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Users size={16} className="text-slate-900 dark:text-white" />
                    <span>Team Collaborators & Client Access (RBAC)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Invite editors, talent managers, and external clients with granular permission controls. Restrict deals to specific channels or hide sensitive payout amounts.
                  </p>
                </div>

                {/* Team Members List */}
                <div className="space-y-2.5">
                  {teamMembers.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-1">
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">No team members or clients invited yet</p>
                      <p className="text-[11px] text-zinc-500">Invite talent managers, editors, or brand clients below.</p>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-zinc-900 dark:text-white">{member.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold">
                              {member.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 font-mono">{member.email}</p>
                          
                          {/* Granular Permission Badges */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                              member.can_view_finances 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}>
                              {member.can_view_finances ? <Eye size={10} /> : <EyeOff size={10} />}
                              {member.can_view_finances ? 'Finances Visible' : 'Finances Hidden'}
                            </span>

                            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                              {member.can_edit_deals ? 'Can Edit Deals' : 'Read-Only Viewer'}
                            </span>

                            {member.allowed_account_ids && member.allowed_account_ids.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                Restricted to {member.allowed_account_ids.length} channel(s)
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Team Member / Client Form */}
                <form onSubmit={handleAddTeamMember} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Plus size={14} />
                    <span>Invite Collaborator or Client with Permissions</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      placeholder="Collaborator / Client Name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    />

                    <input
                      type="email"
                      placeholder="colleague@agency.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    />

                    <select
                      value={newMemberRole}
                      onChange={(e) => {
                        const r = e.target.value;
                        setNewMemberRole(r);
                        if (r.includes('Client') || r.includes('Editor')) {
                          setNewMemberCanViewFinances(false);
                        }
                      }}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    >
                      <option value="Talent & Deal Manager">Talent & Deal Manager</option>
                      <option value="Lead Video Editor">Lead Video Editor</option>
                      <option value="Chartered Accountant / Tax">Chartered Accountant / Tax</option>
                      <option value="Client / Brand Read-Only">Client / Brand Read-Only</option>
                      <option value="Team Member">General Team Member</option>
                    </select>
                  </div>

                  {/* Permission Toggles */}
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMemberCanViewFinances}
                        onChange={(e) => setNewMemberCanViewFinances(e.target.checked)}
                        className="rounded text-slate-900"
                      />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Allow viewing financial details (deal amounts, payment status, banking info)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMemberCanEditDeals}
                        onChange={(e) => setNewMemberCanEditDeals(e.target.checked)}
                        className="rounded text-slate-900"
                      />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Allow editing deals, stage advancement, and checklist items
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs transition-colors shadow-xs"
                  >
                    Add Collaborator
                  </button>
                </form>
              </div>
            )}

            {/* TAB 5: INVOICING & REMITTANCE */}
            {activeTab === 'invoicing' && (
              <form onSubmit={handleSaveInvoicing} className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <FileText size={16} className="text-slate-900 dark:text-white" />
                    <span>Invoicing Legal Entity & Remittance Information</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Appears on 1-click PDF invoices, tax receipts, and payment notices.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Legal Business / Entity Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Skyline Digital Media LLP"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Tax ID (GSTIN / PAN / VAT / EIN)</label>
                    <input
                      type="text"
                      placeholder="e.g. GSTIN: 27AABCA1234F1Z8"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Bank Wire & UPI Remittance Details</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Bank: HDFC Bank | A/C: 502000000000 | IFSC: HDFC0000123 | UPI: handle@okaxis"
                      value={bankInfo}
                      onChange={(e) => setBankInfo(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-slate-800 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs transition-colors shadow-xs"
                >
                  Save Invoicing Details
                </button>
              </form>
            )}

            {/* TAB 6: SECURITY PIN & BIOMETRIC APP LOCK */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Lock size={16} className="text-slate-900 dark:text-white" />
                    <span>Security PIN & Hardware Lock</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Lock your workspace deals when stepping away from your desk.
                  </p>
                </div>

                {pinFeedback && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    pinFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                  }`}>
                    <Check size={14} />
                    <span>{pinFeedback.text}</span>
                  </div>
                )}

                {isPinEnabled ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                        <ShieldCheck size={18} />
                        <span>Security App Lock is Active (4-Digit PIN)</span>
                      </div>
                      <button
                        type="button"
                        onClick={lockApp}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-xs"
                      >
                        Lock Workspace Now
                      </button>
                    </div>

                    <form onSubmit={handleDisablePin} className="pt-2 border-t border-emerald-500/20 flex items-center gap-2">
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Current 4-digit PIN"
                        value={currentPinToRemove}
                        onChange={(e) => setCurrentPinToRemove(e.target.value)}
                        className="w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-center font-mono tracking-widest focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-500/20 transition-colors"
                      >
                        Disable PIN Lock
                      </button>
                    </form>
                  </div>
                ) : (
                  <form onSubmit={handleSetPin} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <KeyRound size={14} className="text-slate-900 dark:text-white" />
                      <span>Set Up New 4-Digit Security PIN</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="New PIN"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-center font-mono text-base tracking-widest focus:outline-none focus:border-slate-800"
                      />
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Confirm PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-center font-mono text-base tracking-widest focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    {hasBiometricHardware && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="bioToggle"
                          checked={bioToggle}
                          onChange={(e) => setBioToggle(e.target.checked)}
                          className="w-4 h-4 rounded text-slate-900"
                        />
                        <label htmlFor="bioToggle" className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                          <Fingerprint size={13} className="text-slate-800 dark:text-zinc-200" />
                          <span>Enable TouchID / FaceID Biometric Unlock</span>
                        </label>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs transition-colors shadow-xs"
                    >
                      Enable App Lock
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 7: DATA & GDPR PURGE */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Shield size={16} className="text-slate-900 dark:text-white" />
                    <span>Data Ownership & GDPR Compliance</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Export your full deal history in JSON format or purge workspace data.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-zinc-900 dark:text-white">Export Full Workspace Data</h5>
                    <p className="text-[11px] text-zinc-500">Download complete collaborations, invoices, and brand directory in JSON.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
                      const a = document.createElement('a');
                      a.setAttribute("href", dataStr);
                      a.setAttribute("download", "collabflow-workspace-backup.json");
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    }}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
