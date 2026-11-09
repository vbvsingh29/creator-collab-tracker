import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  User as UserIcon, 
  DollarSign, 
  Globe, 
  Instagram, 
  Youtube, 
  Twitter, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Camera,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, Platform } from '../types';
import { 
  apiUpdateProfile, 
  apiSendEmailVerify, 
  apiVerifyEmailCode, 
  apiSendSmsOtp, 
  apiVerifyAccountPhone 
} from '../services/api';

interface ProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: User) => void;
  onOpenAuth?: () => void;
}

const CATEGORIES = [
  'Tech & Consumer Electronics',
  'Gaming & Esports',
  'Fashion & Apparel',
  'Beauty & Skincare',
  'Fitness & Wellness',
  'Finance & Fintech',
  'Food & Culinary',
  'Travel & Hospitality',
  'Education & Productivity',
  'Automobile & Mobility'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onProfileUpdated,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  if (!user) {
    return (
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Sign In to Edit Your Profile</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Create an account or sign in to customize your creator profile, verify your email and phone, and set your baseline rate card.
            </p>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900">
              Close
            </button>
            {onOpenAuth && (
              <button onClick={() => { onClose(); onOpenAuth(); }} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs">
                Log In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Profile Form State
  const [name, setName] = useState(user.name || '');
  const [handle, setHandle] = useState(user.handle || '');
  const [email, setEmail] = useState(user.email || '');
  const [platform, setPlatform] = useState<Platform>(user.platform || 'both');
  const [category, setCategory] = useState(user.category || 'Tech & Consumer Electronics');
  const [bio, setBio] = useState(user.bio || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'creator')}`
  );

  // Verification Flags
  const [emailVerified, setEmailVerified] = useState(Boolean(user.email_verified));
  const [phoneVerified, setPhoneVerified] = useState(Boolean(user.phone_verified));

  // Email Verification UI State
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Phone Verification UI State
  const [smsOtpSent, setSmsOtpSent] = useState(false);
  const [smsOtpCode, setSmsOtpCode] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsVerifying, setSmsVerifying] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Baseline Rates State
  const [reelRate, setReelRate] = useState<number>(user.rates?.reel_rate || 0);
  const [videoRate, setVideoRate] = useState<number>(user.rates?.video_rate || 0);
  const [storyRate, setStoryRate] = useState<number>(user.rates?.story_rate || 0);
  const [whitelistingRate, setWhitelistingRate] = useState<number>(user.rates?.whitelisting_monthly_rate || 0);

  // Social Links State
  const [igUrl, setIgUrl] = useState(user.social_links?.instagram || '');
  const [ytUrl, setYtUrl] = useState(user.social_links?.youtube || '');
  const [twitterUrl, setTwitterUrl] = useState(user.social_links?.twitter || '');
  const [websiteUrl, setWebsiteUrl] = useState(user.social_links?.website || '');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Preset avatar styles
  const avatarPresets = [
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name || 'User')}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(handle || 'Bot')}`,
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || 'Adventure')}`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name || 'Emoji')}`
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHandle(user.handle || '');
      setEmail(user.email || '');
      setPlatform(user.platform || 'both');
      setCategory(user.category || 'Tech & Consumer Electronics');
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setEmailVerified(Boolean(user.email_verified));
      setPhoneVerified(Boolean(user.phone_verified));
      setAvatarUrl(user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`);
      setReelRate(user.rates?.reel_rate || 0);
      setVideoRate(user.rates?.video_rate || 0);
      setStoryRate(user.rates?.story_rate || 0);
      setWhitelistingRate(user.rates?.whitelisting_monthly_rate || 0);
    }
  }, [user, isOpen]);

  // Trigger Email OTP Verification
  const handleSendEmailOtp = async () => {
    setEmailSending(true);
    setEmailFeedback(null);
    try {
      const res = await apiSendEmailVerify();
      setEmailOtpSent(true);
      setEmailFeedback({ type: 'success', msg: res.message || 'Verification code sent to your email.' });
    } catch (err: any) {
      setEmailFeedback({ type: 'error', msg: err.message || 'Failed to send email verification code.' });
    } finally {
      setEmailSending(false);
    }
  };

  // Confirm Email OTP Code
  const handleVerifyEmailCode = async () => {
    if (!emailOtpCode.trim() || emailOtpCode.trim().length !== 6) {
      setEmailFeedback({ type: 'error', msg: 'Please enter the 6-digit code received in your inbox.' });
      return;
    }
    setEmailVerifying(true);
    setEmailFeedback(null);
    try {
      const res = await apiVerifyEmailCode(emailOtpCode.trim());
      if (res.email_verified) {
        setEmailVerified(true);
        setEmailOtpSent(false);
        setEmailFeedback({ type: 'success', msg: '✓ Email address verified and permanently locked!' });
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        if (onProfileUpdated && user) {
          onProfileUpdated({ ...user, email_verified: true });
        }
      }
    } catch (err: any) {
      setEmailFeedback({ type: 'error', msg: err.message || 'Invalid or expired code. Please try again.' });
    } finally {
      setEmailVerifying(false);
    }
  };

  // Trigger SMS OTP Verification
  const handleSendSmsOtp = async () => {
    if (!phone || phone.trim().length < 8) {
      setSmsFeedback({ type: 'error', msg: 'Please enter a valid mobile number with country code (e.g. +91 9876543210).' });
      return;
    }
    setSmsSending(true);
    setSmsFeedback(null);
    try {
      const res = await apiSendSmsOtp(phone.trim());
      setSmsOtpSent(true);
      if (res.preview_code) {
        setSmsOtpCode(res.preview_code);
      }
      setSmsFeedback({ type: 'success', msg: res.message || '6-digit SMS OTP dispatched to your mobile.' });
    } catch (err: any) {
      setSmsFeedback({ type: 'error', msg: err.message || 'Failed to dispatch SMS verification.' });
    } finally {
      setSmsSending(false);
    }
  };

  // Confirm SMS OTP Code
  const handleVerifySmsCode = async () => {
    if (!smsOtpCode.trim() || smsOtpCode.trim().length !== 6) {
      setSmsFeedback({ type: 'error', msg: 'Please enter the 6-digit SMS OTP received.' });
      return;
    }
    setSmsVerifying(true);
    setSmsFeedback(null);
    try {
      const res = await apiVerifyAccountPhone(phone.trim(), smsOtpCode.trim());
      if (res.phone_verified) {
        setPhoneVerified(true);
        setSmsOtpSent(false);
        setSmsFeedback({ type: 'success', msg: '✓ Mobile number successfully verified!' });
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        if (onProfileUpdated && user) {
          onProfileUpdated({ ...user, phone: res.phone, phone_verified: true });
        }
      }
    } catch (err: any) {
      setSmsFeedback({ type: 'error', msg: err.message || 'Invalid or expired OTP code.' });
    } finally {
      setSmsVerifying(false);
    }
  };

  // Save General Profile Edits
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const updatedData: Partial<User> = {
        name: name.trim(),
        handle: handle.trim(),
        email: email.trim(),
        platform,
        category,
        bio: bio.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl,
        rates: {
          reel_rate: Number(reelRate) || 0,
          video_rate: Number(videoRate) || 0,
          story_rate: Number(storyRate) || 0,
          whitelisting_monthly_rate: Number(whitelistingRate) || 0
        },
        social_links: {
          instagram: igUrl.trim(),
          youtube: ytUrl.trim(),
          twitter: twitterUrl.trim(),
          website: websiteUrl.trim()
        }
      };

      const res = await apiUpdateProfile(updatedData);
      const updatedUser = res.user;
      setSuccess(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      if (onProfileUpdated) onProfileUpdated(updatedUser);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserIcon size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Creator Profile & Verification</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Manage verified contact channels, security locks, and baseline commercials</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs max-h-[82vh] overflow-y-auto">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
            <div className="relative group">
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-md bg-white dark:bg-zinc-800"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={18} />
              </div>
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="font-bold text-sm flex items-center justify-center sm:justify-start gap-2">
                <span>{name}</span>
                <span className="text-zinc-400 font-mono font-normal">{handle}</span>
                {emailVerified && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <ShieldCheck size={11} /> Verified Creator
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Choose from avatar styles or paste external HTTPS image URL:</p>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform hover:scale-110 ${
                      avatarUrl === preset ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <img src={preset} alt={`Style ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Or paste external avatar image URL (HTTPS)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* SECTION: VERIFIED CONTACT & SECURITY LOCKS */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Verified Security Channels & Account Locks</span>
            </h4>

            {/* Email Address + Lock */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <Mail size={12} className="text-zinc-400" />
                  <span>Primary Creator Email</span>
                </label>
                {emailVerified ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck size={11} /> Verified & Locked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/25 text-[10px] font-bold">
                    Unverified
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled={emailVerified}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
                    emailVerified
                      ? 'bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed pl-8'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100'
                  }`}
                />
                {emailVerified && (
                  <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
              </div>

              {emailVerified ? (
                <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                  <Lock size={10} className="text-emerald-500 inline" />
                  Verified email address is locked for account security and cannot be modified.
                </p>
              ) : (
                <div className="space-y-2 pt-1">
                  {!emailOtpSent ? (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailSending}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <RefreshCw size={12} className={emailSending ? 'animate-spin' : ''} />
                      <span>{emailSending ? 'Sending 6-Digit Code...' : 'Verify Email via OTP'}</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        Enter the 6-digit verification code sent to {email}:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={emailOtpCode}
                          onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-32 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-indigo-400 text-center font-mono font-bold tracking-widest text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmailCode}
                          disabled={emailVerifying}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          {emailVerifying ? 'Verifying...' : 'Confirm Code'}
                        </button>
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={emailSending}
                          className="text-xs text-zinc-500 hover:underline"
                        >
                          Resend
                        </button>
                      </div>
                    </div>
                  )}
                  {emailFeedback && (
                    <div className="flex items-center gap-2">
                      <p className={`text-[11px] font-medium ${emailFeedback.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {emailFeedback.msg}
                      </p>
                      {emailFeedback.msg.includes('log in again') && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            window.dispatchEvent(new Event('collabflow_session_expired'));
                          }}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 underline hover:no-underline"
                        >
                          Log in now &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Phone Verification */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <Phone size={12} className="text-zinc-400" />
                  <span>Mobile Phone Number (WhatsApp & SMS OTP Login)</span>
                </label>
                {phoneVerified ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-bold flex items-center gap-1">
                    <Smartphone size={11} /> Phone Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">
                    Unverified
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>

              {!phoneVerified ? (
                <div className="space-y-2 pt-1">
                  {!smsOtpSent ? (
                    <button
                      type="button"
                      onClick={handleSendSmsOtp}
                      disabled={smsSending}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Smartphone size={12} className={smsSending ? 'animate-spin' : ''} />
                      <span>{smsSending ? 'Dispatching SMS...' : 'Verify Mobile via SMS OTP'}</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-2">
                      <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                        Enter the 6-digit SMS code sent to {phone}:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={smsOtpCode}
                          onChange={(e) => setSmsOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-32 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-teal-400 text-center font-mono font-bold tracking-widest text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleVerifySmsCode}
                          disabled={smsVerifying}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          {smsVerifying ? 'Verifying...' : 'Confirm OTP'}
                        </button>
                        <button
                          type="button"
                          onClick={handleSendSmsOtp}
                          disabled={smsSending}
                          className="text-xs text-zinc-500 hover:underline"
                        >
                          Resend
                        </button>
                      </div>
                    </div>
                  )}
                  {smsFeedback && (
                    <div className="flex items-center gap-2">
                      <p className={`text-[11px] font-medium ${smsFeedback.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {smsFeedback.msg}
                      </p>
                      {smsFeedback.msg.includes('log in again') && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            window.dispatchEvent(new Event('collabflow_session_expired'));
                          }}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 underline hover:no-underline"
                        >
                          Log in now &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={11} /> Verified for 1-click mobile SMS OTP login.
                </p>
              )}
            </div>
          </div>

          {/* Section: Basic Identity */}
          <div className="space-y-3">
            <h4 className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <UserIcon size={13} className="text-indigo-500" /> Public Creator Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 text-[11px] mb-1 font-medium">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex River"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 text-[11px] mb-1 font-medium">Primary Handle</label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. @creator_handle"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 text-[11px] mb-1 font-medium">Niche / Content Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 text-[11px] mb-1 font-medium">Primary Channels</label>
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-300 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setPlatform('instagram')}
                    className={`py-1.5 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors ${
                      platform === 'instagram' ? 'bg-pink-600 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Instagram size={12} /> IG
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('youtube')}
                    className={`py-1.5 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors ${
                      platform === 'youtube' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Youtube size={12} /> YT
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('both')}
                    className={`py-1.5 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors ${
                      platform === 'both' ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 text-[11px] mb-1 font-medium">Public Bio / Pitch Introduction</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your content focus, verified reach, and audience demographics..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Section: Baseline Commercial Rates */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <DollarSign size={13} className="text-emerald-500" /> Standard Baseline Rates (Rate Card Auto-Fill)
              </h4>
              <span className="text-[10px] text-zinc-400">Used as default pricing in proposals & pitch generator</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-semibold">Instagram Reel</label>
                <div className="flex items-center gap-1 font-bold">
                  <span className="text-zinc-400">₹</span>
                  <input
                    type="number"
                    value={reelRate === 0 ? '' : reelRate}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setReelRate(val === '' ? 0 : Number(val));
                    }}
                    className="w-full bg-transparent text-zinc-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-semibold">YouTube Video</label>
                <div className="flex items-center gap-1 font-bold">
                  <span className="text-zinc-400">₹</span>
                  <input
                    type="number"
                    value={videoRate === 0 ? '' : videoRate}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setVideoRate(val === '' ? 0 : Number(val));
                    }}
                    className="w-full bg-transparent text-zinc-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-semibold">Story Sequence</label>
                <div className="flex items-center gap-1 font-bold">
                  <span className="text-zinc-400">₹</span>
                  <input
                    type="number"
                    value={storyRate === 0 ? '' : storyRate}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setStoryRate(val === '' ? 0 : Number(val));
                    }}
                    className="w-full bg-transparent text-zinc-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-semibold">Whitelisting/mo</label>
                <div className="flex items-center gap-1 font-bold">
                  <span className="text-zinc-400">₹</span>
                  <input
                    type="number"
                    value={whitelistingRate === 0 ? '' : whitelistingRate}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setWhitelistingRate(val === '' ? 0 : Number(val));
                    }}
                    className="w-full bg-transparent text-zinc-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Social & Portfolio Links */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Globe size={13} className="text-sky-500" /> Public Social Links & Media Kit
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Instagram size={14} className="absolute left-3 top-3 text-pink-500" />
                <input
                  type="text"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="relative">
                <Youtube size={14} className="absolute left-3 top-3 text-red-500" />
                <input
                  type="text"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="https://youtube.com/@channel"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="relative">
                <Twitter size={14} className="absolute left-3 top-3 text-sky-500" />
                <input
                  type="text"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/handle"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="relative">
                <Globe size={14} className="absolute left-3 top-3 text-indigo-500" />
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check size={14} className="shrink-0" />
              <span>Profile and baseline commercials updated successfully!</span>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-md hover:shadow-indigo-500/20 transition-all"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
