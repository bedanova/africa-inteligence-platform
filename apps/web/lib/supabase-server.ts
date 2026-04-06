import { createClient } from '@supabase/supabase-js'
import type { CountrySummary, CountryMetric, ActionCard, AIBrief } from '@/types'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ── helpers ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCountry(row: any): CountrySummary {
  return {
    iso3: row.iso3,
    name: row.name,
    region: row.region,
    flag_emoji: row.flag_emoji,
    freshness: row.freshness,
    scores: {
      need: row.score_need,
      opportunity: row.score_opportunity,
      stability: row.score_stability,
      updated_at: row.updated_at,
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMetric(row: any): CountryMetric {
  return {
    key: row.key,
    label: row.label,
    value: row.value_num ?? row.value_text,
    unit: row.unit ?? undefined,
    trend: row.trend ?? undefined,
    source: row.source,
    source_year: row.source_year,
    freshness: row.freshness,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAction(row: any): ActionCard {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    org_name: row.org_name,
    org_id: row.org_id,
    org_verification_tier: row.org_verification_tier,
    country_iso3: row.country_iso3 ?? undefined,
    url: row.url,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBrief(row: any): AIBrief {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    bullets: row.bullets ?? [],
    risk_flags: row.risk_flags ?? [],
    citations: row.citations ?? [],
    scope: row.scope,
    country_iso3: row.country_iso3 ?? undefined,
    freshness: row.freshness,
    generated_at: row.generated_at,
    model_name: row.model_name,
    confidence: Number(row.confidence),
  }
}

// ── queries ────────────────────────────────────────────────────────────────────

export async function getCountries(region?: string): Promise<CountrySummary[]> {
  let query = getClient().from('countries').select('*').order('name')
  if (region) query = query.eq('region', region)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(rowToCountry)
}

export async function getCountry(iso3: string): Promise<CountrySummary | null> {
  const { data, error } = await getClient()
    .from('countries')
    .select('*')
    .eq('iso3', iso3)
    .single()
  if (error) return null
  return rowToCountry(data)
}

export async function getMetrics(iso3: string): Promise<CountryMetric[]> {
  const { data, error } = await getClient()
    .from('metrics')
    .select('*')
    .eq('country_iso3', iso3)
  if (error) return []
  return (data ?? []).map(rowToMetric)
}

export async function getSectors(iso3: string): Promise<string[]> {
  const { data, error } = await getClient()
    .from('sectors')
    .select('name')
    .eq('country_iso3', iso3)
    .order('sort_order')
  if (error) return []
  return (data ?? []).map((r) => r.name)
}

export async function getActions(iso3: string): Promise<ActionCard[]> {
  const { data, error } = await getClient()
    .from('actions')
    .select('*')
    .eq('country_iso3', iso3)
  if (error) return []
  return (data ?? []).map(rowToAction)
}

export async function getBriefs(iso3?: string): Promise<AIBrief[]> {
  let query = getClient().from('briefs').select('*').order('generated_at', { ascending: false })
  if (iso3) query = query.eq('country_iso3', iso3)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(rowToBrief)
}

export async function getCountryBriefFromDb(iso3: string): Promise<AIBrief | null> {
  const { data, error } = await getClient()
    .from('briefs')
    .select('*')
    .eq('country_iso3', iso3)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return rowToBrief(data)
}
