/**
 * GET /api/v1/metric-history?key=gdp_growth&iso3=KEN
 *
 * Returns:
 * - Country time-series from metrics_history table
 * - UK (GBR) + EU (EUU) comparison data fetched live from World Bank API
 *   (only for indicators that have a World Bank code — returns empty array otherwise)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { INDICATORS } from '@/lib/ingest/world-bank'

const WB_BASE = 'https://api.worldbank.org/v2'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function fetchWBComparison(
  wbCode: string,
  iso3s: string[], // e.g. ['GBR', 'EUU']
): Promise<Record<string, { year: number; value: number; name: string }[]>> {
  const url = `${WB_BASE}/country/${iso3s.join(';')}/indicator/${wbCode}?format=json&mrv=30&per_page=200`
  try {
    const res = await fetch(url, { next: { revalidate: 3600 }, headers: { Accept: 'application/json' } })
    if (!res.ok) return {}
    const json = await res.json()
    const rows = Array.isArray(json) && json.length > 1 ? json[1] : []

    const result: Record<string, { year: number; value: number; name: string }[]> = {}
    for (const r of rows) {
      if (r.value == null) continue
      const iso3: string = r.countryiso3code
      if (!iso3s.includes(iso3)) continue
      if (!result[iso3]) result[iso3] = []
      result[iso3].push({
        year: Number(r.date),
        value: Number(r.value),
        name: r.country?.value ?? iso3,
      })
    }
    // Sort each series by year asc
    for (const key of Object.keys(result)) {
      result[key].sort((a, b) => a.year - b.year)
    }
    return result
  } catch {
    return {}
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  const iso3 = searchParams.get('iso3')?.toUpperCase()

  if (!key || !iso3) {
    return NextResponse.json({ error: 'key and iso3 required' }, { status: 400 })
  }

  const supabase = getSupabase()

  // 1. Fetch country history from DB
  const { data: historyRows } = await supabase
    .from('metrics_history')
    .select('year, value_num')
    .eq('country_iso3', iso3)
    .eq('key', key)
    .order('year', { ascending: true })

  const countryHistory = (historyRows ?? []).map((r) => ({
    year: r.year,
    value: Number(r.value_num),
  }))

  // 2. Fetch current metric for label/unit/latest value
  const { data: metricRow } = await supabase
    .from('metrics')
    .select('label, unit, value_num, source_year')
    .eq('country_iso3', iso3)
    .eq('key', key)
    .maybeSingle()

  // 3. Fetch comparison data if WB indicator
  const wbCode = (INDICATORS as Record<string, string>)[key]
  let comparisons: Record<string, { year: number; value: number; name: string }[]> = {}
  if (wbCode) {
    comparisons = await fetchWBComparison(wbCode, ['GBR', 'EUU'])
  }

  return NextResponse.json({
    key,
    iso3,
    label: metricRow?.label ?? key,
    unit: metricRow?.unit ?? null,
    latestValue: metricRow?.value_num != null ? Number(metricRow.value_num) : null,
    latestYear: metricRow?.source_year ?? null,
    hasComparison: !!wbCode,
    countryHistory,
    comparisons: {
      GBR: comparisons['GBR'] ?? [],
      EUU: comparisons['EUU'] ?? [],
    },
  })
}
