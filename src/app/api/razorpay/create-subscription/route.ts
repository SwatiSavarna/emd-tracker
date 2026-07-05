import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  // Create a Razorpay subscription
  // You first need to create a Plan in Razorpay dashboard:
  // Dashboard > Subscriptions > Plans > Create Plan
  // Amount: 299900 (₹2999 in paise), Period: monthly
  const subscription = await razorpay.subscriptions.create({
    plan_id: process.env.RAZORPAY_PLAN_ID!, // from Razorpay dashboard
    total_count: 120, // 10 years max
    quantity: 1,
    notify_info: {
      notify_email: user.email ?? '',
    }
  })

  return NextResponse.json({
    subscriptionId: subscription.id,
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  })
}
