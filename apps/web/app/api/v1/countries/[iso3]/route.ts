import { NextResponse } from 'next/server'
import { getCountry, getMetrics, getSectors, getActions, getCountryBriefFromDb } from '@/lib/supabase-server'
import { MOCK_COUNTRIES, MOCK_METRICS, MOCK_SECTORS, MOCK_ACTIONS, getCountryBrief } from '@/lib/mock-data'
import type { CountryProfile } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ iso3: string }> },
) {
  const { iso3: iso3Raw } = await params
  const iso3 = iso3Raw.toUpperCase()

  try {
    const [summary, metrics, sectors, actions, brief] = await Promise.all([
      getCountry(iso3),
      getMetrics(iso3),
      getSectors(iso3),
      getActions(iso3),
      getCountryBriefFromDb(iso3),
    ])

    if (!summary) {
      return NextResponse.json({ error: `Country ${iso3} not found` }, { status: 404 })
    }

    const profile: CountryProfile = {
      ...summary,
      ai_brief: brief,
      metrics,
      priority_sectors: sectors,
      trusted_actions: actions,
    }

    return NextResponse.json({
      data: profile,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: 5, cache_status: 'MISS' },
    })
  } catch {
    const summary = MOCK_COUNTRIES.find((c) => c.iso3 === iso3)
    if (!summary) {
      return NextResponse.json({ error: `Country ${iso3} not found` }, { status: 404 })
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
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: 1, cache_status: 'MISS' },
    })
  }
}
