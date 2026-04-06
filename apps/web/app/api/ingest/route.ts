/**
 * Data ingest endpoint — fetches live data from three public sources:
 *   1. World Bank Open Data (CC BY 4.0) — GDP growth, internet access, under-5 mortality
 *   2. WHO Global Health Observatory (CC BY-NC-SA 3.0 IGO) — life expectancy, maternal mortality
 *   3. UN SDG API (UN Open Data) — electricity access
 *
 * Called by Vercel Cron Job daily at 06:00 UTC, or manually via GET/POST.
 * No authentication required on the endpoint (data is public; writes go to our own DB).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllIndicators, calculateScores, type AllDataPoint } from '@/lib/ingest/world-bank'
import { fetchAllWHOIndicators } from '@/lib/ingest/who'
import { fetchAllSDGIndicators } from '@/lib/ingest/un-sdg'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const METRIC_META: Record<string, { label: string; unit: string | null; source: string }> = {
  gdp_growth:          { label: 'GDP Growth',           unit: '%',       source: 'World Bank' },
  internet_access:     { label: 'Internet Access',      unit: '%',       source: 'World Bank' },
  mortality_u5:        { label: 'Under-5 Mortality',    unit: 'per 1k',  source: 'World Bank' },
  life_expectancy:     { label: 'Life Expectancy',      unit: 'years',   source: 'WHO GHO' },
  maternal_mortality:  { label: 'Maternal Mortality',   unit: 'per 100k',source: 'WHO GHO' },
  electricity_access:  { label: 'Electricity Access',   unit: '%',       source: 'UN SDG' },
}

async function runIngest() {
  const supabase = getSupabase()
  const results: { iso3: string; updated: string[] }[] = []
  const errors: string[] = []

  try {
    // 1. Fetch all sources in parallel
    const [wbData, whoData, sdgData] = await Promise.all([
      fetchAllIndicators(),
      fetchAllWHOIndicators(),
      fetchAllSDGIndicators(),
    ])

    // 2. Merge into unified format for score calculation
    const allData: AllDataPoint[] = [
      ...wbData.map((d) => ({ iso3: d.iso3, indicator: d.indicator, value: d.value, source: d.source })),
      ...whoData.map((d) => ({ iso3: d.iso3, indicator: d.indicator, value: d.value, source: d.source })),
      ...sdgData.map((d) => ({ iso3: d.iso3, indicator: d.indicator, value: d.value, source: d.source })),
    ]

    // 3. Get current stability scores (no live source yet — preserve)
    const { data: countries } = await supabase.from('countries').select('iso3, score_stability')
    const stabilityMap = Object.fromEntries(
      (countries ?? []).map((c: { iso3: string; score_stability: number }) => [c.iso3, c.score_stability])
    )

    // 4. Upsert metrics and recalculate scores per country
    const isos = [...new Set(allData.map((d) => d.iso3))]

    for (const iso3 of isos) {
      const updated: string[] = []
      const countryPoints = allData.filter((d) => d.iso3 === iso3)

      for (const point of countryPoints) {
        const meta = METRIC_META[point.indicator]
        if (!meta) continue

        const { error } = await supabase.from('metrics').upsert({
          country_iso3: iso3,
          key: point.indicator,
          label: meta.label,
          value_num: point.value,
          value_text: null,
          unit: meta.unit,
          trend: null,
          source: meta.source,
          source_year: allData.find((d) => d.iso3 === iso3 && d.indicator === point.indicator) != null
            ? (wbData.find((d) => d.iso3 === iso3 && d.indicator === point.indicator)?.year
              ?? whoData.find((d) => d.iso3 === iso3 && d.indicator === point.indicator)?.year
              ?? sdgData.find((d) => d.iso3 === iso3 && d.indicator === point.indicator)?.year
              ?? new Date().getFullYear())
            : new Date().getFullYear(),
          freshness: 'fresh',
        }, { onConflict: 'country_iso3,key' })

        if (error) errors.push(`metrics ${iso3}/${point.indicator}: ${error.message}`)
        else updated.push(point.indicator)
      }

      // Recalculate composite scores
      const scores = calculateScores(allData, iso3, stabilityMap[iso3] ?? 50)
      const { error: scoreError } = await supabase
        .from('countries')
        .update({ score_need: scores.need, score_opportunity: scores.opportunity, updated_at: new Date().toISOString(), freshness: 'fresh' })
        .eq('iso3', iso3)

      if (scoreError) errors.push(`scores ${iso3}: ${scoreError.message}`)
      else updated.push('scores')

      results.push({ iso3, updated })
    }

    return NextResponse.json({
      ok: true,
      ingested_at: new Date().toISOString(),
      countries_updated: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      sources: [
        'World Bank Open Data (CC BY 4.0)',
        'WHO Global Health Observatory (CC BY-NC-SA 3.0 IGO)',
        'UN SDG API (UN Open Data)',
      ],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runIngest()
}
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runIngest()
}
