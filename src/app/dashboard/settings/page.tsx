import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SubscribeButton from './SubscribeButton'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('name, company_id, companies(name, email, phone, subscription_status, trial_ends_at)')
    .eq('id', user.id)
    .single()

  const company = userData?.companies as any
  const trialDaysLeft = company?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(company.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Company info */}
      <div className="bg-white rounded-2xl border p-8 mb-6">
        <h2 className="font-semibold mb-4">Company Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Company Name</span>
            <span className="font-medium">{company?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{company?.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium">{company?.phone || 'Not set'}</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl border p-8">
        <h2 className="font-semibold mb-4">Subscription</h2>
        {company?.subscription_status === 'active' ? (
          <div className="flex items-center gap-3">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">✓ Active</span>
            <span className="text-gray-500 text-sm">Your subscription is active. Alerts are running daily.</span>
          </div>
        ) : company?.subscription_status === 'trial' ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                Trial — {trialDaysLeft} days left
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              After your trial ends, subscribe to keep receiving alerts and tracking guarantees.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="text-3xl font-bold text-blue-700">₹2,999<span className="text-lg font-normal">/month</span></div>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                {['Unlimited guarantees', 'Daily email alerts', 'WhatsApp alerts (coming soon)', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            <SubscribeButton />
          </div>
        ) : (
          <div>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Expired</span>
            <p className="text-gray-600 text-sm mt-4 mb-4">Your subscription has expired. Renew to continue receiving alerts.</p>
            <SubscribeButton />
          </div>
        )}
      </div>
    </div>
  )
}
