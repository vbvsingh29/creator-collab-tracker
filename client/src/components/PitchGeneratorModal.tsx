import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, Send, MessageSquareQuote, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Collab, Currency } from '../types';

interface PitchGeneratorModalProps {
  collab?: Collab | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
}

type PitchStrategy = 
  | 'counter_offer' 
  | 'upsell_bundle' 
  | 'inquiry_reply' 
  | 'payment_nudge' 
  | 'overdue_notice';

export const PitchGeneratorModal: React.FC<PitchGeneratorModalProps> = ({
  collab,
  isOpen,
  onClose,
  currency
}) => {
  if (!isOpen) return null;

  const [strategy, setStrategy] = useState<PitchStrategy>('counter_offer');
  const [tone, setTone] = useState<'confident' | 'warm' | 'firm'>('confident');
  const [copied, setCopied] = useState(false);

  const brandName = collab?.brand_name || 'Brand Partner';
  const contactName = collab?.contact_person || 'Brand Team';
  const dealAmount = collab?.deal_amount || 35000;
  const sym = collab?.currency === 'USD' || currency === 'USD' ? '$' : '₹';
  const format = collab?.format_label || collab?.deliverable_format || 'Instagram Reel';

  const generatePitchText = (): string => {
    switch (strategy) {
      case 'counter_offer':
        return `Hi ${contactName},

Thank you for reaching out! We love what ${brandName} is doing and believe our audience would be a natural fit for this campaign.

Regarding your initial budget proposal: given our average engagement rate (currently 4.8%) and the high buyer-intent in this category, our standard rate for a dedicated ${format} is ${sym}${(dealAmount * 1.3).toLocaleString()}.

This includes:
• Complete scriptwriting & concept alignment
• High-fidelity 4K production & professional editing
• 30-day organic link in bio / sticker link
• Post-campaign performance analytics report

If budget flexibility is tight, we could lock this in at ${sym}${dealAmount.toLocaleString()} if we bundle a supporting Story set or grant 15-day digital usage rights.

Let me know if this works for your timeline and I'll send over the brief agreement!

Best regards,
Aarav Sharma | @aaravtech`;

      case 'upsell_bundle':
        return `Hi ${contactName},

Excited to collaborate on the upcoming ${brandName} campaign!

To maximize reach and get the best ROI from this integration, we strongly recommend our Multi-Touch Creator Bundle instead of a standalone ${format}:

Recommended Package:
1. One Dedicated 60s ${format} (Hook + core product USP demonstration)
2. Two Instagram Stories with direct swipe-up / tracking link (Day 1 + Day 3 reminder)
3. 30-day Paid Ads Whitelisting rights for Meta / YouTube ads

Standalone Value: ${sym}${(dealAmount * 1.5).toLocaleString()}
Bundled Campaign Rate: ${sym}${(dealAmount * 1.2).toLocaleString()}

Brands in your category have seen a 2.4x higher conversion rate when combining feed video with timely story reminders.

Would you like us to draft the contract with this bundle?

Warm regards,
CollabFlow Creator Team`;

      case 'inquiry_reply':
        return `Hi ${contactName},

Thanks for reaching out! We are currently planning our content calendar for this month and have 2 partnership slots open.

Our audience demographic:
• 68% between 18–34 years old
• Top regions: Mumbai, Delhi, Bengaluru, Pune
• High affinity for tech, lifestyle, and consumer productivity tools

Attached is our updated Media Kit & Rate Card. For a dedicated ${format}, our baseline commercial starts at ${sym}${dealAmount.toLocaleString()}.

Please share your target live dates and core campaign goals so we can send a tailored creative brief proposal.

Looking forward to creating something impactful together!

Best,
Creator Partnerships`;

      case 'payment_nudge':
        return `Hi ${contactName},

Hope you are having a productive week!

Following up on our completed campaign for "${collab?.title || 'Brand Deal'}". The live deliverable has already generated strong audience feedback and positive engagement.

Just a quick reminder that Invoice ${collab?.invoice_number || 'INV-2026-401'} for ${sym}${dealAmount.toLocaleString()} is scheduled for settlement under our ${collab?.payment_terms || 'Net 30'} terms on ${collab?.payment_due_date || 'this Friday'}.

Please let us know if your finance team needs any additional vendor forms or tax details to ensure timely processing.

Thanks again for the great collaboration!

Warm regards,
Finance & Creator Accounts`;

      case 'overdue_notice':
        return `Dear ${contactName} & Accounts Team,

This is a formal follow-up regarding overdue Invoice ${collab?.invoice_number || 'INV-2026-401'} for ${sym}${dealAmount.toLocaleString()} relating to the ${brandName} campaign deliverables completed on ${collab?.actual_posted_date || 'schedule'}.

As per our signed commercial agreement, payment was due on ${collab?.payment_due_date || 'the agreed due date'} and is now past due.

To maintain our positive working relationship and avoid escalation or pausing promotional usage rights, please confirm when remittance will be initiated.

Bank Remittance Details:
• A/C: 50200012345678 (HDFC Bank) | IFSC: HDFC0000123
• UPI: aarav@okaxis

Thank you for your prompt attention to this matter.

Regards,
Creator Operations`;

      default:
        return '';
    }
  };

  const pitchText = generatePitchText();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pitchText);
    setCopied(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                AI Pitch & Negotiation Generator
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">PRO</span>
              </h3>
              <p className="text-[11px] text-zinc-400">Battle-tested response templates to close deals at 25–40% higher rates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X size={16} />
          </button>
        </div>

        {/* Strategy Selector Pills */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Select Negotiation Strategy:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { id: 'counter_offer', label: 'Counter-Offer (+30%)' },
              { id: 'upsell_bundle', label: 'Upsell Multi-Touch Bundle' },
              { id: 'inquiry_reply', label: 'First Inquiry Reply' },
              { id: 'payment_nudge', label: 'Gentle Payment Nudge' },
              { id: 'overdue_notice', label: 'Overdue Payment Notice' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id as PitchStrategy)}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                  strategy === s.id
                    ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium flex items-center gap-1">
              <MessageSquareQuote size={13} className="text-indigo-400" /> Generated Email Script
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-all"
            >
              {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-zinc-200 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto selection:bg-indigo-500 selection:text-white">
            {pitchText}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
          <span>Targeting: <strong className="text-zinc-300">{brandName}</strong> ({format})</span>
          <span>Baseline: <strong className="text-zinc-300">{sym}{dealAmount.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  );
};
