import React from 'react';
import { Youtube, Instagram, Star, Quote } from 'lucide-react';

export const LandingTestimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Aarav Sharma',
      handle: '@aaravtech',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Aarav%20Sharma&backgroundColor=b6e3f4,c0aede,d1d4f9',
      platform: 'youtube',
      followers: '420K Subscribers',
      highlight: 'Caught a $12,000 exclusivity collision',
      quote:
        'CollabFlow caught a 30-day competitive overlap between two audio brands before I signed the second contract. That single radar ping saved me a breach-of-contract clawback and a brand relationship.',
      metric: '+$18,500 monthly pipeline'
    },
    {
      name: 'Priya Mehta',
      handle: '@priyastyle',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Mehta&backgroundColor=ffd5dc,ffdfba,d1d4f9',
      platform: 'instagram',
      followers: '680K Followers',
      highlight: 'Recovered $8,400 in overdue brand checks',
      quote:
        'I used to dread checking bank statements to see which agency actually paid for delivered Reels. The automated invoice milestones and payment escalation alerts recovered $8,400 in my first two weeks.',
      metric: '99.4% on-time clearance'
    },
    {
      name: 'Marcus Vance',
      handle: '@vancegaming',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Marcus%20Vance&backgroundColor=d1d4f9,c0aede',
      platform: 'youtube',
      followers: 'Agency Manager (8 Talents)',
      highlight: 'Replaced 4 messy Google Sheets',
      quote:
        'Managing 8 gaming and tech creators across 4 spreadsheets was an absolute nightmare. With CollabFlow, our talent managers, video editors, and accountants have one single source of truth.',
      metric: '8 Creator Roster Managed'
    }
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Creator Social Proof
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-2 tracking-tight">
            Loved by independent creators & talent agencies.
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Real stories from creators who stopped managing six-figure sponsorships on messy spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex flex-col justify-between shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {t.highlight}
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 object-cover"
                  />
                  <div>
                    <div className="font-bold text-xs text-zinc-900 dark:text-white leading-tight">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                      {t.platform === 'youtube' ? (
                        <Youtube size={10} className="text-red-500" />
                      ) : (
                        <Instagram size={10} className="text-pink-500" />
                      )}
                      <span>{t.handle}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {t.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
