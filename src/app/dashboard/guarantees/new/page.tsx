'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const GUARANTEE_TYPES = ['EMD', 'Performance BG', 'Bid Bond', 'Advance BG']
const BANKS = ['SBI', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank', 'Union Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Other']

export default function NewGuaranteePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tender_name: '', tender_number: '', department: '',
    type: 'EMD', amount: '', bank_name: '', bg_number: '',
    submission_date: '', expiry_date: '', notes: ''
  })

  function update(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/guarantees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">← Back</Link>
        <h1 className="text-2xl font-bold">Add Bank Guarantee / EMD</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-8 space-y-6">
        {/* Tender Info */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Tender Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tender Name *</label>
              <input value={form.tender_name} onChange={e => update('tender_name', e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Construction of NH-37 Bridge Km 42" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tender Number</label>
                <input value={form.tender_number} onChange={e => update('tender_number', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. CPWD/2026/NH/001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <input value={form.department} onChange={e => update('department', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. CPWD, Assam PWD, NHAI" />
              </div>
            </div>
          </div>
        </div>

        {/* BG Details */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Guarantee Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select value={form.type} onChange={e => update('type', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {GUARANTEE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (₹) *</label>
                <input type="number" value={form.amount} onChange={e => update('amount', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500000" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name *</label>
                <select value={form.bank_name} onChange={e => update('bank_name', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select bank...</option>
                  {BANKS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">BG Reference Number</label>
                <input value={form.bg_number} onChange={e => update('bg_number', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bank's BG reference" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Submission Date</label>
                <input type="date" value={form.submission_date} onChange={e => update('submission_date', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                <input type="date" value={form.expiry_date} onChange={e => update('expiry_date', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3} placeholder="Any additional notes..." />
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Guarantee'}
          </button>
          <Link href="/dashboard"
            className="border border-gray-300 text-gray-600 px-8 py-3 rounded-xl hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
