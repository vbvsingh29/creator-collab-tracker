import React, { useState } from 'react';
import { 
  X, 
  Instagram, 
  Youtube, 
  Lock, 
  Mail, 
  User, 
  AtSign, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { Platform } from '../types';
import { apiForgotPassword, apiResetPassword } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, canClose = true }) => {
  const { login, register, demoLogin, setSession } = useAuth() as any;
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState<Platform>('youtube');
  
  // Forgot / Reset Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        if (onClose) onClose();
      } else if (mode === 'signup') {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          handle: handle.trim(),
          platform
        });
        if (onClose) onClose();
      } else if (mode === 'forgot') {
        // Step 1: Request 6-digit reset code
        const res = await apiForgotPassword(resetEmail.trim());
        setSuccessMsg(res.message);
        if (res.preview_code) {
          setPreviewCode(res.preview_code);
        }
        setMode('reset');
      } else if (mode === 'reset') {
        // Step 2: Submit new password
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match. Please verify.');
        }
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const res = await apiResetPassword(resetEmail.trim(), resetCode.trim(), newPassword);
        if (setSession) {
          setSession(res.token, res.user);
        }
        setSuccessMsg(res.message || 'Password reset successfully! Logged in.');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        setTimeout(() => {
          if (onClose) onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      await demoLogin(demoEmail);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center">
              <span className="font-extrabold text-sm tracking-tighter bg-gradient-to-br from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                CF
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {mode === 'forgot' ? 'Reset Password' : mode === 'reset' ? 'Enter Reset Code' : 'Creator Workspace Access'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                {mode === 'forgot' || mode === 'reset' 
                  ? 'NIST scrypt encrypted credential recovery' 
                  : 'Isolated creator authentication & zero data leakage'}
              </p>
            </div>
          </div>
          {canClose && onClose && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
              <X size={16} />
            </button>
          )}
        </div>

        {/* 1-Click Instant Demo Creators (Only shown in login/signup modes) */}
        {(mode === 'login' || mode === 'signup') && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              <span>Instant Demo Accounts</span>
              <span className="text-[10px] text-indigo-400 font-normal">1-Click Login</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo('aarav@tech.com')}
                className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-850 hover:border-zinc-700 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="https://api.dicebear.com/7.x/initials/svg?seed=Aarav%20Sharma&backgroundColor=b6e3f4,c0aede,d1d4f9"
                    alt="Aarav"
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-xs text-zinc-100 group-hover:text-red-400 transition-colors">
                      Aarav Tech
                    </div>
                    <div className="text-[10px] text-zinc-500">@aaravtech</div>
                  </div>
                </div>
                <div className="text-[10px] text-red-400 font-medium flex items-center gap-1 mt-1">
                  <Youtube size={10} /> 4 YouTube Deals
                </div>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo('priya@lifestyle.com')}
                className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-850 hover:border-zinc-700 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Mehta&backgroundColor=ffd5dc,ffdfba,d1d4f9"
                    alt="Priya"
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-xs text-zinc-100 group-hover:text-pink-400 transition-colors">
                      Priya Lifestyle
                    </div>
                    <div className="text-[10px] text-zinc-500">@priyastyle</div>
                  </div>
                </div>
                <div className="text-[10px] text-pink-400 font-medium flex items-center gap-1 mt-1">
                  <Instagram size={10} /> 3 IG Deals (1 Due)
                </div>
              </button>
            </div>
          </div>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-zinc-950 px-2 text-[10px] uppercase tracking-wider text-zinc-500 absolute">
              Or Use Email
            </span>
          </div>
        )}

        {/* Tab Switcher for Login / Signup */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-1.5 rounded-md transition-colors ${
                mode === 'login' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-1.5 rounded-md transition-colors ${
                mode === 'signup' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Free Tier Preview Code Banner */}
        {previewCode && mode === 'reset' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <KeyRound size={13} className="text-amber-400" /> Free Tier Preview Code
              </span>
              <span className="font-mono font-bold text-sm tracking-wider text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                {previewCode}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              In production with SMTP/Resend configured, this code is emailed directly. In free tier preview, click below to autofill:
            </p>
            <button
              type="button"
              onClick={() => setResetCode(previewCode)}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              Auto-fill code into field &rarr;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Sign Up Fields */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Creator Name
                </label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanmay Bhat, Marques Brownlee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Handle
                  </label>
                  <div className="relative">
                    <AtSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="handle"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Login or Signup Email & Password */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="creator@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email || '');
                        setMode('forgot');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Mode: Forgot Password (Step 1) */}
          {mode === 'forgot' && (
            <div className="space-y-3">
              <p className="text-zinc-400 text-xs leading-relaxed">
                Enter your registered creator email. We will generate a secure 6-digit verification code to reset your password.
              </p>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. aarav@tech.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode: Reset Password (Step 2) */}
          {mode === 'reset' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 font-mono text-sm tracking-widest text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>
              {submitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In to Dashboard'
                : mode === 'signup'
                ? 'Create My Account'
                : mode === 'forgot'
                ? 'Generate 6-Digit Reset Code'
                : 'Reset Password & Log In'}
            </span>
            <ArrowRight size={13} />
          </button>

          {/* Back button for Forgot / Reset modes */}
          {(mode === 'forgot' || mode === 'reset') && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
                setPreviewCode(null);
              }}
              className="w-full py-2 text-center text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={12} />
              <span>Back to Sign In</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
