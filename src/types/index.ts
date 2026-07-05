export type GuaranteeType = 'EMD' | 'Performance BG' | 'Bid Bond' | 'Advance BG'
export type GuaranteeStatus = 'active' | 'renewed' | 'released' | 'forfeited'
export type SubscriptionStatus = 'trial' | 'active' | 'expired'

export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  subscription_status: SubscriptionStatus
  trial_ends_at: string
  razorpay_subscription_id?: string
}

export interface Guarantee {
  id: string
  company_id: string
  tender_name: string
  tender_number?: string
  department?: string
  type: GuaranteeType
  amount: number
  bank_name: string
  bg_number?: string
  submission_date?: string
  expiry_date: string
  status: GuaranteeStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total: number
  expiringSoon: number
  critical: number
  expired: number
  totalAmount: number
}
