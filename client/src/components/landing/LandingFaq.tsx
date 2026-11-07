import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const LandingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can I test the full app without creating an account or entering a card?',
      a: 'Yes. Clicking "Try 1-Click Demo" instantly opens a pre-loaded creator workspace with real sample deals, rates, and invoices. No email, password, or credit card required.'
    },
    {
      q: 'Are my brand rates and earnings private?',
      a: 'Yes, 100%. Your financial numbers are isolated to your account. Deal values and wire amounts are never shared with anyone.'
    },
    {
      q: 'How does the Exclusivity Scanner work?',
      a: 'When you log a deal, you tag the brand industry (e.g. VPN, Energy Drinks, Smartphones) and any lock window. If an upcoming sponsor proposal overlaps within that window, CollabFlow warns you before you commit.'
    },
    {
      q: 'Can I generate tax-ready PDF invoices?',
      a: 'Yes. The built-in invoice tool automatically formats your studio details, tax ID (GSTIN/PAN/VAT), and bank wire or UPI details into clean printable PDF invoices.'
    }
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 border-b border-slate-200/80 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950/70 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 overflow-hidden transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 dark:text-zinc-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-slate-900 dark:text-white' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800 pt-3">
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
