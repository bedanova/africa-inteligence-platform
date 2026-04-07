/**
 * Data ingest endpoint — fetches live data from six public sources:
 *   1. World Bank Open Data (CC BY 4.0) — 36 indicators across economy, health, education, environment, SDGs
 *   2. WHO Global Health Observatory (CC BY-NC-SA 3.0 IGO) — life expectancy, maternal mortality, NCD mortality, obesity, physicians
 *   3. UN SDG API (UN Open Data) — electricity access, food insecurity, conflict deaths, mobile coverage
 *   4. IMF DataMapper (CC BY 4.0) — government gross debt, current account balance
 *   5. ACLED (free academic/research use) — conflict events and fatalities (requires ACLED_API_KEY + ACLED_EMAIL)
 *   6. UNHCR Population Statistics (CC BY 4.0) — refugees by origin, internally displaced persons
 *
 * Called by Vercel Cron Job daily at 06:00 UTC, or manually via GET/POST.
 * No authentication required on the endpoint (data is public; writes go to our own DB).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllIndicators, fetchAllHistoricalIndicators, calculateScores, type AllDataPoint } from '@/lib/ingest/world-bank'
import { fetchAllWHOIndicators } from '@/lib/ingest/who'
import { fetchAllSDGIndicators } from '@/lib/ingest/un-sdg'
import { fetchAllIMFIndicators, fetchAllIMFHistoricalData } from '@/lib/ingest/imf'
import { fetchAllACLEDIndicators } from '@/lib/ingest/acled'
import { fetchAllUNHCRIndicators } from '@/lib/ingest/unhcr'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const METRIC_META: Record<string, { label: string; unit: string | null; source: string }> = {
  // World Bank
  gdp_growth:           { label: 'GDP Growth',                      unit: '%',        source: 'World Bank' },
  inflation:            { label: 'Inflation (CPI)',                  unit: '%',        source: 'World Bank' },
  fdi:                  { label: 'FDI Inflows',                      unit: '% GDP',    source: 'World Bank' },
  internet_access:      { label: 'Internet Access',                  unit: '%',        source: 'World Bank' },
  mortality_u5:         { label: 'Under-5 Mortality',                unit: 'per 1k',   source: 'World Bank' },
  poverty_215:          { label: 'Poverty Headcount ($2.15/day)',    unit: '%',        source: 'World Bank' },
  gini:                 { label: 'Gini Index',                       unit: null,       source: 'World Bank' },
  unemployment:         { label: 'Unemployment Rate',                unit: '%',        source: 'World Bank' },
  water_access:         { label: 'Safe Drinking Water Access',       unit: '%',        source: 'World Bank' },
  co2_per_capita:       { label: 'CO₂ Emissions per Capita',        unit: 't/capita', source: 'World Bank' },
  political_stability:          { label: 'Political Stability Index',          unit: '/100',    source: 'World Bank WGI' },
  population:                   { label: 'Population',                          unit: null,      source: 'World Bank' },
  // Education (SDG 4) — World Bank
  school_enrollment_primary:    { label: 'Net Primary School Enrollment',       unit: '%',       source: 'World Bank' },
  school_enrollment_secondary:  { label: 'Net Secondary School Enrollment',     unit: '%',       source: 'World Bank' },
  literacy_rate:                { label: 'Adult Literacy Rate',                 unit: '%',       source: 'World Bank' },
  primary_completion:           { label: 'Primary Completion Rate',             unit: '%',       source: 'World Bank' },
  // Gender equality (SDG 5) — World Bank
  women_in_parliament:          { label: 'Women in Parliament',                 unit: '%',       source: 'World Bank' },
  female_labor_participation:   { label: 'Female Labour Force Participation',   unit: '%',       source: 'World Bank' },
  gender_parity_education:      { label: 'Gender Parity Index — Education',     unit: 'GPI',     source: 'World Bank' },
  // SDG 2 — Hunger (World Bank)
  undernourishment:          { label: 'Undernourishment Prevalence',         unit: '%',        source: 'World Bank' },
  stunting_u5:               { label: 'Stunting, Children Under 5',          unit: '%',        source: 'World Bank' },
  // SDG 3 — Health (World Bank)
  health_expenditure:        { label: 'Current Health Expenditure',          unit: '% GDP',    source: 'World Bank' },
  hospital_beds:             { label: 'Hospital Beds',                       unit: 'per 1k',   source: 'World Bank' },
  // SDG 4 — Education spending (World Bank)
  education_expenditure:     { label: 'Government Education Expenditure',    unit: '% GDP',    source: 'World Bank' },
  // SDG 7/12 — Energy (World Bank)
  renewable_electricity:     { label: 'Renewable Electricity Output',        unit: '%',        source: 'World Bank' },
  energy_use_per_capita:     { label: 'Energy Use per Capita',               unit: 'kg oil eq',source: 'World Bank' },
  // SDG 11 — Cities (World Bank)
  urban_population:          { label: 'Urban Population Share',              unit: '%',        source: 'World Bank' },
  slum_population:           { label: 'Population in Slums',                 unit: '% urban',  source: 'World Bank' },
  // SDG 14 — Ocean (World Bank)
  marine_protected_areas:    { label: 'Marine Protected Areas',              unit: '% waters', source: 'World Bank' },
  // SDG 15 — Land (World Bank)
  forest_area:               { label: 'Forest Area',                         unit: '% land',   source: 'World Bank' },
  protected_areas:           { label: 'Protected Areas',                     unit: '% total',  source: 'World Bank' },
  // Economy — additional (World Bank)
  gdp_per_capita:            { label: 'GDP per Capita',                      unit: 'USD',       source: 'World Bank' },
  // SDG 6 — Sanitation (World Bank)
  sanitation_access:         { label: 'Safe Sanitation Access',              unit: '%',         source: 'World Bank' },
  // Connectivity (World Bank)
  mobile_subscriptions:      { label: 'Mobile Subscriptions',                unit: 'per 100',   source: 'World Bank' },
  // Financial inclusion (World Bank)
  access_to_finance:         { label: 'Bank Account Ownership',              unit: '%',         source: 'World Bank' },
  // Land use (World Bank)
  agricultural_land:         { label: 'Agricultural Land',                   unit: '% land',    source: 'World Bank' },
  // IMF DataMapper
  govt_debt:                 { label: 'Government Gross Debt',               unit: '% GDP',     source: 'IMF DataMapper' },
  current_account:           { label: 'Current Account Balance',             unit: '% GDP',     source: 'IMF DataMapper' },
  // ACLED
  conflict_events:           { label: 'Conflict Events (Annual)',            unit: 'events',    source: 'ACLED' },
  conflict_fatalities:       { label: 'Conflict Fatalities (Annual)',        unit: 'deaths',    source: 'ACLED' },
  // UNHCR
  refugees_origin:           { label: 'Refugees & Asylum Seekers',          unit: 'people',    source: 'UNHCR' },
  idps:                      { label: 'Internally Displaced Persons',        unit: 'people',    source: 'UNHCR' },
  // WHO GHO
  life_expectancy:      { label: 'Life Expectancy',                  unit: 'years',    source: 'WHO GHO' },
  maternal_mortality:   { label: 'Maternal Mortality',               unit: 'per 100k', source: 'WHO GHO' },
  // WHO GHO new
  ncd_mortality:             { label: 'NCD Premature Mortality (30–70)',      unit: '%',        source: 'WHO GHO' },
  obesity_rate:              { label: 'Obesity Prevalence',                  unit: '%',        source: 'WHO GHO' },
  physicians_per_10k:        { label: 'Medical Doctors',                     unit: 'per 10k',  source: 'WHO GHO' },
  // UN SDG
  electricity_access:   { label: 'Electricity Access',               unit: '%',        source: 'UN SDG' },
  // UN SDG new
  food_insecurity:           { label: 'Moderate/Severe Food Insecurity',     unit: '%',        source: 'UN SDG' },
  conflict_deaths:           { label: 'Conflict-Related Deaths',             unit: 'per 100k', source: 'UN SDG' },
  mobile_coverage:           { label: '4G Mobile Network Coverage',          unit: '%',        source: 'UN SDG' },
}

async function runIngest() {
  const supabase = getSupabase()
  const results: { iso3: string; updated: string[] }[] = []
  const errors: string[] = []

  try {
    // 1. Fetch all sources in parallel (current + historical)
    const [wbData, whoData, sdgData, imfData, acledData, unhcrData] = await Promise.all([
      fetchAllIndicators(),
      fetchAllWHOIndicators(),
      fetchAllSDGIndicators(),
      fetchAllIMFIndicators(),
      fetchAllACLEDIndicators(),
      fetchAllUNHCRIndicators(),
    ])

    // Fetch historical data for sparklines (runs in parallel with main fetch)
    const [histWBData, histIMFData] = await Promise.allSettled([
      fetchAllHistoricalIndicators(),
      fetchAllIMFHistoricalData(),
    ])
    const allHistorical = [
      ...(histWBData.status === 'fulfilled' ? histWBData.value : []),
      ...(histIMFData.status === 'fulfilled' ? histIMFData.value : []),
    ]

    // 2. Merge into unified format for score calculation
    const allData: AllDataPoint[] = [
      ...wbData.map((d) => ({ iso3: d.iso3, indicator: d.indicator, value: d.value, source: d.source })),
      ...whoData.map((d) => ({ iso3: d.iso3, indicator: d.indicator, value: d.value, source: d.source })),
      ...sdgData.map((d) => ({ iso3: d.iso3, indicator: d.indicator, value: d.value, source: d.source })),
      ...imfData.map((d) => ({ iso3: d.iso3, indicator: d.indicator, value: d.value, source: d.source })),
      ...acledData.map((d) => ({ iso3: d.iso3, indicator: d.indicator, value: d.value, source: d.source })),
      ...unhcrData.map((d) => ({ iso3: d.iso3, indicator: d.indicator, value: d.value, source: d.source })),
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
              ?? imfData.find((d) => d.iso3 === iso3 && d.indicator === point.indicator)?.year
              ?? acledData.find((d) => d.iso3 === iso3 && d.indicator === point.indicator)?.year
              ?? unhcrData.find((d) => d.iso3 === iso3 && d.indicator === point.indicator)?.year
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

    // Upsert historical data into metrics_history for sparklines
    const historyUpserts = allHistorical.map((point) => {
      const meta = METRIC_META[point.indicator]
      if (!meta) return Promise.resolve()
      return supabase.from('metrics_history').upsert({
        country_iso3: point.iso3,
        key: point.indicator,
        value_num: point.value,
        year: point.year,
      }, { onConflict: 'country_iso3,key,year' }).then(({ error }) => {
        if (error) errors.push(`metrics_history ${point.iso3}/${point.indicator}/${point.year}: ${error.message}`)
      })
    })
    await Promise.allSettled(historyUpserts)

    return NextResponse.json({
      ok: true,
      ingested_at: new Date().toISOString(),
      countries_updated: results.length,
      metrics_history: allHistorical.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      sources: [
        'World Bank Open Data (CC BY 4.0)',
        'WHO Global Health Observatory (CC BY-NC-SA 3.0 IGO)',
        'UN SDG API (UN Open Data)',
        'IMF DataMapper (CC BY 4.0)',
        'ACLED (Armed Conflict Location & Event Data — free academic/research use)',
        'UNHCR Population Statistics (CC BY 4.0)',
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
