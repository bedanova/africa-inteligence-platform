/**
 * Historical data ingest endpoint — populates metrics_history table for sparklines.
 * Fetches up to 10 years of data from World Bank and IMF.
 *
 * Runs daily at 06:30 UTC (30 min after main ingest).
 * Requires CRON_SECRET header for auth.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllHistoricalIndicators } from '@/lib/ingest/world-bank'
import { fetchAllIMFHistoricalData } from '@/lib/ingest/imf'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function runHistoryIngest() {
  const supabase = getSupabase()
  const errors: string[] = []

  try {
    const [wbResult, imfResult] = await Promise.allSettled([
      fetchAllHistoricalIndicators(),
      fetchAllIMFHistoricalData(),
    ])

    const allPoints = [
      ...(wbResult.status === 'fulfilled' ? wbResult.value : []),
      ...(imfResult.status === 'fulfilled' ? imfResult.value : []),
    ]

    if (wbResult.status === 'rejected')
      errors.push(`World Bank history: ${wbResult.reason}`)
    if (imfResult.status === 'rejected')
      errors.push(`IMF history: ${imfResult.reason}`)

    // Batch upsert in chunks of 500 to avoid payload limits
    const CHUNK = 500
    let written = 0

    for (let i = 0; i < allPoints.length; i += CHUNK) {
      const chunk = allPoints.slice(i, i + CHUNK).map((p) => ({
        country_iso3: p.iso3,
        key: p.indicator,
        value_num: p.value,
        year: p.year,
      }))

      const { error } = await supabase
        .from('metrics_history')
        .upsert(chunk, { onConflict: 'country_iso3,key,year' })

      if (error) errors.push(`batch ${i / CHUNK}: ${error.message}`)
      else written += chunk.length
    }

    return NextResponse.json({
      ok: true,
      ingested_at: new Date().toISOString(),
      total_points: allPoints.length,
      written,
      errors: errors.length > 0 ? errors : undefined,
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

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runHistoryIngest()
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runHistoryIngest()
}
