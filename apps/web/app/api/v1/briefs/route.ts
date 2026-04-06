import { NextResponse } from 'next/server'
import { MOCK_BRIEFS } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({
    data: MOCK_BRIEFS,
    meta: {
      generated_at: new Date().toISOString(),
      freshness: 'fresh',
      sources: MOCK_BRIEFS.length,
      cache_status: 'MISS',
    },
  })
}
