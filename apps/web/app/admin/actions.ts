'use server'

import { runSeed }          from '@/app/api/seed/route'
import { runIngest }        from '@/app/api/ingest/route'
import { runHistoryIngest } from '@/app/api/ingest/history/route'
import { runGenerate }      from '@/app/api/briefs/generate/route'

async function extract(res: Response): Promise<{ ok: boolean; data: unknown }> {
  try {
    const data = await res.json()
    return { ok: res.ok, data }
  } catch {
    return { ok: false, data: { error: 'Invalid response' } }
  }
}

export async function triggerSeed()    { return extract(await runSeed()) }
export async function triggerIngest()  { return extract(await runIngest()) }
export async function triggerHistory() { return extract(await runHistoryIngest()) }
export async function triggerBriefs()  { return extract(await runGenerate()) }
