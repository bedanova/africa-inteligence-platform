import { NextResponse } from 'next/server'
import { MOCK_COUNTRIES } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get('region')

  const countries = region
    ? MOCK_COUNTRIES.filter((c) => c.region === region)
    : MOCK_COUNTRIES

  return NextResponse.json({
    data: countries,
    meta: {
      generated_at: new Date().toISOString(),
      freshness: 'fresh',
      sources: countries.length,
      cache_status: 'MISS',
    },
  })
}
