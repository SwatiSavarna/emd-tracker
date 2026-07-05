'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Guarantee, GuaranteeStatus } from '@/types'

const GUARANTEE_TYPES = ['EMD', 'Performance BG', 'Bid Bond', 'Advance BG']
const BANKS = ['SBI', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank', 'Union Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Other']
const STATUSES: GuaranteeStatus[] = ['active', 'renewed', 'released', 'forfeited']

export default function EditGuaranteePage() {
  // const params = useParams()
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [guarantee, setGuarantee] = useState<Guarantee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/guarantees/${params.id}`)
      .then(r => r.json())
      .then(setGuarantee)
  }, [params.id])

  function update(field: string, val: string | number) {
    setGuarantee(g => g ? { ...g, [field]: val } : g)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/guarantees/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guarantee)
    })
    if (res.ok) router.push('/dashboard')
    else { setError('Failed to save'); setLoading(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this guarantee? This cannot be undone.')) return
    await fetch(`/api/guarantees/${params.id}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  if (!guarantee) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">← Back</Link>
        <h1 className="text-2xl font-bold">Edit Guarantee</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Tender Name</label>
          <input value={guarantee.tender_name} onChange={e => update('tender_name', e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select value={guarantee.type} onChange={e => update('type', e.target.value)}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {GUARANTEE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select value={guarantee.status} onChange={e => update('status', e.target.value)}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
            <input type="number" value={guarantee.amount} onChange={e => update('amount', parseFloat(e.target.value))}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bank</label>
            <select value={guarantee.bank_name} onChange={e => update('bank_name', e.target.value)}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {BANKS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Expiry Date</label>
          <input type="date" value={guarantee.expiry_date?.slice(0, 10)}
            onChange={e => update('expiry_date', e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea value={guarantee.notes || ''} onChange={e => update('notes', e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm px-4 py-3">
            Delete Guarantee
          </button>
        </div>
      </form>
    </div>
  )
}
