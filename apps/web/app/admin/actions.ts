'use server'

import { runSeed }             from '@/app/api/seed/route'
import { runIngest }           from '@/app/api/ingest/route'
import { runHistoryIngest }    from '@/app/api/ingest/history/route'
import { runGenerate }         from '@/app/api/briefs/generate/route'
import { runStartupSeed }      from '@/app/api/seed/startups/route'
import { runDiscover }         from '@/app/api/startups/discover/route'
import { runInvestmentBriefs } from '@/app/api/startups/briefs/route'
import { approveStartupFromPending, rejectStartupPending } from '@/lib/supabase-startups'

async function extract(res: Response): Promise<{ ok: boolean; data: unknown }> {
  try {
    const data = await res.json()
    return { ok: res.ok, data }
  } catch {
    return { ok: false, data: { error: 'Invalid response' } }
  }
}

export async function triggerSeed()           { return extract(await runSeed()) }
export async function triggerIngest()         { return extract(await runIngest()) }
export async function triggerHistory()        { return extract(await runHistoryIngest()) }
export async function triggerBriefs()         { return extract(await runGenerate()) }
export async function triggerStartupSeed()    { return extract(await runStartupSeed()) }
export async function triggerDiscover() {
  try {
    const result = await runDiscover()
    return { ok: true, data: result }
  } catch (err) {
    return { ok: false, data: { error: err instanceof Error ? err.message : String(err) } }
  }
}
export async function triggerInvestBriefs()   { return extract(await runInvestmentBriefs()) }

export async function approveStartup(id: number): Promise<{ ok: boolean; error?: string }> {
  try {
    await approveStartupFromPending(id)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function rejectStartup(id: number): Promise<{ ok: boolean; error?: string }> {
  try {
    await rejectStartupPending(id)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
