import { differenceInDays, parseISO, format } from 'date-fns';
import { Guarantee, GuaranteeStatus } from '@/types';

export function getDaysUntilExpiry(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), new Date());
}

export function getStatusFromDays(days: number, currentStatus: GuaranteeStatus): GuaranteeStatus {
  if (currentStatus === 'renewed' || currentStatus === 'released' || currentStatus === 'forfeited') {
    return currentStatus;
  }
  if (days <= 0) return 'forfeited';
  if (days <= 30) return 'expiring_soon';
  return 'active';
}

export function getEffectiveStatus(g: Guarantee): GuaranteeStatus {
  if (g.status === 'renewed' || g.status === 'released' || g.status === 'forfeited') return g.status;
  const days = getDaysUntilExpiry(g.expiry_date);
  return getStatusFromDays(days, g.status);
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy');
}

export const STATUS_CONFIG: Record<GuaranteeStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: 'Active', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  expiring_soon: { label: 'Expiring Soon', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  renewed: { label: 'Renewed', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  released: { label: 'Released', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  forfeited: { label: 'Forfeited / Expired', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export const GUARANTEE_TYPES = ['EMD', 'Performance BG', 'Bid Bond', 'Advance BG', 'Retention BG'] as const;
export const BANKS = [
  'State Bank of India', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank',
  'Union Bank of India', 'Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'IndusInd Bank', 'Yes Bank', 'Kotak Mahindra Bank', 'Other'
];
