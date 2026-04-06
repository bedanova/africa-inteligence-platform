/**
 * AI Brief generation using Groq API (free tier).
 * Free tier: 14,400 requests/day — more than sufficient for 9 daily briefs.
 * API key: https://console.groq.com (no credit card required, works in EU)
 */

import Groq from 'groq-sdk'
import type { AIBrief, AIBriefCitation, CountryMetric, CountrySummary } from '@/types'

const MODEL = 'llama-3.1-8b-instant'

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

const CITATION_URLS: Record<string, { label: string; url: string; source_type: 'official_data' }> = {
  gdp_growth:         { label: 'World Bank — GDP Growth',        url: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG', source_type: 'official_data' },
  internet_access:    { label: 'World Bank — Internet Access',   url: 'https://data.worldbank.org/indicator/IT.NET.USER.ZS',    source_type: 'official_data' },
  mortality_u5:       { label: 'World Bank — Under-5 Mortality', url: 'https://data.worldbank.org/indicator/SH.DYN.MORT',       source_type: 'official_data' },
  life_expectancy:    { label: 'WHO GHO — Life Expectancy',      url: 'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy-at-birth-(years)', source_type: 'official_data' },
  maternal_mortality: { label: 'WHO GHO — Maternal Mortality',   url: 'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/maternal-mortality-ratio-(per-100-000-live-births)', source_type: 'official_data' },
  electricity_access: { label: 'UN SDG — Electricity Access',    url: 'https://unstats.un.org/sdgs/dataportal/database',        source_type: 'official_data' },
}

function buildCitations(metrics: CountryMetric[]): AIBriefCitation[] {
  return metrics
    .filter((m) => CITATION_URLS[m.key])
    .map((m, i) => ({ id: `c${i + 1}`, ...CITATION_URLS[m.key] }))
}

function metricsToText(metrics: CountryMetric[]): string {
  return metrics
    .map((m) => `- ${m.label}: ${m.value}${m.unit ? ' ' + m.unit : ''} (${m.source}, ${m.source_year})`)
    .join('\n')
}

interface BriefJSON {
  title: string
  summary: string
  bullets: string[]
  risk_flags: string[]
  confidence: number
}

async function callGroq(prompt: string): Promise<BriefJSON> {
  const client = getClient()
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an intelligence analyst for the Africa Intelligence Platform.
Generate concise, factual briefs grounded strictly in the provided data.
Never invent statistics. Respond ONLY with valid JSON — no markdown, no code fences, no extra text.`,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 600,
  })

  const text = completion.choices[0]?.message?.content ?? ''
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(clean) as BriefJSON
}

export async function generateCountryBrief(
  country: CountrySummary,
  metrics: CountryMetric[],
): Promise<Omit<AIBrief, 'id'>> {
  const { need, opportunity, stability } = country.scores

  const prompt = `Generate an intelligence brief for ${country.name} (${country.region}).

SCORES (0–100):
- Need: ${need} (humanitarian & health pressure)
- Opportunity: ${opportunity} (economic & connectivity)
- Stability: ${stability} (governance & peace)

VERIFIED DATA INDICATORS:
${metricsToText(metrics) || 'No indicators available yet.'}

Return this exact JSON:
{
  "title": "one compelling sentence, max 12 words",
  "summary": "2-3 sentences synthesis of the country current situation",
  "bullets": ["insight 1", "insight 2", "insight 3"],
  "risk_flags": [],
  "confidence": 0.8
}

Rules: bullets must be grounded in the data above. risk_flags: 1-2 items only if data shows genuine concern, otherwise empty array.`

  const result = await callGroq(prompt)

  return {
    title: result.title,
    summary: result.summary,
    bullets: result.bullets,
    risk_flags: result.risk_flags,
    citations: buildCitations(metrics),
    scope: 'country',
    country_iso3: country.iso3,
    freshness: 'fresh',
    generated_at: new Date().toISOString(),
    model_name: MODEL,
    confidence: result.confidence,
  }
}

export async function generateContinentBrief(
  countries: CountrySummary[],
): Promise<Omit<AIBrief, 'id'>> {
  const avgNeed = Math.round(countries.reduce((s, c) => s + c.scores.need, 0) / countries.length)
  const avgOpp  = Math.round(countries.reduce((s, c) => s + c.scores.opportunity, 0) / countries.length)
  const avgStab = Math.round(countries.reduce((s, c) => s + c.scores.stability, 0) / countries.length)
  const topNeed = [...countries].sort((a, b) => b.scores.need - a.scores.need)[0]
  const topOpp  = [...countries].sort((a, b) => b.scores.opportunity - a.scores.opportunity)[0]

  const prompt = `Generate an Africa-wide intelligence overview brief.

COUNTRIES: ${countries.map((c) => c.name).join(', ')}
AVERAGE SCORES: Need ${avgNeed}, Opportunity ${avgOpp}, Stability ${avgStab}
HIGHLIGHTS: Highest need: ${topNeed.name} (${topNeed.scores.need}), Top opportunity: ${topOpp.name} (${topOpp.scores.opportunity})
SOURCES: World Bank, WHO, UN SDG

Return this exact JSON:
{
  "title": "one headline for Africa today, max 12 words",
  "summary": "2-3 sentences continental synthesis",
  "bullets": ["trend 1", "trend 2", "trend 3"],
  "risk_flags": [],
  "confidence": 0.75
}`

  const result = await callGroq(prompt)

  return {
    title: result.title,
    summary: result.summary,
    bullets: result.bullets,
    risk_flags: result.risk_flags,
    citations: [
      { id: 'c1', label: 'World Bank Open Data',          url: 'https://data.worldbank.org',              source_type: 'official_data' },
      { id: 'c2', label: 'WHO Global Health Observatory', url: 'https://www.who.int/data/gho',             source_type: 'official_data' },
      { id: 'c3', label: 'UN SDG Database',               url: 'https://unstats.un.org/sdgs/dataportal',  source_type: 'official_data' },
    ],
    scope: 'continent',
    freshness: 'fresh',
    generated_at: new Date().toISOString(),
    model_name: MODEL,
    confidence: result.confidence,
  }
}
