// This runs daily as a cron job via Vercel Cron
// Set in vercel.json: { "crons": [{ "path": "/api/alerts", "schedule": "0 9 * * *" }] }
// It sends email alerts for guarantees expiring in 30, 15, or 7 days

import { createAdminClient } from '@/lib/supabase-server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { differenceInDays, parseISO } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)
const ALERT_DAYS = [30, 15, 7]

export async function GET(request: Request) {
  // Protect this endpoint — only allow Vercel cron or your secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get all active guarantees with company + user email info
  const { data: guarantees, error } = await supabase
    .from('guarantees')
    .select(`
      id, tender_name, type, amount, bank_name, expiry_date,
      company_id,
      companies(name, email)
    `)
    .eq('status', 'active')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let emailsSent = 0
  const today = new Date()

  for (const g of guarantees || []) {
    const daysLeft = differenceInDays(parseISO(g.expiry_date), today)

    if (!ALERT_DAYS.includes(daysLeft)) continue

    // Check if we already sent this alert (avoid duplicates)
    const { data: existing } = await supabase
      .from('alert_logs')
      .select('id')
      .eq('guarantee_id', g.id)
      .eq('days_before', daysLeft)
      .single()

    if (existing) continue // already sent

    const company = g.companies as any
    const urgency = daysLeft <= 7 ? '🔴 URGENT' : daysLeft <= 15 ? '🟠 Important' : '🟡 Reminder'

    // Send email alert
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: company.email,
      subject: `${urgency}: ${g.tender_name} BG expires in ${daysLeft} days`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${daysLeft <= 7 ? '#FEF2F2' : daysLeft <= 15 ? '#FFF7ED' : '#FEFCE8'}; 
                      padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: ${daysLeft <= 7 ? '#DC2626' : daysLeft <= 15 ? '#EA580C' : '#CA8A04'}">
              ${urgency}: Bank Guarantee Expiring in ${daysLeft} Days
            </h2>
          </div>
          
          <p>Dear ${company.name} Team,</p>
          <p>This is an automated reminder that the following bank guarantee is expiring soon:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            ${[
              ['Tender', g.tender_name],
              ['Type', g.type],
              ['Bank', g.bank_name],
              ['Amount', `₹${g.amount.toLocaleString('en-IN')}`],
              ['Expiry Date', new Date(g.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
              ['Days Remaining', `${daysLeft} days`],
            ].map(([label, value]) => `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 10px; color: #6B7280; font-weight: 500;">${label}</td>
                <td style="padding: 10px; font-weight: 600;">${value}</td>
              </tr>
            `).join('')}
          </table>
          
          <div style="background: #EFF6FF; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <strong>Action Required:</strong> Please contact your bank immediately to renew or extend this guarantee
            to avoid disqualification from the tender.
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; 
                    text-decoration: none; display: inline-block; margin-top: 10px;">
            View Dashboard →
          </a>
          
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 30px;">
            BG Tracker — Automated Alert System<br>
            To update alert settings, visit your dashboard.
          </p>
        </div>
      `
    })

    // Log the alert so we don't send it again
    await supabase.from('alert_logs').insert({
      guarantee_id: g.id,
      days_before: daysLeft,
      channel: 'email'
    })

    emailsSent++
  }

  return NextResponse.json({
    success: true,
    emailsSent,
    message: `Processed ${guarantees?.length} guarantees, sent ${emailsSent} alerts`
  })
}
