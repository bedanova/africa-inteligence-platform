/**
 * AI Brief generation endpoint
 * Generates country + continent briefs using Claude, stores in Supabase.
 * Called by Vercel Cron daily at 07:00 UTC (after ingest at 06:00).
 * Also callable manually via GET/POST.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateCountryBrief, generateContinentBrief } from '@/lib/generate-brief'
import { getCountries, getMetrics } from '@/lib/supabase-server'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function runGenerate() {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ ok: false, error: 'GROQ_API_KEY not set' }, { status: 500 })
  }

  const supabase = getSupabase()
  const results: string[] = []
  const errors: string[] = []

  try {
    const countries = await getCountries()

    // Generate country briefs sequentially to stay within free tier rate limits
    for (const country of countries) {
      try {
        const metrics = await getMetrics(country.iso3)
        const brief = await generateCountryBrief(country, metrics)

        const { error } = await supabase.from('briefs').upsert(
          {
            id: `country-${country.iso3.toLowerCase()}`,
            title: brief.title,
            summary: brief.summary,
            bullets: brief.bullets,
            risk_flags: brief.risk_flags,
            citations: brief.citations,
            scope: brief.scope,
            country_iso3: brief.country_iso3,
            freshness: brief.freshness,
            generated_at: brief.generated_at,
            model_name: brief.model_name,
            confidence: brief.confidence,
          },
          { onConflict: 'id' }
        )

        if (error) errors.push(`${country.iso3}: ${error.message}`)
        else results.push(country.iso3)
      } catch (err) {
        errors.push(`${country.iso3}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Generate continent overview brief
    try {
      const continentBrief = await generateContinentBrief(countries)
      const { error } = await supabase.from('briefs').upsert(
        {
          id: 'continent-overview',
          title: continentBrief.title,
          summary: continentBrief.summary,
          bullets: continentBrief.bullets,
          risk_flags: continentBrief.risk_flags,
          citations: continentBrief.citations,
          scope: 'continent',
          country_iso3: null,
          freshness: continentBrief.freshness,
          generated_at: continentBrief.generated_at,
          model_name: continentBrief.model_name,
          confidence: continentBrief.confidence,
        },
        { onConflict: 'id' }
      )
      if (error) errors.push(`continent: ${error.message}`)
      else results.push('continent')
    } catch (err) {
      errors.push(`continent: ${err instanceof Error ? err.message : String(err)}`)
    }

    return NextResponse.json({
      ok: true,
      generated_at: new Date().toISOString(),
      briefs_generated: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runGenerate()
}
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runGenerate()
}
