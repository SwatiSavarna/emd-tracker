'use client'
import { useState } from 'react'

declare global {
  interface Window { Razorpay: any }
}

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    try {
      // Create Razorpay subscription
      const res = await fetch('/api/razorpay/create-subscription', { method: 'POST' })
      const { subscriptionId, key } = await res.json()

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await new Promise<void>(resolve => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          document.head.appendChild(script)
        })
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key,
        subscription_id: subscriptionId,
        name: 'BG Tracker',
        description: 'Monthly subscription — ₹2,999/month',
        prefill: {},
        theme: { color: '#2563EB' },
        handler: async (response: any) => {
          // Verify payment on backend
          await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          })
          window.location.reload()
        }
      })
      rzp.open()
    } catch (err) {
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleSubscribe} disabled={loading}
      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
      {loading ? 'Loading...' : 'Subscribe Now — ₹2,999/month'}
    </button>
  )
}
