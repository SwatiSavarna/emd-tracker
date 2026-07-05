'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = await createClient()

  function update(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Create Supabase auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } }
    })

    if (authError || !data.user) {
      setError(authError?.message || 'Signup failed')
      setLoading(false)
      return
    }

    // 2. Create company + user record via API
    const res = await fetch('/api/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: data.user.id,
        name: form.name,
        email: form.email,
        companyName: form.companyName,
        phone: form.phone,
      })
    })

    if (!res.ok) {
      setError('Account created but setup failed. Please contact support.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border p-10 w-full max-w-md">
        <Link href="/" className="text-blue-600 font-bold text-xl block mb-8">BG Tracker</Link>
        <h1 className="text-2xl font-bold mb-2">Start your free trial</h1>
        <p className="text-gray-500 mb-8">14 days free • No credit card needed</p>

        <form onSubmit={handleSignup} className="space-y-4">
          {[
            { label: 'Your Name', field: 'name', type: 'text', placeholder: 'Rajesh Kumar' },
            { label: 'Company Name', field: 'companyName', type: 'text', placeholder: 'Kumar Constructions Pvt Ltd' },
            { label: 'Phone (for WhatsApp alerts)', field: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
            { label: 'Email', field: 'email', type: 'email', placeholder: 'rajesh@company.com' },
            { label: 'Password', field: 'password', type: 'password', placeholder: 'Min 8 characters' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2">{label}</label>
              <input type={type} value={form[field as keyof typeof form]}
                onChange={e => update(field, e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder} required />
            </div>
          ))}

          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
