import React, { useState } from 'react';
import { X, Copy, Check, AlertTriangle, Mail, Clock, ShieldAlert } from 'lucide-react';
import { Collab } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FollowUpModalProps {
  collab: Collab | null;
  onClose: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({ collab, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [tier, setTier] = useState<1 | 2 | 3>(2); // Default to Tier 2 (Firm)

  if (!collab) return null;

  const dueAmount = collab.deal_amount - (collab.amount_paid || 0);
  const formattedAmount = formatCurrency(dueAmount, collab.currency);

  const getTemplate = () => {
    if (tier === 1) {
      return `Subject: Friendly Reminder: Invoice ${collab.invoice_number || 'INV-DUE'} for ${collab.brand_name} Sponsorship

Hi ${collab.contact_person || 'Accounts Team'},

Hope you're having a great week!

Just sending a quick note regarding Invoice ${collab.invoice_number || 'INV-DUE'} for our collaboration "${collab.title}".

• Amount: ${formattedAmount}
• Due Date: ${collab.payment_due_date || 'Past Due'}
• Terms: ${collab.payment_terms.replace(/_/g, ' ')}

Please let me know if you need any additional bank details or invoice copies to process this.

Warm regards,
Creator Partnerships`;
    }

    if (tier === 2) {
      return `Subject: Overdue Notice: Payment of ${formattedAmount} for ${collab.brand_name} Collaboration (${collab.invoice_number || 'INV-DUE'})

Hi ${collab.contact_person || 'Finance Team'},

I am writing to follow up on the outstanding payment for our completed collaboration "${collab.title}", which went live on ${collab.actual_posted_date || 'scheduled date'}.

As per our agreed terms (${collab.payment_terms.replace(/_/g, ' ')}), payment was due on ${collab.payment_due_date || 'earlier this month'}.

• Invoice: ${collab.invoice_number || 'INV-DUE'}
• Outstanding Balance: ${formattedAmount}
• Content URL: ${collab.live_post_url || 'Active on channel'}

Could you please confirm the scheduled remittance date for this transfer?

Thank you for your prompt attention.

Best regards,
Creator Finance Team`;
    }

    return `Subject: URGENT: Final Notice of Overdue Payment & Notice of Usage Rights Suspension (${collab.brand_name})

Dear ${collab.contact_person || 'Management'},

Despite previous reminders, Invoice ${collab.invoice_number || 'INV-DUE'} for "${collab.title}" remains unpaid.

• Outstanding Amount: ${formattedAmount}
• Original Due Date: ${collab.payment_due_date || 'Overdue'}
• Days Past Net Terms: OVERDUE

Please be advised that all intellectual property usage rights, brand whitelisting, and ad distribution licenses are contingent upon timely payment in full. Continued delinquency may require the formal revocation of brand promotional permissions and removal of content assets.

Please arrange immediate transfer of ${formattedAmount} within 48 business hours and provide the payment UTR / transaction receipt.

Sincerely,
Creator Legal & Finance Department`;
  };

  const message = getTemplate();

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Payment Debt Recovery Generator</h3>
              <p className="text-[11px] text-zinc-400">Targeted follow-up notices based on overdue severity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <X size={16} />
          </button>
        </div>

        {/* Escalation Tier Selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTier(1)}
            className={`p-2 rounded-xl text-left border transition-all ${
              tier === 1
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="text-[11px] font-bold">Tier 1: Friendly</div>
            <div className="text-[10px] text-zinc-500">Grace / Due this week</div>
          </button>

          <button
            onClick={() => setTier(2)}
            className={`p-2 rounded-xl text-left border transition-all ${
              tier === 2
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-300 font-semibold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="text-[11px] font-bold">Tier 2: Firm Inquiry</div>
            <div className="text-[10px] text-zinc-500">7-14 Days Overdue</div>
          </button>

          <button
            onClick={() => setTier(3)}
            className={`p-2 rounded-xl text-left border transition-all ${
              tier === 3
                ? 'bg-red-500/10 border-red-500/40 text-red-300 font-semibold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="text-[11px] font-bold">Tier 3: Rights Suspension</div>
            <div className="text-[10px] text-zinc-500">30+ Days / Delinquent</div>
          </button>
        </div>

        {/* Message preview */}
        <div className="relative">
          <textarea
            readOnly
            rows={10}
            value={message}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-300 font-mono leading-relaxed focus:outline-none resize-none"
          />
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied Notice!' : 'Copy Notice'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          {collab.contact_email ? (
            <a
              href={`mailto:${collab.contact_email}?subject=${encodeURIComponent(`Invoice Follow-up: ${collab.brand_name}`)}&body=${encodeURIComponent(message)}`}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Mail size={12} /> Open in Email App
            </a>
          ) : (
            <span className="text-[11px] text-zinc-500">No contact email saved</span>
          )}

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
