import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const LandingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can I test all features without creating an account or entering a credit card?',
      a: 'Yes, absolutely. Clicking "1-Click Live Demo" instantly launches a fully interactive creator sandbox (e.g. Aarav Tech or Priya Lifestyle) with real sample deals, rate cards, invoices, and AI pitches. No email, password, or card required.'
    },
    {
      q: 'How does CollabFlow ensure my sponsorship rates and earnings stay strictly private?',
      a: 'Your financial information is locked to your account under GDPR Article 25 (Privacy-by-Design). Even the platform observatory/telemetry portal locks all deal prices, rates, and invoice totals behind an encrypted mask (🔒 [Hidden / GDPR Protected]). Nobody else ever sees what you charge.'
    },
    {
      q: 'How does the Exclusivity Collision Radar work in practice?',
      a: 'When you log a deal, you tag the brand industry (e.g. VPN, Energy Drinks, Smartphones, Gaming Peripherals) and the lock window (e.g. 30 days post-launch). If an upcoming sponsor proposal overlaps within that window, CollabFlow flags an alert and tells you the exact date you can safely air the competing integration.'
    },
    {
      q: 'Does CollabFlow work on my mobile phone when I am traveling or on set?',
      a: 'Yes. CollabFlow is built as a responsive Progressive Web App (PWA). You can tap "Add to Home Screen" on iOS Safari or Android Chrome to launch it like a native app with offline deal access and fast payment status toggles.'
    },
    {
      q: 'Can I generate PDF invoices with my legal tax ID (GSTIN / PAN / VAT)?',
      a: 'Yes. The built-in invoice engine automatically populates your legal studio name, tax identification numbers, bank SWIFT/IBAN wire codes, or PayPal/UPI IDs, calculates itemized totals, and outputs clean, printable PDF invoices formatted for corporate accounting departments.'
    }
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-2 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Everything you need to know about setting up your creator sponsorship OS.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-200/50 dark:border-zinc-800/50 pt-3 animate-in fade-in duration-150">
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
