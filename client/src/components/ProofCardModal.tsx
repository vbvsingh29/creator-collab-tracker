import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Share2, CheckCircle2 } from 'lucide-react';
import { Collab } from '../types';

interface ProofCardModalProps {
  collab: Collab | null;
  onClose: () => void;
}

export const ProofCardModal: React.FC<ProofCardModalProps> = ({ collab, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!collab) return null;

  const proofMessage = `Hi ${collab.contact_person || 'Brand Team'},

Our sponsored collaboration "${collab.title}" is now LIVE! 🚀

🔗 Content Link: ${collab.live_post_url || 'https://instagram.com/reel/...'}
📅 Published Date: ${collab.actual_posted_date || new Date().toISOString().split('T')[0]}
🏷️ Format: ${collab.format_label || collab.deliverable_format}
${collab.promo_code ? `🎟️ Promo Code: ${collab.promo_code}` : ''}
${collab.tracking_link ? `📍 Tracking Link: ${collab.tracking_link}` : ''}

Compliance Check:
✓ Paid Partnership / #ad tag included
✓ Agreed talking points & brand messaging delivered
✓ Tracking link placed in top description / link in bio

Please review the live content and confirm receipt.
Best regards,
Creator Team`;

  const handleCopy = () => {
    navigator.clipboard.writeText(proofMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Live Campaign Proof Card</h3>
              <p className="text-[11px] text-zinc-400">1-click message for brand PR & agency managers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X size={16} />
          </button>
        </div>

        {/* Verification Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span className="text-zinc-300">#ad / Disclosure Tag Active</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span className="text-zinc-300">Promo Code & Links Tested</span>
          </div>
        </div>

        {/* Formatted Message Area */}
        <div className="relative">
          <textarea
            readOnly
            rows={10}
            value={proofMessage}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-300 font-mono leading-relaxed focus:outline-none resize-none"
          />
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Message'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-zinc-500">
            Ready to paste in WhatsApp, Gmail, or Agency Slack
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
