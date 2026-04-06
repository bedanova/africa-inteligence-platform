/**
 * AI Brief generation using Claude API.
 * Generates structured country and continent intelligence briefs
 * grounded in live data from World Bank, WHO, and UN SDG.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { AIBrief, AIBriefCitation, CountryMetric, CountrySummary } from '@/types'

const MODEL = 'claude-haiku-4-5-20251001'

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

// Known citation URLs per metric key
const CITATION_URLS: Record<string, { label: string; url: string; source_type: 'official_data' }> = {
  gdp_growth:         { label: 'World Bank — GDP Growth',           url: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG', source_type: 'official_data' },
  internet_access:    { label: 'World Bank — Internet Access',      url: 'https://data.worldbank.org/indicator/IT.NET.USER.ZS',    source_type: 'official_data' },
  mortality_u5:       { label: 'World Bank — Under-5 Mortality',    url: 'https://data.worldbank.org/indicator/SH.DYN.MORT',       source_type: 'official_data' },
  life_expectancy:    { label: 'WHO GHO — Life Expectancy',         url: 'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy-at-birth-(years)', source_type: 'official_data' },
  maternal_mortality: { label: 'WHO GHO — Maternal Mortality',      url: 'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/maternal-mortality-ratio-(per-100-000-live-births)', source_type: 'official_data' },
  electricity_access: { label: 'UN SDG — Electricity Access',       url: 'https://unstats.un.org/sdgs/dataportal/database',        source_type: 'official_data' },
}

function buildCitations(metrics: CountryMetric[]): AIBriefCitation[] {
  return metrics
    .filter((m) => CITATION_URLS[m.key])
    .map((m, i) => ({
      id: `c${i + 1}`,
      ...CITATION_URLS[m.key],
    }))
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

async function callClaude(prompt: string): Promise<BriefJSON> {
  const client = getClient()
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
    system: `You are an intelligence analyst for the Africa Intelligence Platform.
Generate concise, factual briefs grounded strictly in the provided data.
Never invent statistics. Cite the source for every claim.
Respond ONLY with valid JSON — no markdown, no code fences, no extra text.`,
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text) as BriefJSON
}

export async function generateCountryBrief(
  country: CountrySummary,
  metrics: CountryMetric[],
): Promise<Omit<AIBrief, 'id'>> {
  const metricsText = metricsToText(metrics)
  const { need, opportunity, stability } = country.scores

  const prompt = `Generate an intelligence brief for ${country.name} (${country.region}).

SCORES (0–100):
- Need: ${need} (humanitarian & health pressure — higher = more need)
- Opportunity: ${opportunity} (economic & connectivity — higher = more opportunity)
- Stability: ${stability} (governance & peace — higher = more stable)

VERIFIED DATA INDICATORS:
${metricsText || 'No indicators available yet.'}

Return this exact JSON structure:
{
  "title": "string — one compelling sentence, max 12 words",
  "summary": "string — 2-3 sentences synthesis of the country's current situation",
  "bullets": ["string", "string", "string"],
  "risk_flags": ["string"],
  "confidence": 0.0-1.0
}

Rules:
- bullets: exactly 3 key insights grounded in the data above
- risk_flags: 1-2 items only if data shows genuine concern (high mortality, low stability, etc.), otherwise empty array
- confidence: 0.9 if all key indicators present, 0.7 if partial data, 0.5 if no indicators`

  const result = await callClaude(prompt)
  const citations = buildCitations(metrics)

  return {
    title: result.title,
    summary: result.summary,
    bullets: result.bullets,
    risk_flags: result.risk_flags,
    citations,
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
  const avgOpp = Math.round(countries.reduce((s, c) => s + c.scores.opportunity, 0) / countries.length)
  const avgStab = Math.round(countries.reduce((s, c) => s + c.scores.stability, 0) / countries.length)

  const topNeed = [...countries].sort((a, b) => b.scores.need - a.scores.need)[0]
  const topOpp  = [...countries].sort((a, b) => b.scores.opportunity - a.scores.opportunity)[0]

  const prompt = `Generate an Africa-wide intelligence overview brief.

PLATFORM COUNTRIES: ${countries.map((c) => c.name).join(', ')}

AVERAGE SCORES ACROSS ALL 8 COUNTRIES (0–100):
- Need: ${avgNeed}
- Opportunity: ${avgOpp}
- Stability: ${avgStab}

HIGHLIGHTS:
- Highest need: ${topNeed.name} (${topNeed.scores.need})
- Top opportunity: ${topOpp.name} (${topOpp.scores.opportunity})

DATA SOURCES: World Bank Open Data, WHO Global Health Observatory, UN SDG API

Return this exact JSON structure:
{
  "title": "string — one headline for Africa today, max 12 words",
  "summary": "string — 2-3 sentences continental synthesis",
  "bullets": ["string", "string", "string"],
  "risk_flags": ["string"],
  "confidence": 0.75
}

Rules:
- bullets: 3 cross-country insights or trends
- risk_flags: 0-2 items max, only genuine concerns
- Keep it factual and grounded in the scores above`

  const result = await callClaude(prompt)

  return {
    title: result.title,
    summary: result.summary,
    bullets: result.bullets,
    risk_flags: result.risk_flags,
    citations: [
      { id: 'c1', label: 'World Bank Open Data', url: 'https://data.worldbank.org', source_type: 'official_data' },
      { id: 'c2', label: 'WHO Global Health Observatory', url: 'https://www.who.int/data/gho', source_type: 'official_data' },
      { id: 'c3', label: 'UN SDG Database', url: 'https://unstats.un.org/sdgs/dataportal', source_type: 'official_data' },
    ],
    scope: 'continent',
    freshness: 'fresh',
    generated_at: new Date().toISOString(),
    model_name: MODEL,
    confidence: result.confidence,
  }
}
