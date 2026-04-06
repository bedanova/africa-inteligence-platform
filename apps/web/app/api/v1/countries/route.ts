import { NextResponse } from 'next/server'
import { getCountries } from '@/lib/supabase-server'
import { MOCK_COUNTRIES } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get('region') ?? undefined

  try {
    const countries = await getCountries(region)
    return NextResponse.json({
      data: countries,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: countries.length, cache_status: 'MISS' },
    })
  } catch {
    const countries = region
      ? MOCK_COUNTRIES.filter((c) => c.region === region)
      : MOCK_COUNTRIES
    return NextResponse.json({
      data: countries,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: countries.length, cache_status: 'MISS' },
    })
  }
}
