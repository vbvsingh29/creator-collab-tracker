import React, { useState, useEffect } from 'react';
import { X, Printer, Download, CheckCircle2, Building2, User, CreditCard, Sparkles } from 'lucide-react';
import { Collab, Currency } from '../types';

interface InvoiceModalProps {
  collab: Collab | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onMarkInvoiced?: (id: string, invoiceNumber: string, invoiceDate: string, dueDate: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  collab,
  isOpen,
  onClose,
  currency,
  onMarkInvoiced
}) => {
  if (!isOpen || !collab) return null;

  const sym = collab.currency === 'USD' || currency === 'USD' ? '$' : '₹';
  const today = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Editable Invoice Metadata
  const [invoiceNumber, setInvoiceNumber] = useState(
    collab.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [invoiceDate, setInvoiceDate] = useState(collab.invoice_date || today);
  const [dueDate, setDueDate] = useState(collab.payment_due_date || defaultDueDate);

  // Creator Billing Profile
  const [creatorLegalName, setCreatorLegalName] = useState(() => localStorage.getItem('collabflow_biz_name') || 'Creator Studio');
  const [creatorAddress, setCreatorAddress] = useState(() => localStorage.getItem('collabflow_biz_address') || '');
  const [creatorTaxId, setCreatorTaxId] = useState(() => localStorage.getItem('collabflow_biz_tax') || '');
  const [bankDetails, setBankDetails] = useState(
    localStorage.getItem('collabflow_biz_bank') || ''
  );

  // Tax handling
  const [includeTax, setIncludeTax] = useState(false);
  const [taxPercent, setTaxPercent] = useState(18);

  const subtotal = collab.deal_amount;
  const taxAmount = includeTax ? (subtotal * taxPercent) / 100 : 0;
  const totalPayable = subtotal + taxAmount;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndMarkInvoiced = () => {
    if (onMarkInvoiced) {
      onMarkInvoiced(collab.id, invoiceNumber, invoiceDate, dueDate);
    }
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div 
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-4 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Printer size={14} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Professional Brand Invoice</h3>
              <p className="text-[11px] text-zinc-400">Generate clean PDF invoice ready for brand finance approval</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleSaveAndMarkInvoiced}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <CheckCircle2 size={13} />
              <span>Mark as Invoiced</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 sm:p-12 space-y-8 bg-zinc-950 text-zinc-100 print:bg-white print:text-black print:p-8 font-sans">
          {/* Header & Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-800 print:border-neutral-300 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm print:bg-black">
                  CF
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white print:text-black">
                  INVOICE
                </h1>
              </div>
              <input
                type="text"
                value={creatorLegalName}
                onChange={(e) => setCreatorLegalName(e.target.value)}
                className="font-semibold text-sm bg-transparent border-none text-zinc-200 print:text-black focus:outline-none w-full"
              />
              <input
                type="text"
                value={creatorAddress}
                onChange={(e) => setCreatorAddress(e.target.value)}
                className="text-xs text-zinc-400 print:text-neutral-600 bg-transparent border-none focus:outline-none w-full"
              />
              <input
                type="text"
                value={creatorTaxId}
                onChange={(e) => setCreatorTaxId(e.target.value)}
                className="text-xs font-mono text-zinc-500 print:text-neutral-500 bg-transparent border-none focus:outline-none w-full"
              />
            </div>

            <div className="text-left sm:text-right space-y-1.5">
              <div className="flex items-center sm:justify-end gap-2 text-xs">
                <span className="text-zinc-500 print:text-neutral-500">Invoice Number:</span>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="font-mono font-bold text-zinc-200 print:text-black bg-zinc-900 print:bg-transparent px-2 py-0.5 rounded border border-zinc-800 print:border-none text-xs w-36 text-right"
                />
              </div>
              <div className="flex items-center sm:justify-end gap-2 text-xs">
                <span className="text-zinc-500 print:text-neutral-500">Invoice Date:</span>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="text-zinc-200 print:text-black bg-transparent border-none text-xs text-right"
                />
              </div>
              <div className="flex items-center sm:justify-end gap-2 text-xs">
                <span className="text-zinc-500 print:text-neutral-500 font-semibold text-red-400 print:text-red-700">Due Date:</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="font-semibold text-zinc-100 print:text-black bg-transparent border-none text-xs text-right"
                />
              </div>
            </div>
          </div>

          {/* Billed To / Client Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 print:border-neutral-300 print:bg-neutral-50">
              <div className="text-[10px] uppercase font-bold text-zinc-500 print:text-neutral-500 mb-1">
                Billed To (Client / Agency):
              </div>
              <div className="font-bold text-sm text-white print:text-black mb-0.5">
                {collab.brand_name}
              </div>
              <div className="text-zinc-400 print:text-neutral-700">
                Attn: {collab.contact_person || 'Influencer Marketing Team'}
              </div>
              <div className="text-zinc-500 print:text-neutral-500 font-mono">
                {collab.contact_email || 'partnerships@brand.com'}
              </div>
              <div className="mt-2 text-[11px] text-zinc-400 print:text-neutral-600">
                Industry: <span className="font-semibold">{collab.brand_category}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 print:border-neutral-300 print:bg-neutral-50">
              <div className="text-[10px] uppercase font-bold text-zinc-500 print:text-neutral-500 mb-1">
                Campaign Deliverables & Scope:
              </div>
              <div className="font-bold text-xs text-zinc-200 print:text-black mb-1">
                {collab.title}
              </div>
              <div className="text-zinc-400 print:text-neutral-700 space-y-0.5">
                <div>Format: <span className="font-semibold uppercase text-zinc-200 print:text-black">{collab.format_label || collab.deliverable_format}</span></div>
                <div>Platform: <span className="font-semibold capitalize text-zinc-200 print:text-black">{collab.platform}</span></div>
                {collab.has_ads_whitelisting && (
                  <div className="text-indigo-400 print:text-indigo-800 font-medium">
                    ✓ Paid Ads Whitelisting Included ({collab.whitelisting_duration_days} Days)
                  </div>
                )}
                {collab.has_category_exclusivity && (
                  <div className="text-purple-400 print:text-purple-800 font-medium">
                    ✓ Category Exclusivity Granted ({collab.exclusivity_days} Days)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-zinc-800 print:border-neutral-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 print:bg-neutral-100 border-b border-zinc-800 print:border-neutral-300 text-[10px] uppercase font-semibold text-zinc-400 print:text-neutral-600">
                <tr>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Rate</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 print:divide-neutral-200">
                <tr>
                  <td className="py-4 px-4">
                    <div className="font-bold text-zinc-100 print:text-black">
                      {collab.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 print:text-neutral-600 mt-0.5">
                      Sponsored content creation, platform posting, usage rights, and analytics delivery.
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-mono">1</td>
                  <td className="py-4 px-4 text-right font-mono font-semibold">
                    {sym}{collab.deal_amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-white print:text-black">
                    {sym}{collab.deal_amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="space-y-3 max-w-sm text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/40 print:bg-transparent border border-zinc-800 print:border-none">
                <div className="text-[10px] uppercase font-bold text-zinc-400 print:text-neutral-500 mb-1 flex items-center gap-1.5">
                  <CreditCard size={12} className="text-zinc-500" />
                  Remittance / Bank Transfer Details:
                </div>
                <textarea
                  rows={2}
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  className="w-full bg-transparent border-none text-[11px] text-zinc-300 print:text-black font-mono resize-none focus:outline-none"
                />
              </div>

              {/* Tax Toggle (Hidden in print) */}
              <div className="flex items-center gap-2 print:hidden text-xs">
                <input
                  type="checkbox"
                  id="includeTax"
                  checked={includeTax}
                  onChange={(e) => setIncludeTax(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="includeTax" className="text-zinc-400 cursor-pointer">
                  Include GST / VAT (18%)
                </label>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400 print:text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-zinc-200 print:text-black">
                  {sym}{subtotal.toLocaleString()}
                </span>
              </div>

              {includeTax && (
                <div className="flex justify-between text-zinc-400 print:text-neutral-600">
                  <span>GST ({taxPercent}%):</span>
                  <span className="font-mono text-zinc-200 print:text-black">
                    {sym}{taxAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="border-t border-zinc-800 print:border-neutral-300 pt-2 flex justify-between font-bold text-sm text-white print:text-black">
                <span>Total Due:</span>
                <span className="font-mono text-indigo-400 print:text-black text-base">
                  {sym}{totalPayable.toLocaleString()}
                </span>
              </div>

              <div className="text-[10px] text-zinc-500 print:text-neutral-500 text-right">
                Payment Terms: {collab.payment_terms.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-zinc-800/80 print:border-neutral-200 pt-4 text-center text-[10px] text-zinc-500 print:text-neutral-500">
            Thank you for partnering with us! Generated securely via CollabFlow Creator OS.
          </div>
        </div>
      </div>
    </div>
  );
};
