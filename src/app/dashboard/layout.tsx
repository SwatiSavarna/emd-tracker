import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, Plus, Settings } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get company info
  const { data: userData } = await supabase
    .from('users')
    .select('name, companies(name, subscription_status, trial_ends_at)')
    .eq('id', user.id)
    .single()

  const company = userData?.companies as any
  const trialDaysLeft = company?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(company.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <span className="text-blue-700 font-bold text-lg">BG Tracker</span>
          <p className="text-gray-500 text-xs mt-1 truncate">{company?.name}</p>
          {company?.subscription_status === 'trial' && (
            <div className="mt-2 bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded">
              Trial: {trialDaysLeft} days left
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/dashboard/guarantees/new"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700">
            <Plus size={18} /> Add Guarantee
          </Link>
          <Link href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700">
            <Settings size={18} /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t">
          <form action="/api/auth/logout" method="POST">
            <button className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-red-600 w-full text-sm">
              <LogOut size={16} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
