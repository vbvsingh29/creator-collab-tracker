import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const LandingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Multi-Account management work for creators?',
      a: 'If you run multiple YouTube channels or Instagram accounts (e.g., Tech and Lifestyle), CollabFlow lets you connect them all under one workspace. You can switch accounts with 1 click or view your combined sponsorship pipeline.'
    },
    {
      q: 'Can my managers have access without seeing my financial rates?',
      a: 'Yes. When inviting a manager, you can toggle "Financial Privacy". Managers can manage deliverables, scripts, and schedules, but all deal rates, earnings, and invoices remain completely hidden and encrypted.'
    },
    {
      q: 'How does the Exclusivity Scanner work?',
      a: 'When you log a deal, you tag the brand industry (e.g. VPN, Energy Drinks, Smartphones) and any lock window. If an upcoming sponsor proposal overlaps within that window, Collabio warns you before you commit.'
    },
    {
      q: 'Can I generate tax-ready PDF invoices?',
      a: 'Yes. The built-in invoice tool automatically formats your studio details, tax ID (GSTIN/PAN/VAT), and bank wire or UPI details into clean printable PDF invoices.'
    }
  ];

  return (
    <section id="faq" className="py-20 sm:py-24 border-b border-charcoal-800/80 bg-charcoal-950/60 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold text-sand-400 uppercase tracking-widest font-mono">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-sand-50 mt-3 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-charcoal-800 bg-charcoal-900/80 backdrop-blur-xl overflow-hidden transition-all shadow-md hover:border-sand-400/20"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-sand-100 hover:text-sand-200 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-sand-400/60 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-sand-300' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-sand-300/70 leading-relaxed border-t border-charcoal-800 pt-3.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
