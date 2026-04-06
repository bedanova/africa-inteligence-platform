import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Organization } from '@/types'

const getClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const MOCK_ORGS: Organization[] = [
  { id: 'org-wateraid', name: 'WaterAid Africa', website: 'https://www.wateraid.org', mission: 'Universal access to clean water, decent toilets and good hygiene across Africa.', countries: ['KEN','ETH','TZA','GHA','SEN'], sectors: ['WASH','Health'], sdg_tags: [3,6], verification_tier: 'A', last_reviewed_at: '2026-02-01', action_types: ['donate','volunteer'] },
  { id: 'org-afrimapper', name: 'AfriMapper', website: 'https://afrimapper.org', mission: 'Open geospatial data for development — mapping health, water and food security across East Africa.', countries: ['KEN','ETH','TZA'], sectors: ['Health','WASH','Food Security'], sdg_tags: [2,3,6], verification_tier: 'B', last_reviewed_at: '2026-01-15', action_types: ['volunteer','learn'] },
  { id: 'org-enza', name: 'Enza Capital', website: 'https://enzacapital.com', mission: 'Seed-stage venture capital investing in climate-smart agri-tech and fintech across East Africa.', countries: ['KEN','TZA','RWA'], sectors: ['Agri-tech','Fintech'], sdg_tags: [1,2,13], verification_tier: 'A', last_reviewed_at: '2026-03-01', action_types: ['invest'] },
  { id: 'org-egn', name: 'Educate Girls Nigeria', website: 'https://educategirlsnigeria.org', mission: 'Keeping girls in secondary school across Northern Nigeria through scholarships and community engagement.', countries: ['NGA'], sectors: ['Education'], sdg_tags: [4,5], verification_tier: 'A', last_reviewed_at: '2026-01-20', action_types: ['donate'] },
  { id: 'org-epra', name: 'Energy Policy Research Africa', website: 'https://eprafrica.org', mission: 'Independent research and advocacy on energy access, transition and policy across Sub-Saharan Africa.', countries: ['NGA','GHA','ZAF','SEN','ETH'], sectors: ['Energy Access','Renewable Energy'], sdg_tags: [7,13], verification_tier: 'B', last_reviewed_at: '2025-12-10', action_types: ['learn','donate'] },
  { id: 'org-amref', name: 'Amref Health Africa', website: 'https://amref.org', mission: 'Strengthening health systems and enabling communities to access quality, affordable healthcare.', countries: ['KEN','ETH','TZA','ZAF','SEN'], sectors: ['Health'], sdg_tags: [3], verification_tier: 'A', last_reviewed_at: '2026-02-15', action_types: ['donate','volunteer'] },
  { id: 'org-gsbi', name: 'Global Startup Bridge Initiative', website: 'https://gsbi.africa', mission: 'Connecting African founders with global investors and mentors to scale impact-first startups.', countries: ['KEN','NGA','GHA','RWA','SEN'], sectors: ['Fintech','Digital Economy'], sdg_tags: [8,9,17], verification_tier: 'B', last_reviewed_at: '2026-03-10', action_types: ['invest','learn'] },
  { id: 'org-solarsister', name: 'Solar Sister', website: 'https://solarsister.org', mission: 'Training women entrepreneurs to bring solar energy to last-mile communities across East Africa.', countries: ['TZA','NGA','ETH'], sectors: ['Renewable Energy'], sdg_tags: [5,7,13], verification_tier: 'A', last_reviewed_at: '2026-01-05', action_types: ['donate','invest'] },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const actionType = searchParams.get('action') ?? undefined

  try {
    let query = getClient().from('organizations').select('*').order('name')
    const { data, error } = await query
    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orgs: Organization[] = (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      website: row.website ?? undefined,
      mission: row.mission,
      countries: row.countries ?? [],
      sectors: row.sectors ?? [],
      sdg_tags: row.sdg_tags ?? [],
      verification_tier: row.verification_tier,
      last_reviewed_at: row.last_reviewed_at,
      action_types: row.action_types ?? [],
      logo_url: row.logo_url ?? undefined,
    }))

    if (actionType) {
      orgs = orgs.filter((o) => o.action_types.includes(actionType as Organization['action_types'][number]))
    }

    return NextResponse.json({
      data: orgs,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: orgs.length, cache_status: 'MISS' },
    })
  } catch {
    let orgs = MOCK_ORGS
    if (actionType) {
      orgs = orgs.filter((o) => o.action_types.includes(actionType as Organization['action_types'][number]))
    }
    return NextResponse.json({
      data: orgs,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: orgs.length, cache_status: 'MISS' },
    })
  }
}
