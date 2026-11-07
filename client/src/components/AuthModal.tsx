import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Activity,
  Phone,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { Platform } from '../types';
import { apiForgotPassword, apiResetPassword, apiSendSmsOtp, apiVerifySmsOtp } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, canClose = true }) => {
  const { login, register, demoLogin, setSession } = useAuth() as any;
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset' | 'phone_otp'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState<Platform>('youtube');
  
  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsOtpCode, setSmsOtpCode] = useState('');
  const [smsOtpSent, setSmsOtpSent] = useState(false);
  const [smsPreviewCode, setSmsPreviewCode] = useState<string | null>(null);

  // Forgot / Reset Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canClose, onClose]);

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
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        if (onClose) onClose();
      } else if (mode === 'forgot') {
        const res = await apiForgotPassword(resetEmail.trim());
        setSuccessMsg(res.message);
        if (res.preview_code) {
          setPreviewCode(res.preview_code);
        }
        setMode('reset');
      } else if (mode === 'reset') {
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const res = await apiResetPassword(resetEmail.trim(), resetCode.trim(), newPassword);
        setSuccessMsg(res.message);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => {
          if (onClose) onClose();
        }, 1200);
      } else if (mode === 'phone_otp') {
        if (!smsOtpSent) {
          // Send SMS OTP
          const res = await apiSendSmsOtp(phoneNumber.trim());
          setSmsOtpSent(true);
          setSuccessMsg(res.message);
          if (res.preview_code) {
            setSmsPreviewCode(res.preview_code);
          }
        } else {
          // Verify SMS OTP
          const res = await apiVerifySmsOtp(phoneNumber.trim(), smsOtpCode.trim(), name.trim());
          if (setSession) {
            setSession(res.token, res.user);
          }
          setSuccessMsg('Phone verified successfully! Entering workspace...');
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          setTimeout(() => {
            if (onClose) onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-zinc-900 border border-slate-800 flex items-center justify-center text-white">
              <span className="font-extrabold text-xs tracking-tight">CF</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {mode === 'forgot' ? 'Reset Password' : mode === 'reset' ? 'Enter Reset Code' : mode === 'phone_otp' ? 'Mobile SMS Login' : 'Creator Workspace Access'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {mode === 'phone_otp' ? 'Instant OTP login via SMS verification' : 'Isolated creator workspace with zero data leakage'}
              </p>
            </div>
          </div>
          {canClose && onClose && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
              <X size={16} />
            </button>
          )}
        </div>

        {/* 1-Click Instant Demo Creators (Only shown in main modes) */}
        {(mode === 'login' || mode === 'signup' || mode === 'phone_otp') && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
              <span>Instant Test Accounts</span>
              <span className="text-[10px] text-slate-600 dark:text-zinc-400 font-normal">1-Click Login</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Creator 1: YouTube */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo('aarav@tech.com')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-850 hover:border-slate-300 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="https://api.dicebear.com/7.x/initials/svg?seed=Aarav%20Sharma&backgroundColor=b6e3f4,c0aede,d1d4f9"
                    alt="Aarav"
                    className="w-5 h-5 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors leading-tight">
                      Aarav Sharma
                    </div>
                    <div className="text-[10px] text-slate-500">@aaravtech</div>
                  </div>
                </div>
                <div className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                  <Youtube size={11} /> Tech Creator
                </div>
              </button>

              {/* Creator 2: Instagram */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo('priya@lifestyle.com')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-850 hover:border-slate-300 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Mehta&backgroundColor=ffd5dc,ffdfba,d1d4f9"
                    alt="Priya"
                    className="w-5 h-5 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-zinc-100 group-hover:text-pink-600 transition-colors leading-tight">
                      Priya Mehta
                    </div>
                    <div className="text-[10px] text-slate-500">@priyastyle</div>
                  </div>
                </div>
                <div className="text-[10px] text-pink-600 font-medium flex items-center gap-1">
                  <Instagram size={11} /> Lifestyle Creator
                </div>
              </button>
            </div>
          </div>
        )}

        {(mode === 'login' || mode === 'signup' || mode === 'phone_otp') && (
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-950 px-2 text-[10px] uppercase tracking-wider text-slate-400 absolute font-semibold">
              Or Choose Method
            </span>
          </div>
        )}

        {/* Tab Switcher: Email Login vs Phone SMS OTP vs Create Account */}
        {(mode === 'login' || mode === 'signup' || mode === 'phone_otp') && (
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'login' 
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('phone_otp');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                mode === 'phone_otp' 
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
              }`}
            >
              <Smartphone size={12} />
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'signup' 
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sandbox OTP Code Fill Pill for Phone SMS */}
        {mode === 'phone_otp' && smsPreviewCode && smsOtpSent && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/40 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Smartphone size={13} className="text-amber-600" /> Twilio Sandbox Code
              </span>
              <span className="font-mono font-bold text-sm tracking-wider text-amber-900 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-300">
                {smsPreviewCode}
              </span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Live Twilio API sends this to real phone. For zero-cost dev preview, click below:
            </p>
            <button
              type="button"
              onClick={() => setSmsOtpCode(smsPreviewCode)}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
            >
              Auto-fill code {smsPreviewCode} &rarr;
            </button>
          </div>
        )}

        {/* Password Reset Preview Code Banner */}
        {previewCode && mode === 'reset' && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 flex items-center gap-1.5">
                <KeyRound size={13} className="text-amber-600" /> Reset Code
              </span>
              <span className="font-mono font-bold text-sm tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {previewCode}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setResetCode(previewCode)}
              className="text-[11px] font-semibold text-amber-800 hover:underline"
            >
              Auto-fill code into field &rarr;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* PHONE OTP MODE */}
          {mode === 'phone_otp' && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210 or 9876543210"
                    value={phoneNumber}
                    disabled={smsOtpSent}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              {smsOtpSent && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                      6-Digit SMS Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setSmsOtpSent(false)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                    >
                      Change phone
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={smsOtpCode}
                      onChange={(e) => setSmsOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 font-mono text-sm tracking-widest text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* SIGN UP MODE EXTRA FIELDS */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                  Creator Name
                </label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanmay Bhat, Marques Brownlee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Handle
                  </label>
                  <div className="relative">
                    <AtSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="handle"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-slate-800"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* EMAIL & PASSWORD (FOR LOGIN OR SIGNUP) */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="creator@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
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
                      className="text-[11px] text-slate-600 hover:text-slate-900 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-3">
              <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                Enter your registered creator email to receive a secure 6-digit verification code.
              </p>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="aarav@tech.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* RESET PASSWORD */}
          {mode === 'reset' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 font-mono text-sm tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>
              {submitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In to Dashboard'
                : mode === 'signup'
                ? 'Create My Account'
                : mode === 'forgot'
                ? 'Generate 6-Digit Code'
                : mode === 'phone_otp'
                ? (smsOtpSent ? 'Verify Code & Log In' : 'Send 6-Digit SMS Code')
                : 'Reset Password & Log In'}
            </span>
            <ArrowRight size={13} />
          </button>

          {/* Back button for secondary modes */}
          {(mode === 'forgot' || mode === 'reset') && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
                setPreviewCode(null);
              }}
              className="w-full py-2 text-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1"
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
