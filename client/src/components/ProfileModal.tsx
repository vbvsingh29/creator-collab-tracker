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
  Layers, 
  Camera,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, Platform } from '../types';
import { apiUpdateProfile } from '../services/api';

interface ProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: User) => void;
  onOpenAuth?: () => void;
}

const DEMO_CREATOR_PROFILE: User = {
  id: 'demo-creator-aarav',
  name: 'Aarav Sharma',
  email: 'aarav@tech.com',
  handle: '@aarav_tech',
  platform: 'both',
  category: 'Tech & Consumer Electronics',
  bio: 'Top tech reviewer and digital creator sharing in-depth gadget breakdowns, smartphone camera tests, and setup builds.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  phone: '+91 98200 12345',
  rates: {
    reel_rate: 35000,
    video_rate: 75000,
    story_rate: 12000,
    whitelisting_monthly_rate: 15000
  },
  social_links: {
    instagram: 'https://instagram.com/aarav_tech',
    youtube: 'https://youtube.com/@aarav_tech',
    twitter: 'https://x.com/aarav_tech',
    website: 'https://aaravtech.com'
  },
  created_at: new Date().toISOString()
};

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

  const activeUser = user || DEMO_CREATOR_PROFILE;

  // Profile Form State
  const [name, setName] = useState(activeUser.name || '');
  const [handle, setHandle] = useState(activeUser.handle || '');
  const [platform, setPlatform] = useState<Platform>(activeUser.platform || 'both');
  const [category, setCategory] = useState(activeUser.category || 'Tech & Consumer Electronics');
  const [bio, setBio] = useState(
    activeUser.bio || 'Tech reviewer and digital creator sharing in-depth reviews, gadgets, and consumer software integrations.'
  );
  const [phone, setPhone] = useState(activeUser.phone || '+91 98200 12345');
  const [avatarUrl, setAvatarUrl] = useState(
    activeUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeUser.name)}`
  );

  // Baseline Rates State
  const [reelRate, setReelRate] = useState<number>(activeUser.rates?.reel_rate || 35000);
  const [videoRate, setVideoRate] = useState<number>(activeUser.rates?.video_rate || 75000);
  const [storyRate, setStoryRate] = useState<number>(activeUser.rates?.story_rate || 12000);
  const [whitelistingRate, setWhitelistingRate] = useState<number>(activeUser.rates?.whitelisting_monthly_rate || 15000);

  // Social Links State
  const [igUrl, setIgUrl] = useState(activeUser.social_links?.instagram || `https://instagram.com/${activeUser.handle?.replace('@', '')}`);
  const [ytUrl, setYtUrl] = useState(activeUser.social_links?.youtube || `https://youtube.com/@${activeUser.handle?.replace('@', '')}`);
  const [twitterUrl, setTwitterUrl] = useState(activeUser.social_links?.twitter || `https://x.com/${activeUser.handle?.replace('@', '')}`);
  const [websiteUrl, setWebsiteUrl] = useState(activeUser.social_links?.website || 'https://collabflow.app');

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
    const u = user || DEMO_CREATOR_PROFILE;
    setName(u.name || '');
    setHandle(u.handle || '');
    setPlatform(u.platform || 'both');
    setCategory(u.category || 'Tech & Consumer Electronics');
    setBio(u.bio || '');
    setPhone(u.phone || '+91 98200 12345');
    setAvatarUrl(u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`);
    setReelRate(u.rates?.reel_rate || 35000);
    setVideoRate(u.rates?.video_rate || 75000);
    setStoryRate(u.rates?.story_rate || 12000);
    setWhitelistingRate(u.rates?.whitelisting_monthly_rate || 15000);
  }, [user, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    if (!user) {
      setSaving(false);
      setError('You are viewing in Demo Mode. Please log in or select a demo creator account to save permanent edits.');
      return;
    }

    try {
      const updatedData: Partial<User> = {
        name: name.trim(),
        handle: handle.trim(),
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
              <h3 className="font-bold text-sm">Creator Profile & Brand Kit</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Manage your creator identity, public bio, and baseline commercials</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Demo Notice Banner */}
        {!user && (
          <div className="px-6 py-2.5 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-amber-500/15 border-b border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-amber-500" />
              Viewing Demo Profile (Aarav Sharma). Sign in to personalize and save your permanent rates.
            </span>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-xs"
              >
                Sign In / Claim
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs max-h-[82vh] overflow-y-auto">
          {/* Avatar & Cover Section */}
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
              <div className="font-bold text-sm">{name} <span className="text-zinc-400 font-mono font-normal">{handle}</span></div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Choose from animated avatar styles or paste custom image URL:</p>
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
                  placeholder="e.g. Aarav Sharma"
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
                  placeholder="e.g. @aarav_tech"
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

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 text-[11px] mb-1 font-medium">Direct WhatsApp / Mobile Phone (for Agency Escalations)</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
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
                    value={reelRate}
                    onChange={(e) => setReelRate(Number(e.target.value))}
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
                    value={videoRate}
                    onChange={(e) => setVideoRate(Number(e.target.value))}
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
                    value={storyRate}
                    onChange={(e) => setStoryRate(Number(e.target.value))}
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
                    value={whitelistingRate}
                    onChange={(e) => setWhitelistingRate(Number(e.target.value))}
                    className="w-full bg-transparent text-zinc-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Social Profiles & Links */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Globe size={13} className="text-indigo-500" /> Verified Social Links
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Instagram size={14} className="absolute left-3 top-3 text-pink-500" />
                <input
                  type="text"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <Youtube size={14} className="absolute left-3 top-3 text-red-500" />
                <input
                  type="text"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <Twitter size={14} className="absolute left-3 top-3 text-sky-400" />
                <input
                  type="text"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/yourhandle"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <Globe size={14} className="absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Feedback & Actions */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check size={14} />
              <span>Profile, commercials, and brand kit updated successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
