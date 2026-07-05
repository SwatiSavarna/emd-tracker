
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
const supabase = await createClient()
  const { data, error } = await supabase.from('guarantees').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase =  await createClient()
  const body = await request.json()
  const { error } = await supabase.from('guarantees').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase =  await createClient()
  const { error } = await supabase.from('guarantees').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}












// import { createClient } from '@/lib/supabase-server'
// import { NextResponse } from 'next/server'

// export async function GET(_: Request, { params }: { params: { id: string } }) {
//   const supabase = createClient()
//   const { data, error } = await supabase.from('guarantees').select('*').eq('id', params.id).single()
//   if (error) return NextResponse.json({ error: error.message }, { status: 404 })
//   return NextResponse.json(data)
// }

// export async function PATCH(request: Request, { params }: { params: { id: string } }) {
//   const supabase = createClient()
//   const body = await request.json()
//   const { error } = await supabase.from('guarantees').update(body).eq('id', params.id)
//   if (error) return NextResponse.json({ error: error.message }, { status: 500 })
//   return NextResponse.json({ success: true })
// }

// export async function DELETE(_: Request, { params }: { params: { id: string } }) {
//   const supabase = createClient()
//   const { error } = await supabase.from('guarantees').delete().eq('id', params.id)
//   if (error) return NextResponse.json({ error: error.message }, { status: 500 })
//   return NextResponse.json({ success: true })
// }
