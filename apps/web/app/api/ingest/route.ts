/**
 * Data ingest endpoint — fetches live data from World Bank Open Data API
 * and upserts into Supabase.
 *
 * Called by:
 *   - Vercel Cron Job (daily, Authorization: Bearer <CRON_SECRET>)
 *   - Manual trigger: POST /api/ingest with same header
 *
 * Data sources used here:
 *   - World Bank Open Data (CC BY 4.0, no auth required)
 *     https://datahelpdesk.worldbank.org/knowledgebase/articles/898581
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllIndicators, calculateScores } from '@/lib/ingest/world-bank'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Use service role key for writes (bypasses RLS safely, server-side only)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const results: { iso3: string; updated: string[] }[] = []
  const errors: string[] = []

  try {
    // 1. Fetch all World Bank indicators for all 8 countries in parallel
    const data = await fetchAllIndicators()

    // 2. Get current stability scores (preserved — no live source)
    const { data: countries } = await supabase
      .from('countries')
      .select('iso3, score_stability')

    const stabilityMap = Object.fromEntries(
      (countries ?? []).map((c: { iso3: string; score_stability: number }) => [c.iso3, c.score_stability])
    )

    // 3. Group by country and upsert
    const isos = [...new Set(data.map((d) => d.iso3))]

    for (const iso3 of isos) {
      const updated: string[] = []

      // Upsert metrics
      const countryData = data.filter((d) => d.iso3 === iso3)
      for (const point of countryData) {
        const isNumeric = typeof point.value === 'number'
        const { error } = await supabase
          .from('metrics')
          .upsert({
            country_iso3: iso3,
            key: point.indicator,
            label: {
              gdp_growth: 'GDP Growth',
              internet_access: 'Internet Access',
              mortality_u5: 'Under-5 Mortality',
            }[point.indicator],
            value_num: isNumeric ? point.value : null,
            value_text: isNumeric ? null : String(point.value),
            unit: {
              gdp_growth: '%',
              internet_access: '%',
              mortality_u5: 'per 1k',
            }[point.indicator],
            trend: null, // calculated in next ingest cycle when prev value is stored
            source: 'World Bank',
            source_year: point.year,
            freshness: 'fresh',
          }, { onConflict: 'country_iso3,key' })

        if (error) {
          errors.push(`metrics upsert ${iso3}/${point.indicator}: ${error.message}`)
        } else {
          updated.push(point.indicator)
        }
      }

      // Recalculate composite scores
      const scores = calculateScores(data, iso3, stabilityMap[iso3] ?? 50)
      const { error: scoreError } = await supabase
        .from('countries')
        .update({
          score_need: scores.need,
          score_opportunity: scores.opportunity,
          updated_at: new Date().toISOString(),
          freshness: 'fresh',
        })
        .eq('iso3', iso3)

      if (scoreError) {
        errors.push(`score update ${iso3}: ${scoreError.message}`)
      } else {
        updated.push('scores')
      }

      results.push({ iso3, updated })
    }

    return NextResponse.json({
      ok: true,
      ingested_at: new Date().toISOString(),
      countries_updated: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      sources: ['World Bank Open Data (CC BY 4.0)'],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// Vercel Cron calls GET
export async function GET(request: Request) {
  return POST(request)
}
