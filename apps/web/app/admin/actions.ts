'use server'

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace('localhost:3000', 'localhost:3000') ?? ''

function headers() {
  return {
    Authorization: `Bearer ${process.env.CRON_SECRET ?? ''}`,
    'Content-Type': 'application/json',
  }
}

async function call(path: string): Promise<{ ok: boolean; data: unknown }> {
  try {
    const url = BASE.startsWith('http') ? `${BASE}${path}` : `https://${process.env.VERCEL_URL}${path}`
    const res = await fetch(url, { method: 'POST', headers: headers(), cache: 'no-store' })
    const data = await res.json()
    return { ok: res.ok, data }
  } catch (err) {
    return { ok: false, data: { error: String(err) } }
  }
}

export async function runSeed()    { return call('/api/seed') }
export async function runIngest()  { return call('/api/ingest') }
export async function runHistory() { return call('/api/ingest/history') }
export async function runBriefs()  { return call('/api/briefs/generate') }
