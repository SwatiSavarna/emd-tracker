import { GuaranteeStatus } from '@/types'

export const STATUS_CONFIG: Record<GuaranteeStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: 'Active', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  renewed: { label: 'Renewed', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  released: { label: 'Released', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  forfeited: { label: 'Forfeited / Expired', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

export function getDaysLeft(expiryDate: string): number {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diff = expiry.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getStatusFromDays(days: number): GuaranteeStatus {
  if (days <= 0) return 'forfeited'
  return 'active'
}