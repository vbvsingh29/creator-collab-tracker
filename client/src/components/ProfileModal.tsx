import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  AtSign, 
  Mail, 
  Phone, 
  Instagram, 
  Youtube, 
  Globe, 
  DollarSign, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Save, 
  Camera, 
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, Platform } from '../types';
import { apiUpdateProfile } from '../services/api';

interface ProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updatedUser: User) => void;
}

const CATEGORIES = [
  'Tech & Consumer Electronics',
  'Beauty, Skincare & Grooming',
  'Fashion & Apparel',
  'Fitness, Health & Nutrition',
  'Gaming & Esports',
  'Business, Finance & Crypto',
  'Travel, Hospitality & Lifestyle',
  'Food, Cooking & Beverage',
  'Education & Career Development',
  'Automobile & Mobility'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  if (!isOpen || !user) return null;

  // Profile Form State
  const [name, setName] = useState(user.name || '');
  const [handle, setHandle] = useState(user.handle || '');
  const [platform, setPlatform] = useState<Platform>(user.platform || 'both');
  const [category, setCategory] = useState(user.category || 'Tech & Consumer Electronics');
  const [bio, setBio] = useState(
    user.bio || 'Tech reviewer and digital creator sharing in-depth reviews, gadgets, and consumer software integrations.'
  );
  const [phone, setPhone] = useState(user.phone || '+91 98200 12345');
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
  );

  // Baseline Rates State
  const [reelRate, setReelRate] = useState<number>(user.rates?.reel_rate || 35000);
  const [videoRate, setVideoRate] = useState<number>(user.rates?.video_rate || 75000);
  const [storyRate, setStoryRate] = useState<number>(user.rates?.story_rate || 12000);
  const [whitelistingRate, setWhitelistingRate] = useState<number>(user.rates?.whitelisting_monthly_rate || 15000);

  // Social Links State
  const [igUrl, setIgUrl] = useState(user.social_links?.instagram || `https://instagram.com/${user.handle?.replace('@', '')}`);
  const [ytUrl, setYtUrl] = useState(user.social_links?.youtube || `https://youtube.com/@${user.handle?.replace('@', '')}`);
  const [twitterUrl, setTwitterUrl] = useState(user.social_links?.twitter || `https://x.com/${user.handle?.replace('@', '')}`);
  const [websiteUrl, setWebsiteUrl] = useState(user.social_links?.website || 'https://collabflow.app');

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

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
      onProfileUpdated(res.user);
      setSuccess(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
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
                      avatarUrl === preset ? 'border-indigo-600 scale-105' : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 flex items-center gap-2">
              <Check size={14} />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Creator / Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Primary Handle
              </label>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Primary Platform Focus
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="both">Both YouTube & Instagram</option>
                <option value="youtube">YouTube Primary</option>
                <option value="instagram">Instagram Primary</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Content Niche / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Creator Bio / Brand Pitch
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight audience demographics, top regions, and creative style..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Brand Contact & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Official Creator Email
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl px-3 py-2 text-zinc-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Brand Partnerships Phone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Baseline Commercial Rate Card */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <DollarSign size={13} className="text-emerald-500" /> Baseline Rate Card Defaults (Auto-Prefills Deals)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">Standard Reel</label>
                <input
                  type="number"
                  value={reelRate}
                  onChange={(e) => setReelRate(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">Dedicated Video</label>
                <input
                  type="number"
                  value={videoRate}
                  onChange={(e) => setVideoRate(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">Instagram Story</label>
                <input
                  type="number"
                  value={storyRate}
                  onChange={(e) => setStoryRate(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">Whitelisting (30d)</label>
                <input
                  type="number"
                  value={whitelistingRate}
                  onChange={(e) => setWhitelistingRate(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Public Channels & Social Links
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Instagram size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
                <input
                  type="text"
                  placeholder="Instagram URL"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 font-mono text-[11px]"
                />
              </div>

              <div className="relative">
                <Youtube size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                <input
                  type="text"
                  placeholder="YouTube Channel URL"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
