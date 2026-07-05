import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { differenceInDays, parseISO } from 'date-fns'
import Link from 'next/link'
import { Guarantee } from '@/types'

function getDaysLeft(expiryDate: string) {
  return differenceInDays(parseISO(expiryDate), new Date())
}

function StatusBadge({ days }: { days: number }) {
  if (days < 0) return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Expired</span>
  if (days <= 7) return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">🔴 {days}d left</span>
  if (days <= 15) return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">🟠 {days}d left</span>
  if (days <= 30) return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">🟡 {days}d left</span>
  return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{days}d left</span>
}

export default async function DashboardPage() {
const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  const { data: guarantees } = await supabase
    .from('guarantees')
    .select('*')
    .eq('company_id', userData?.company_id)
    .eq('status', 'active')
    .order('expiry_date', { ascending: true })

  const list = (guarantees || []) as Guarantee[]

  // Stats
  const stats = {
    total: list.length,
    critical: list.filter(g => getDaysLeft(g.expiry_date) <= 7 && getDaysLeft(g.expiry_date) >= 0).length,
    expiringSoon: list.filter(g => getDaysLeft(g.expiry_date) <= 30 && getDaysLeft(g.expiry_date) > 7).length,
    expired: list.filter(g => getDaysLeft(g.expiry_date) < 0).length,
    totalAmount: list.reduce((sum, g) => sum + g.amount, 0),
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">All active bank guarantees & EMDs</p>
        </div>
        <Link href="/dashboard/guarantees/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700">
          + Add Guarantee
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Active', value: stats.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Critical (≤7 days)', value: stats.critical, color: 'bg-red-50 text-red-700' },
          { label: 'Expiring Soon', value: stats.expiringSoon, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Total BG Amount', value: `₹${(stats.totalAmount / 100000).toFixed(1)}L`, color: 'bg-green-50 text-green-700' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-5`}>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm mt-1 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Guarantees table */}
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold mb-2">No guarantees yet</h2>
          <p className="text-gray-500 mb-6">Add your first EMD or bank guarantee to start tracking</p>
          <Link href="/dashboard/guarantees/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
            Add Your First Guarantee
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Tender Name', 'Type', 'Bank', 'Amount', 'Expiry Date', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(g => {
                const days = getDaysLeft(g.expiry_date)
                return (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-medium">{g.tender_name}</div>
                      {g.tender_number && <div className="text-gray-400 text-xs">{g.tender_number}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{g.type}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{g.bank_name}</td>
                    <td className="px-5 py-4 font-medium">₹{g.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(g.expiry_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-5 py-4"><StatusBadge days={days} /></td>
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/guarantees/${g.id}`}
                        className="text-blue-600 hover:underline text-xs">Edit</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
