import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b">
        <span className="text-xl font-bold text-blue-700">BG Tracker</span>
        <div className="flex gap-4">
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 px-4 py-2">Login</Link>
          <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-block bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          ⚠️ Missing an EMD renewal = disqualification from government tenders
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Never miss a Bank Guarantee<br />renewal again
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Track all your EMDs, Performance BGs, and Bid Bonds in one dashboard.
          Get WhatsApp + email alerts 30, 15, and 7 days before expiry.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700">
            Start 14-Day Free Trial →
          </Link>
          <a href="mailto:hello@yourdomain.com"
            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg hover:bg-gray-50">
            Request Demo
          </a>
        </div>
        <p className="text-gray-400 text-sm mt-4">No credit card required • Cancel anytime</p>
      </div>

      {/* Pain points */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-14">Built for Indian government contractors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📋', title: 'Track all guarantee types', desc: 'EMD, Performance BG, Bid Bond, Advance BG — all in one place. No more scattered Excel sheets.' },
              { icon: '🔔', title: 'Automatic renewal alerts', desc: 'Get WhatsApp and email alerts at 30, 15, and 7 days before expiry. Never be caught off guard.' },
              { icon: '📊', title: 'Dashboard overview', desc: 'See total BG amount locked, upcoming renewals, and critical expiries at a glance.' },
            ].map(item => (
              <div key={item.title} className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-20 max-w-3xl mx-auto px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Simple, honest pricing</h2>
        <p className="text-gray-600 mb-12">One missed renewal costs more than a year of subscription</p>
        <div className="bg-blue-600 text-white rounded-2xl p-10">
          <div className="text-5xl font-bold mb-2">₹2,999<span className="text-2xl font-normal">/month</span></div>
          <p className="text-blue-200 mb-8">Per company • Unlimited users • Unlimited guarantees</p>
          <ul className="text-left space-y-3 mb-10 max-w-xs mx-auto">
            {['Unlimited BG/EMD entries', 'WhatsApp + email alerts', 'Dashboard & reports', 'Priority support', '14-day free trial'].map(f => (
              <li key={f} className="flex items-center gap-3">
                <span className="text-green-300">✓</span> {f}
              </li>
            ))}
          </ul>
          <Link href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 inline-block">
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  )
}
