import { NextResponse } from 'next/server'
import { getPendingStartups } from '@/lib/supabase-startups'

export async function GET() {
  try {
    const items = await getPendingStartups()
    return NextResponse.json({ items })
  } catch (err) {
    return NextResponse.json({ items: [], error: err instanceof Error ? err.message : String(err) })
  }
}
