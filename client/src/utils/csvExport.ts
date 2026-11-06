import { Collab, Currency } from '../types';

export function exportCollabsToCSV(collabs: Collab[], currency: Currency = 'INR') {
  if (!collabs || collabs.length === 0) {
    alert('No collaboration data available to export.');
    return;
  }

  const headers = [
    'Deal ID',
    'Campaign Title',
    'Brand Name',
    'Category',
    'Platform',
    'Deliverable Format',
    'Commercial Type',
    'Deal Amount',
    'Currency',
    'Payment Status',
    'Payment Terms',
    'Amount Paid',
    'Pipeline Stage',
    'Whitelisting',
    'Exclusivity (Days)',
    'Invoice Number',
    'Invoice Date',
    'Payment Due Date',
    'Scheduled Post Date',
    'Live URL',
    'Views',
    'Likes',
    'Created At'
  ];

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = collabs.map((c) => [
    escapeCSV(c.id),
    escapeCSV(c.title),
    escapeCSV(c.brand_name),
    escapeCSV(c.brand_category),
    escapeCSV(c.platform),
    escapeCSV(c.format_label || c.deliverable_format),
    escapeCSV(c.commercial_type),
    c.deal_amount,
    escapeCSV(c.currency || currency),
    escapeCSV(c.payment_status),
    escapeCSV(c.payment_terms),
    c.amount_paid,
    escapeCSV(c.pipeline_stage),
    c.has_ads_whitelisting ? `Yes (${c.whitelisting_duration_days}d)` : 'No',
    c.has_category_exclusivity ? c.exclusivity_days : 0,
    escapeCSV(c.invoice_number || 'N/A'),
    escapeCSV(c.invoice_date || 'N/A'),
    escapeCSV(c.payment_due_date || 'N/A'),
    escapeCSV(c.scheduled_post_date || 'N/A'),
    escapeCSV(c.live_post_url || 'N/A'),
    c.views_count || 0,
    c.likes_count || 0,
    escapeCSV(c.created_at)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `CollabFlow_Financial_Report_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
