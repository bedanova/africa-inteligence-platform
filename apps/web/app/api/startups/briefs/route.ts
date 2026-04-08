import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Startup } from '@/types'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

async function generateInvestmentBrief(startups: Startup[], weekOf: string) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const startupList = startups.slice(0, 20).map(s =>
    `- ${s.name} (${s.country_iso3}, ${s.sector}, ${s.stage})${s.description ? ': ' + s.description : ''}`
  ).join('\n')

  const prompt = `You are an analyst writing a weekly investment intelligence brief about early-stage African startups.

Current startups in the database:
${startupList}

Write a concise weekly investment brief. Return JSON:
{
  "title": "Week of ${weekOf} — Africa Startup Intelligence",
  "summary": "2-3 sentence overview of the startup landscape this week",
  "bullets": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "sector_focus": "the most active sector this week",
  "sources": ["AfricaImpactLab Startup Database", "TechCabal", "Disrupt Africa"]
}

Rules: No investment advice. Focus on signals and patterns. Cite only verified information.`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

export async function runInvestmentBriefs() {
  const sb = getSupabase()
  const { data: startups, error } = await sb.from('startups').select('*').order('viability_score', { ascending: false, nullsFirst: false }).limit(50)
  if (error) throw error
  if (!startups || startups.length === 0) {
    return NextResponse.json({ ok: false, error: 'No startups in database. Run seed first.' })
  }

  const weekOf = new Date().toISOString().split('T')[0]
  const id = `week-${weekOf}`

  const brief = await generateInvestmentBrief(startups as Startup[], weekOf)

  const { error: upsertErr } = await sb.from('investment_briefs').upsert({
    id,
    title: brief.title,
    summary: brief.summary,
    bullets: brief.bullets ?? [],
    sector_focus: brief.sector_focus ?? null,
    country_iso3: null,
    week_of: weekOf,
    model_name: 'llama-3.3-70b-versatile',
    sources: brief.sources ?? [],
  }, { onConflict: 'id' })

  if (upsertErr) throw upsertErr
  return NextResponse.json({ ok: true, week_of: weekOf, brief_id: id })
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runInvestmentBriefs()
}
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runInvestmentBriefs()
}
