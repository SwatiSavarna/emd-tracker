import { createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId, name, email, companyName, phone } = await request.json()
  const supabase =  await createAdminClient()

  // Create company first
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({ name: companyName, email, phone })
    .select()
    .single()

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 })
  }

  // Link user to company
  const { error: userError } = await supabase
    .from('users')
    .insert({ id: userId, company_id: company.id, name, email })

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, companyId: company.id })
}
