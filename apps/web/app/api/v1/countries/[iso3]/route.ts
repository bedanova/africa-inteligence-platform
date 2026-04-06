import { NextResponse } from 'next/server'
import { MOCK_COUNTRIES, MOCK_METRICS, MOCK_ACTIONS, MOCK_SECTORS, getCountryBrief } from '@/lib/mock-data'
import type { CountryProfile } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ iso3: string }> },
) {
  const { iso3: iso3Raw } = await params
  const iso3 = iso3Raw.toUpperCase()

  const summary = MOCK_COUNTRIES.find((c) => c.iso3 === iso3)

  if (!summary) {
    return NextResponse.json(
      { error: `Country ${iso3} not found` },
      { status: 404 },
    )
  }

  const profile: CountryProfile = {
    ...summary,
    ai_brief: getCountryBrief(iso3),
    metrics: MOCK_METRICS[iso3] ?? [],
    priority_sectors: MOCK_SECTORS[iso3] ?? [],
    trusted_actions: MOCK_ACTIONS[iso3] ?? [],
  }

  return NextResponse.json({
    data: profile,
    meta: {
      generated_at: new Date().toISOString(),
      freshness: 'fresh',
      sources: 1,
      cache_status: 'MISS',
    },
  })
}
