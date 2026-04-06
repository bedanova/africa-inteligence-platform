import { NextResponse } from 'next/server'
import { getBriefs } from '@/lib/supabase-server'
import { MOCK_BRIEFS } from '@/lib/mock-data'

export async function GET() {
  try {
    const briefs = await getBriefs()
    return NextResponse.json({
      data: briefs,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: briefs.length, cache_status: 'MISS' },
    })
  } catch {
    return NextResponse.json({
      data: MOCK_BRIEFS,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: MOCK_BRIEFS.length, cache_status: 'MISS' },
    })
  }
}
