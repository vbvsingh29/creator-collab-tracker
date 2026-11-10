import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Eye, 
  EyeOff, 
  Check, 
  Trash2, 
  X, 
  Copy, 
  Mail, 
  Clock,
  Layers
} from 'lucide-react';
import { useAccounts } from '../context/AccountContext';
import { fetchTeamData, inviteTeamMember, removeTeamMember, revokeTeamInvite } from '../services/api';
import { TeamMember, TeamInvite } from '../types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ isOpen, onClose }) => {
  const { accounts } = useAccounts();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Invite Form State
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('manager');
  const [canViewFinancials, setCanViewFinancials] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['all']);
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await fetchTeamData();
      setMembers((res as any)?.members || []);
      setPendingInvites((res as any)?.pendingInvites || []);
    } catch (err: any) {
      console.warn('⚠️ [TeamModal] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTeam();
      setInviteSuccess(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleChannel = (channelId: string) => {
    if (channelId === 'all') {
      setSelectedChannels(['all']);
      return;
    }
    let updated = selectedChannels.filter(c => c !== 'all');
    if (updated.includes(channelId)) {
      updated = updated.filter(c => c !== channelId);
      if (updated.length === 0) updated = ['all'];
    } else {
      updated.push(channelId);
    }
    setSelectedChannels(updated);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setInviting(true);
      setError(null);
      setInviteSuccess(null);

      const res = await inviteTeamMember({
        email: email.trim().toLowerCase(),
        role,
        canViewFinancials,
        assignedAccounts: selectedChannels
      });

      setInviteSuccess((res as any)?.message || 'Invitation sent successfully!');
      setEmail('');
      setCanViewFinancials(false);
      setSelectedChannels(['all']);
      loadTeam();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (window.confirm('Remove this manager from your workspace?')) {
      try {
        await removeTeamMember(id);
        setMembers(prev => prev.filter(m => m.id !== id && m.user_id !== id));
      } catch (err: any) {
        alert(err.message || 'Failed to remove member');
      }
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await revokeTeamInvite(inviteId);
      setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invite');
    }
  };

  const handleCopyLink = (token: string) => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(`${origin}/?invite=${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/85 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-charcoal-800 bg-charcoal-900/95 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-charcoal-850 border border-sand-400/20 text-sand-300 flex items-center justify-center shadow-xs">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-sand-100">Team & Manager Access</h3>
              <p className="text-[11px] text-sand-400/60">Delegate channel deals with customizable financial privacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sand-400/50 hover:text-sand-100 hover:bg-charcoal-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Invite Manager Section */}
        <div className="p-4 sm:p-5 rounded-xl border border-charcoal-800 bg-charcoal-950/70 mb-7">
          <h4 className="text-xs font-bold text-sand-100 flex items-center gap-1.5 mb-3">
            <UserPlus size={14} className="text-sand-400" />
            <span>Invite a Manager or Assistant</span>
          </h4>

          {inviteSuccess && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <Check size={14} />
              <span>{inviteSuccess}</span>
            </div>
          )}

          {error && (
            <div className="mb-3 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-sand-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="manager@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-charcoal-800 bg-charcoal-900 text-sand-100 placeholder:text-sand-400/30 text-xs focus:outline-hidden focus:border-sand-400/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sand-300 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-800 bg-charcoal-900 text-sand-100 text-xs focus:outline-hidden focus:border-sand-400/50"
                >
                  <option value="manager">Sponsorship Manager</option>
                  <option value="editor">Editor / Coordinator</option>
                </select>
              </div>
            </div>

            {/* Channels Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-sand-300 mb-1.5">
                Channel / Account Access
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleChannel('all')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    selectedChannels.includes('all')
                      ? 'bg-sand-400/10 border-sand-400/40 text-sand-200'
                      : 'bg-charcoal-900 border-charcoal-800 text-sand-400/70 hover:border-charcoal-700'
                  }`}
                >
                  <Layers size={12} />
                  <span>All Channels</span>
                </button>

                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleToggleChannel(acc.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      selectedChannels.includes(acc.id)
                        ? 'bg-sand-400/10 border-sand-400/40 text-sand-200'
                        : 'bg-charcoal-900 border-charcoal-800 text-sand-400/70 hover:border-charcoal-700'
                    }`}
                  >
                    <span>{acc.handle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Privacy Toggle */}
            <div className="p-3 rounded-xl border border-charcoal-800 bg-charcoal-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {canViewFinancials ? (
                  <Eye size={16} className="text-sand-400" />
                ) : (
                  <EyeOff size={16} className="text-amber-400" />
                )}
                <div>
                  <div className="text-xs font-semibold text-sand-100">
                    {canViewFinancials ? 'Full Financial Access' : 'Private (Hide Deal Amounts)'}
                  </div>
                  <div className="text-[11px] text-sand-400/60">
                    {canViewFinancials 
                      ? 'Manager can view and edit commercial payouts and invoices.'
                      : 'Deal amounts, invoices, and payouts will be completely hidden from this manager.'}
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={canViewFinancials}
                  onChange={(e) => setCanViewFinancials(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-charcoal-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sand-400"></div>
              </label>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={inviting}
                className="px-5 py-2.5 rounded-xl bg-sand-200 hover:bg-sand-100 text-charcoal-950 font-semibold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Mail size={13} />
                <span>{inviting ? 'Dispatching...' : 'Send Team Invitation'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. Active Members List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
            <h4 className="text-xs font-bold text-sand-200">Active Team Members ({members.length})</h4>
          </div>

          {loading && members.length === 0 ? (
            <div className="py-6 text-center text-xs text-sand-400/50">Loading team...</div>
          ) : members.length === 0 ? (
            <div className="py-6 text-center text-xs text-sand-400/50">
              No additional managers added yet. Invite your first manager above!
            </div>
          ) : (
            <div className="divide-y divide-charcoal-850">
              {members.map(member => (
                <div key={member.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-sand-100">{member.name || member.email}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-charcoal-800 text-sand-300 border border-charcoal-700 capitalize">
                        {member.role}
                      </span>
                      {member.can_view_financials ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                          Rates Visible
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60">
                          Rates Hidden
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-sand-400/60 mt-0.5">
                      {member.email} • {member.assigned_accounts?.includes('all') ? 'All Channels' : 'Specific Channels'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1.5 rounded-lg text-sand-400/40 hover:text-red-400 hover:bg-charcoal-850 transition-colors"
                    title="Remove Manager"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 3. Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="pt-4 border-t border-charcoal-800 space-y-3">
              <h4 className="text-xs font-bold text-sand-300 flex items-center gap-1.5">
                <Clock size={13} className="text-sand-400" />
                <span>Pending Email Invitations ({pendingInvites.length})</span>
              </h4>

              <div className="divide-y divide-charcoal-850">
                {pendingInvites.map(invite => (
                  <div key={invite.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium text-sand-200">{invite.email}</div>
                      <div className="text-[10px] text-sand-400/50 mt-0.5">
                        Sent {new Date(invite.createdAt).toLocaleDateString()} • {invite.canViewFinancials ? 'Full Financials' : 'Private'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(invite.token)}
                        className="px-2.5 py-1 rounded-lg border border-charcoal-800 hover:border-sand-400/30 text-sand-300 hover:text-sand-100 text-[11px] flex items-center gap-1 transition-colors"
                        title="Copy direct invite link"
                      >
                        {copiedToken === invite.token ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="p-1.5 rounded-lg text-sand-400/40 hover:text-red-400 hover:bg-charcoal-850 transition-colors"
                        title="Revoke Invitation"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
