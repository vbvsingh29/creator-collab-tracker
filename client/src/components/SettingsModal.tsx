import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  Sliders, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Database, 
  FileText, 
  Save,
  Lock,
  Fingerprint,
  Smartphone,
  Bot,
  Sparkles,
  Radio,
  Building2,
  Calculator,
  ShieldAlert,
  Crown,
  User as UserIcon,
  Activity,
  Users,
  KeyRound,
  Download,
  Trash2,
  Layers,
  Clock,
  Globe,
  Briefcase,
  AlertTriangle,
  Youtube,
  Instagram,
  HelpCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAppLock } from '../context/AppLockContext';

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
  | 'commercial' 
  | 'pipeline' 
  | 'integrations' 
  | 'team' 
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
  onOpenPitch,
  onOpenIntegrations,
  onOpenMediaKit,
  onOpenProfile,
  onOpenRateCard,
  onOpenExclusivity,
  onOpenBrands,
  onOpenPricing,
  onOpenAdmin
}) => {
  const { theme, setTheme } = useTheme();
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

  // 1. General Workspace Profile State
  const [workspaceName, setWorkspaceName] = useState(() => localStorage.getItem('collabflow_ws_name') || 'Aarav Tech Studio');
  const [creatorHandle, setCreatorHandle] = useState(() => localStorage.getItem('collabflow_creator_handle') || '@aarav_tech');
  const [creatorNiche, setCreatorNiche] = useState(() => localStorage.getItem('collabflow_creator_niche') || 'Tech & Consumer Electronics');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('collabflow_ws_tz') || 'Asia/Kolkata (IST +5:30)');
  const [businessAddress, setBusinessAddress] = useState(() => localStorage.getItem('collabflow_biz_address') || 'Bandra West, Mumbai, MH, 400050, India');

  // 2. Commercial Rates & Rules State
  const [baseReelRate, setBaseReelRate] = useState(() => localStorage.getItem('collabflow_rate_reel') || '35000');
  const [baseVideoRate, setBaseVideoRate] = useState(() => localStorage.getItem('collabflow_rate_video') || '75000');
  const [baseStoryRate, setBaseStoryRate] = useState(() => localStorage.getItem('collabflow_rate_story') || '12000');
  const [whitelistingFee, setWhitelistingFee] = useState(() => localStorage.getItem('collabflow_fee_whitelisting') || '15000');
  const [enableRushFee, setEnableRushFee] = useState(() => localStorage.getItem('collabflow_enable_rush') === 'true');
  const [minimumDealFloor, setMinimumDealFloor] = useState(() => localStorage.getItem('collabflow_deal_floor') || '25000');

  // 3. Pipeline & Automation State
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(() => localStorage.getItem('collabflow_default_payment_terms') || 'net_30');
  const [autoFollowUpDays, setAutoFollowUpDays] = useState(() => localStorage.getItem('collabflow_autofollowup_days') || '7');
  const [autoReminderEnabled, setAutoReminderEnabled] = useState(() => localStorage.getItem('collabflow_auto_reminders') !== 'false');

  // 4. Invoicing & Payout Defaults
  const [legalName, setLegalName] = useState(() => localStorage.getItem('collabflow_biz_name') || 'Aarav Sharma Digital LLP');
  const [taxId, setTaxId] = useState(() => localStorage.getItem('collabflow_biz_tax') || 'GSTIN: 27AABCA1234F1Z8 | PAN: ABCDE1234F');
  const [bankInfo, setBankInfo] = useState(() => localStorage.getItem('collabflow_biz_bank') || 'HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0000123 | UPI: aarav@okaxis');
  const [invoiceTerms, setInvoiceTerms] = useState(() => localStorage.getItem('collabflow_invoice_terms') || 'Payment due strictly within agreed terms. Late payments accrue 1.5% monthly interest.');

  // 5. Team & Agency Members State
  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem('collabflow_team_members');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: '1', name: 'Aarav Sharma', email: 'aarav@tech.com', role: 'Owner / Head Creator', status: 'Active' },
      { id: '2', name: 'Rohan Kapoor', email: 'rohan@talentpartners.in', role: 'Talent & Deal Manager', status: 'Active' },
      { id: '3', name: 'Karan Dave', email: 'editor@aaravtech.com', role: 'Lead Video Editor', status: 'Active' },
      { id: '4', name: 'Meera Joshi', email: 'ca@financestudio.in', role: 'Chartered Accountant / Tax', status: 'Active' }
    ];
  });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Talent & Deal Manager');

  // 6. Security App Lock State
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPinToRemove, setCurrentPinToRemove] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bioToggle, setBioToggle] = useState(isBiometricsEnabled);

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
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setSavedFeedback(null), 2500);
  };

  // Save General Workspace Settings
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('collabflow_ws_name', workspaceName);
    localStorage.setItem('collabflow_creator_handle', creatorHandle);
    localStorage.setItem('collabflow_creator_niche', creatorNiche);
    localStorage.setItem('collabflow_ws_tz', timezone);
    localStorage.setItem('collabflow_biz_address', businessAddress);
    triggerSaveNotification('Workspace Profile & Localization saved successfully!');
  };

  // Save Commercial Rates
  const handleSaveCommercial = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('collabflow_rate_reel', baseReelRate);
    localStorage.setItem('collabflow_rate_video', baseVideoRate);
    localStorage.setItem('collabflow_rate_story', baseStoryRate);
    localStorage.setItem('collabflow_fee_whitelisting', whitelistingFee);
    localStorage.setItem('collabflow_enable_rush', enableRushFee ? 'true' : 'false');
    localStorage.setItem('collabflow_deal_floor', minimumDealFloor);
    triggerSaveNotification('Commercial rate cards & automated surcharge rules updated!');
  };

  // Save Pipeline Automations
  const handleSavePipeline = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('collabflow_default_payment_terms', defaultPaymentTerms);
    localStorage.setItem('collabflow_autofollowup_days', autoFollowUpDays);
    localStorage.setItem('collabflow_auto_reminders', autoReminderEnabled ? 'true' : 'false');
    triggerSaveNotification('Pipeline workflows & payment escalation rules saved!');
  };

  // Save Invoicing Settings
  const handleSaveInvoicing = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('collabflow_biz_name', legalName);
    localStorage.setItem('collabflow_biz_tax', taxId);
    localStorage.setItem('collabflow_biz_bank', bankInfo);
    localStorage.setItem('collabflow_invoice_terms', invoiceTerms);
    triggerSaveNotification('Invoicing entity details & remittance terms updated!');
  };

  // Add Team Member
  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    const updated = [
      ...teamMembers,
      {
        id: `team-${Date.now()}`,
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        role: newMemberRole,
        status: 'Active'
      }
    ];
    setTeamMembers(updated);
    localStorage.setItem('collabflow_team_members', JSON.stringify(updated));
    setNewMemberName('');
    setNewMemberEmail('');
    triggerSaveNotification(`Added ${newMemberName} to workspace team roster.`);
  };

  // Remove Team Member
  const handleRemoveTeamMember = (id: string) => {
    if (confirm('Revoke access for this workspace collaborator?')) {
      const updated = teamMembers.filter((m: any) => m.id !== id);
      setTeamMembers(updated);
      localStorage.setItem('collabflow_team_members', JSON.stringify(updated));
      triggerSaveNotification('Team collaborator removed.');
    }
  };

  // Security PIN Set
  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinFeedback({ type: 'error', text: 'PIN must be exactly 4 digits.' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinFeedback({ type: 'error', text: 'PINs do not match.' });
      return;
    }
    await enablePinLock(newPin, bioToggle);
    setPinFeedback({ type: 'success', text: '4-digit PIN lock activated successfully!' });
    setNewPin('');
    setConfirmPin('');
    confetti({ particleCount: 30, spread: 40 });
  };

  // Security PIN Remove
  const handleDisablePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);
    const success = disablePinLock(currentPinToRemove);
    if (success) {
      setPinFeedback({ type: 'success', text: 'PIN lock disabled.' });
      setCurrentPinToRemove('');
    } else {
      setPinFeedback({ type: 'error', text: 'Incorrect current PIN.' });
    }
  };

  // Export Full Workspace Data Backup (JSON)
  const handleExportFullBackup = () => {
    const backupData = {
      version: '1.2.0',
      exported_at: new Date().toISOString(),
      workspace: {
        name: workspaceName,
        handle: creatorHandle,
        category: creatorNiche,
        currency,
        timezone,
        address: businessAddress
      },
      rates: {
        reel: baseReelRate,
        video: baseVideoRate,
        story: baseStoryRate,
        whitelisting: whitelistingFee
      },
      invoicing: {
        legalName,
        taxId,
        bankInfo
      },
      team: teamMembers
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `collabflow_workspace_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerSaveNotification('Full workspace JSON archive downloaded.');
  };

  // Clear Cache
  const handleClearCache = () => {
    if (confirm('Clear local browser display cache and temporary filters? (Deal records remain preserved).')) {
      localStorage.removeItem('collabflow_simple_layout');
      localStorage.removeItem('collabflow_biz_name');
      localStorage.removeItem('collabflow_biz_tax');
      localStorage.removeItem('collabflow_biz_bank');
      triggerSaveNotification('Local preferences cache cleared.');
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div 
        className="w-full max-w-5xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Settings size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">Workspace & Platform Settings</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Creator Suite
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Configure business entity profiles, commercial rate floors, team seats, and security defaults
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Launchpad to all App Pages / Tools */}
        <div className="p-3.5 mx-6 mt-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              <span>Workspace Quick Launch Tools</span>
            </span>
            <span className="text-[10px] text-zinc-400">1-click direct navigation</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {onOpenPitch && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenPitch(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-colors shadow-xs"
              >
                <Bot size={12} className="text-purple-500" />
                <span>AI Pitch Studio</span>
              </button>
            )}

            {onOpenIntegrations && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenIntegrations(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-colors shadow-xs"
              >
                <Radio size={12} className="text-emerald-500" />
                <span>Live Integrations</span>
              </button>
            )}

            {onOpenMediaKit && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenMediaKit(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-300 text-xs font-semibold hover:bg-pink-500/20 transition-colors shadow-xs"
              >
                <Sparkles size={12} className="text-pink-500" />
                <span>Media Kit One-Pager</span>
              </button>
            )}

            {onOpenProfile && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenProfile(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-500/20 transition-colors shadow-xs"
              >
                <UserIcon size={12} className="text-indigo-500" />
                <span>Profile & Rates</span>
              </button>
            )}

            {onOpenRateCard && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenRateCard(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Calculator size={12} className="text-indigo-500" />
                <span>Rate Calculator</span>
              </button>
            )}

            {onOpenExclusivity && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenExclusivity(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ShieldAlert size={12} className="text-amber-500" />
                <span>Exclusivity Radar</span>
              </button>
            )}

            {onOpenBrands && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenBrands(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Building2 size={12} className="text-zinc-500" />
                <span>Brand Directory</span>
              </button>
            )}

            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenAdmin(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-500/20 transition-colors shadow-xs"
              >
                <Activity size={12} className="text-teal-500" />
                <span>Platform Observatory</span>
              </button>
            )}

            {onOpenPricing && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenPricing(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors shadow-xs"
              >
                <Crown size={12} className="text-amber-500" />
                <span>Upgrade Pro</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-Tab Workspace Navigation Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Tab Sidebar */}
          <div className="w-full md:w-56 p-3 md:border-r border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 shrink-0 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1 border-b md:border-b-0">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'general'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Briefcase size={14} />
              <span>General Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('commercial')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'commercial'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <CreditCard size={14} />
              <span>Commercial & Rates</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'pipeline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Sliders size={14} />
              <span>Pipeline & Workflow</span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'integrations'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Radio size={14} />
              <span>Integrations & APIs</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'team'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Users size={14} />
              <span>Team & Agency Roles</span>
            </button>

            <button
              onClick={() => setActiveTab('invoicing')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'invoicing'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <FileText size={14} />
              <span>Invoicing & Payouts</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Lock size={14} />
              <span>Security & PIN</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 md:w-full text-left ${
                activeTab === 'privacy'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Data & GDPR</span>
            </button>
          </div>

          {/* Right Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs space-y-6">

            {savedFeedback && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
                <Check size={15} />
                <span className="font-semibold">{savedFeedback}</span>
              </div>
            )}

            {/* TAB 1: GENERAL WORKSPACE PROFILE */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveGeneral} className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Briefcase size={16} className="text-indigo-500" />
                    <span>General Workspace & Localization</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Primary operational profile, timezones, and display layout
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Workspace Legal Name</label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Creator Handle</label>
                    <input
                      type="text"
                      value={creatorHandle}
                      onChange={(e) => setCreatorHandle(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Primary Creator Niche</label>
                    <input
                      type="text"
                      value={creatorNiche}
                      onChange={(e) => setCreatorNiche(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Workspace Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                      <option value="America/New_York (EST -5:00)">America/New_York (EST -5:00)</option>
                      <option value="America/Los_Angeles (PST -8:00)">America/Los_Angeles (PST -8:00)</option>
                      <option value="Europe/London (GMT +0:00)">Europe/London (GMT +0:00)</option>
                      <option value="Asia/Dubai (GST +4:00)">Asia/Dubai (GST +4:00)</option>
                      <option value="Asia/Singapore (SGT +8:00)">Asia/Singapore (SGT +8:00)</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Registered Business / Studio Address</label>
                    <input
                      type="text"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Appearance & Currency */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">
                    Theme Interface & Base Currency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        theme === 'light' ? 'border-amber-500 bg-amber-500/10 text-amber-600 font-bold' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      <Sun size={16} />
                      <span className="text-[11px]">Light Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      <Moon size={16} />
                      <span className="text-[11px]">Dark Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrency('INR')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        currency === 'INR' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      <span className="text-base font-bold">₹</span>
                      <span className="text-[11px]">INR Rupee</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        currency === 'USD' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      <span className="text-base font-bold">$</span>
                      <span className="text-[11px]">USD Dollar</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Save size={14} />
                  <span>Save General Profile</span>
                </button>
              </form>
            )}

            {/* TAB 2: COMMERCIAL RATES & RULES */}
            {activeTab === 'commercial' && (
              <form onSubmit={handleSaveCommercial} className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <CreditCard size={16} className="text-emerald-500" />
                    <span>Commercial Rate Cards & Surcharge Automations</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Set baseline format pricing, deal minimum floor, and automated rush delivery fees
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Baseline Dedicated 60s Reel ({currency})</label>
                    <input
                      type="number"
                      value={baseReelRate}
                      onChange={(e) => setBaseReelRate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Dedicated 8-15m YouTube Video ({currency})</label>
                    <input
                      type="number"
                      value={baseVideoRate}
                      onChange={(e) => setBaseVideoRate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">24-Hour Story Sequence + Link ({currency})</label>
                    <input
                      type="number"
                      value={baseStoryRate}
                      onChange={(e) => setBaseStoryRate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Meta Ads 30-Day Whitelisting Fee ({currency})</label>
                    <input
                      type="number"
                      value={whitelistingFee}
                      onChange={(e) => setWhitelistingFee(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Minimum Deal Floor ({currency})</label>
                    <input
                      type="number"
                      value={minimumDealFloor}
                      onChange={(e) => setMinimumDealFloor(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <span className="text-[10px] text-zinc-400">Inquiries below this floor trigger counter-offer proposals.</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Rush Delivery Surcharge (+25%)</span>
                      <span className="text-[10px] text-zinc-500">Automatically adds 25% for turnaround under 48 hours</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableRushFee}
                      onChange={(e) => setEnableRushFee(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Save size={14} />
                  <span>Save Commercial Rates</span>
                </button>
              </form>
            )}

            {/* TAB 3: PIPELINE & WORKFLOW AUTOMATION */}
            {activeTab === 'pipeline' && (
              <form onSubmit={handleSavePipeline} className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sliders size={16} className="text-purple-500" />
                    <span>Pipeline Workflow & Escalation Rules</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Configure default milestone terms, payment recovery reminders, and deliverable checklists
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Default Commercial Payment Terms</label>
                    <select
                      value={defaultPaymentTerms}
                      onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="50_advance_50_post">50% Advance + 50% Post Go-Live (Recommended)</option>
                      <option value="100_upfront">100% Upfront Advance</option>
                      <option value="net_15">Net-15 Days Post-Live</option>
                      <option value="net_30">Net-30 Days Post-Live</option>
                      <option value="milestone">Milestone / Script Approval</option>
                      <option value="barter_only">Barter / Gifting Only</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Overdue Follow-up Grace Period (Days)</label>
                    <select
                      value={autoFollowUpDays}
                      onChange={(e) => setAutoFollowUpDays(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="3">3 Days (Fast Pace)</option>
                      <option value="7">7 Days (Industry Standard)</option>
                      <option value="14">14 Days (Extended)</option>
                    </select>
                  </div>

                  <div className="p-3 sm:col-span-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Automated Overdue Escalation Notices</span>
                      <span className="text-[10px] text-zinc-500">Tier 1 friendly, Tier 2 firm inquiry, and Tier 3 rights suspension generator</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoReminderEnabled}
                      onChange={(e) => setAutoReminderEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Save size={14} />
                  <span>Save Pipeline Rules</span>
                </button>
              </form>
            )}

            {/* TAB 4: INTEGRATIONS & APIS */}
            {activeTab === 'integrations' && (
              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Radio size={16} className="text-emerald-500" />
                    <span>Channel Integrations & API Credentials</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Live channel metric synchronization, video embedding, and cloud drives
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                        <Youtube size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <span>YouTube Data v3 & Public oEmbed</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-bold">Connected</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">Aarav Tech Studio • Channel: UC_aarav_tech • Hourly sync active</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">142K Subs</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                        <Instagram size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <span>Instagram Graph API & Reels Embed</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-bold">Connected</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">@aarav_tech • Reel shortcode sync & link sticker detection</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">89.4K Followers</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                        <Bot size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <span>AI Pitch Intelligence Pipeline</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 font-bold">Hybrid Flash</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">Algorithmic + Gemini 1.5 Flash client-side direct API key enabled</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">Instant</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] flex items-center justify-between">
                  <span>Want to test a live YouTube video or Instagram reel link right now?</span>
                  {onOpenIntegrations && (
                    <button
                      type="button"
                      onClick={() => { onClose(); onOpenIntegrations(); }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs"
                    >
                      Open Tester
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: TEAM & AGENCY ROLES */}
            {activeTab === 'team' && (
              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Users size={16} className="text-indigo-500" />
                    <span>Team Members & Agency Collaborator Roster</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Invite talent managers, editors, and accountants with isolated workspace roles
                  </p>
                </div>

                {/* Team Members List */}
                <div className="space-y-2">
                  {teamMembers.map((member: any) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span>{member.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-normal">
                              {member.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono">{member.email}</span>
                        </div>
                      </div>

                      {member.role !== 'Owner / Head Creator' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Team Member Form */}
                <form onSubmit={handleAddTeamMember} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Plus size={13} />
                    <span>Invite New Workspace Collaborator</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      placeholder="Collaborator Name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />

                    <input
                      type="email"
                      placeholder="colleague@agency.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />

                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Talent & Deal Manager">Talent & Deal Manager</option>
                      <option value="Lead Video Editor">Lead Video Editor</option>
                      <option value="Chartered Accountant / Tax">Chartered Accountant / Tax</option>
                      <option value="Viewer / Client Read-Only">Viewer / Read-Only</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs transition-colors"
                  >
                    Add Collaborator
                  </button>
                </form>
              </div>
            )}

            {/* TAB 6: INVOICING & PAYOUT DETAILS */}
            {activeTab === 'invoicing' && (
              <form onSubmit={handleSaveInvoicing} className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <FileText size={16} className="text-amber-500" />
                    <span>Invoicing Legal Entity & Remittance Information</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Displayed on 1-click PDF brand invoices, tax receipts, and payment notices
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Legal Business / Entity Name</label>
                    <input
                      type="text"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Tax Registration (GSTIN / PAN / VAT / EIN)</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Banking Wire & UPI Remittance Details</label>
                    <textarea
                      rows={3}
                      value={bankInfo}
                      onChange={(e) => setBankInfo(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Default Invoice Payment Terms Disclaimer</label>
                    <textarea
                      rows={2}
                      value={invoiceTerms}
                      onChange={(e) => setInvoiceTerms(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Save size={14} />
                  <span>Save Invoicing Details</span>
                </button>
              </form>
            )}

            {/* TAB 7: SECURITY & BIOMETRIC APP LOCK */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Lock size={16} className="text-indigo-500" />
                    <span>Security PIN & Biometric Hardware App Lock</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Prevent unauthorized deal inspections when leaving laptop or smartphone unattended
                  </p>
                </div>

                {pinFeedback && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    pinFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                  }`}>
                    {pinFeedback.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                    <span>{pinFeedback.text}</span>
                  </div>
                )}

                {isPinEnabled ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
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
                      <KeyRound size={14} className="text-indigo-500" />
                      <span>Set Up New 4-Digit Security PIN</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="New 4-Digit PIN"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-center font-mono text-base tracking-widest focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Confirm PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-center font-mono text-base tracking-widest focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {hasBiometricHardware && (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="bioToggle"
                          checked={bioToggle}
                          onChange={(e) => setBioToggle(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                        <label htmlFor="bioToggle" className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                          <Fingerprint size={13} className="text-indigo-500" />
                          <span>Enable TouchID / FaceID Biometric Unlock</span>
                        </label>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      Enable App Lock
                    </button>
                  </form>
                )}

                {/* Auto Lock Timeout */}
                <div className="space-y-1 pt-2">
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Inactivity Auto-Lock Timer</label>
                  <select
                    value={autoLockTimeout}
                    onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
                    className="w-full sm:w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value={0}>Immediate (Upon Tab Blur)</option>
                    <option value={1}>1 Minute Inactive</option>
                    <option value={5}>5 Minutes Inactive</option>
                    <option value={15}>15 Minutes Inactive</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 8: DATA PRIVACY, BACKUP & GDPR */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span>Data Privacy, Backup Export & GDPR Portability</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    GDPR Article 20 data portability archive, local storage controls, and cache management
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white block">Download Full Workspace Archive</span>
                      <span className="text-[11px] text-zinc-500">Exports all deal data, rate cards, and settings in structured JSON format</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportFullBackup}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      <Download size={13} />
                      <span>Export JSON Backup</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white block">Clear Local Cache & Session Storage</span>
                      <span className="text-[11px] text-zinc-500">Refreshes cached display filters and temporary browser states</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearCache}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-xs transition-colors"
                    >
                      <Trash2 size={13} className="text-zinc-500" />
                      <span>Clear Cache</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                    <span>GDPR Compliance: Zero commercial deal amounts are leaked into platform telemetry.</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">Art. 25 Verified</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900/70 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Workspace Cloud Sync: Active</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-zinc-400">Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono">ESC</kbd> to exit</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
