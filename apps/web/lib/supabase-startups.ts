import { createClient } from '@supabase/supabase-js'
import type { Startup, StartupPending, InvestmentBrief } from '@/types'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function getStartups(filters?: {
  country_iso3?: string
  sector?: string
  stage?: string
}): Promise<Startup[]> {
  const sb = getSupabase()
  let q = sb.from('startups').select('*').order('viability_score', { ascending: false, nullsFirst: false })
  if (filters?.country_iso3) q = q.eq('country_iso3', filters.country_iso3)
  if (filters?.sector) q = q.eq('sector', filters.sector)
  if (filters?.stage) q = q.eq('stage', filters.stage)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Startup[]
}

export async function getPendingStartups(): Promise<StartupPending[]> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('startups_pending')
    .select('*')
    .eq('status', 'pending')
    .order('extracted_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as StartupPending[]
}

export async function approveStartupFromPending(pendingId: number): Promise<void> {
  const sb = getSupabase()
  const { data: pending, error: fetchErr } = await sb
    .from('startups_pending')
    .select('*')
    .eq('id', pendingId)
    .single()
  if (fetchErr || !pending) throw fetchErr ?? new Error('Not found')

  // Build startup record from pending
  const slug = pending.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const startup = {
    id: slug,
    name: pending.name,
    country_iso3: pending.country_iso3 ?? 'UNK',
    sector: pending.sector ?? 'other',
    stage: pending.stage ?? 'seed',
    description: pending.description,
    source_url: pending.source_url,
    source_name: pending.source_name,
    article_excerpt: pending.article_excerpt,
    verification_tier: 'C',
    sdg_tags: [],
    impact_tags: [],
  }

  const { error: insertErr } = await sb.from('startups').upsert(startup, { onConflict: 'id' })
  if (insertErr) throw insertErr

  await sb.from('startups_pending').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', pendingId)
}

export async function rejectStartupPending(pendingId: number): Promise<void> {
  const sb = getSupabase()
  await sb.from('startups_pending').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', pendingId)
}

export async function getStartup(id: string): Promise<Startup | null> {
  const sb = getSupabase()
  const { data, error } = await sb.from('startups').select('*').eq('id', id).single()
  if (error) return null
  return data as Startup
}

export async function getLatestInvestmentBriefs(limit = 5): Promise<InvestmentBrief[]> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('investment_briefs')
    .select('*')
    .order('week_of', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as InvestmentBrief[]
}
