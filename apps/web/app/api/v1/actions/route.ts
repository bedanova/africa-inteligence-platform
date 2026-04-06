import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { ActionCard } from '@/types'
import { MOCK_ACTIONS } from '@/lib/mock-data'

const getClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const actionType = searchParams.get('type') ?? undefined

  try {
    let query = getClient().from('actions').select('*').order('type')
    if (actionType) query = query.eq('type', actionType)
    const { data, error } = await query
    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actions: ActionCard[] = (data ?? []).map((row: any) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description ?? undefined,
      org_name: row.org_name,
      org_id: row.org_id,
      org_verification_tier: row.org_verification_tier,
      country_iso3: row.country_iso3 ?? undefined,
      url: row.url,
    }))

    return NextResponse.json({
      data: actions,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: actions.length, cache_status: 'MISS' },
    })
  } catch {
    const allActions: ActionCard[] = Object.values(MOCK_ACTIONS).flat()
    const filtered = actionType ? allActions.filter((a) => a.type === actionType) : allActions
    return NextResponse.json({
      data: filtered,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: filtered.length, cache_status: 'MISS' },
    })
  }
}
