import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await request.json()

  // Verify signature — CRITICAL security check
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex')

  if (generated_signature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Update company subscription status
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users').select('company_id').eq('id', user.id).single()

  const admin = createAdminClient()
  await admin.from('companies').update({
    subscription_status: 'active',
    razorpay_subscription_id
  }).eq('id', userData?.company_id)

  return NextResponse.json({ success: true })
}
