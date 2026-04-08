/**
 * Startup Discovery Pipeline
 *
 * 1. Fetch RSS feeds from African tech news sources
 * 2. Use Groq LLM to extract startup data from articles
 * 3. Dedup against existing startups
 * 4. Insert into startups_pending table
 */

import { createClient } from '@supabase/supabase-js'

const MVP_COUNTRIES = ['KEN', 'NGA', 'GHA', 'ZAF', 'RWA']
const MVP_SECTORS = ['fintech', 'agritech', 'healthtech']

const RSS_FEEDS = [
  { url: 'https://techcabal.com/feed/', name: 'TechCabal' },
  { url: 'https://techpoint.africa/feed/', name: 'Techpoint Africa' },
  { url: 'https://ventureburn.com/feed/', name: 'Ventureburn' },
  { url: 'https://disrupt-africa.com/feed/', name: 'Disrupt Africa' },
]

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

interface RSSItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
}

async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<RSSItem[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'AfricaImpactLab/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    // Simple XML parsing for RSS items
    const items: RSSItem[] = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)
    for (const match of itemMatches) {
      const block = match[1]
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
      const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? ''
      const desc = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/)?.[1] ?? ''
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''
      if (title && link) {
        items.push({ title: title.trim(), link: link.trim(), description: desc.replace(/<[^>]+>/g, '').trim().slice(0, 800), pubDate, source: sourceName })
      }
    }
    return items.slice(0, 20) // max 20 per feed
  } catch {
    return []
  }
}

interface ExtractedStartup {
  name: string
  country_iso3: string | null
  sector: string | null
  stage: string | null
  description: string | null
}

async function extractStartupFromArticle(item: RSSItem): Promise<ExtractedStartup | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  const prompt = `You are extracting structured data about African startups from a news article.

Article title: ${item.title}
Article excerpt: ${item.description.slice(0, 600)}

Extract if this article is about an African startup in fintech, agritech, or healthtech.
Respond with JSON only, no explanation. If no startup found, return null.

Response format:
{
  "name": "Startup name",
  "country_iso3": "KEN|NGA|GHA|ZAF|RWA or null",
  "sector": "fintech|agritech|healthtech or null",
  "stage": "pre-seed|seed|series-a|series-b+ or null",
  "description": "One sentence description from article"
}

Only extract startups from these countries: Kenya(KEN), Nigeria(NGA), Ghana(GHA), South Africa(ZAF), Rwanda(RWA).
Only extract if sector is fintech, agritech, or healthtech.
Return null if no relevant startup found.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    if (!parsed?.name || parsed?.name === null) return null
    if (!MVP_COUNTRIES.includes(parsed.country_iso3)) return null
    if (!MVP_SECTORS.includes(parsed.sector)) return null
    return parsed as ExtractedStartup
  } catch {
    return null
  }
}

export async function runStartupDiscovery(): Promise<{ discovered: number; skipped: number; errors: string[] }> {
  const sb = getSupabase()
  const errors: string[] = []
  let discovered = 0
  let skipped = 0

  // Fetch existing startup names for dedup
  const { data: existing } = await sb.from('startups').select('name')
  const { data: pending } = await sb.from('startups_pending').select('name')
  const knownNames = new Set([
    ...(existing ?? []).map((r: { name: string }) => r.name.toLowerCase()),
    ...(pending ?? []).map((r: { name: string }) => r.name.toLowerCase()),
  ])

  // Fetch and parse all RSS feeds
  const allItems: RSSItem[] = []
  for (const feed of RSS_FEEDS) {
    const items = await fetchRSSFeed(feed.url, feed.name)
    allItems.push(...items)
  }

  // Process articles sequentially (rate limit)
  for (const item of allItems) {
    try {
      const extracted = await extractStartupFromArticle(item)
      if (!extracted) { skipped++; continue }
      if (knownNames.has(extracted.name.toLowerCase())) { skipped++; continue }

      await sb.from('startups_pending').insert({
        name: extracted.name,
        country_iso3: extracted.country_iso3,
        sector: extracted.sector,
        stage: extracted.stage,
        description: extracted.description,
        source_url: item.link,
        source_name: item.source,
        article_excerpt: `${item.title} — ${item.description.slice(0, 300)}`,
        raw_json: extracted as unknown as Record<string, unknown>,
      })

      knownNames.add(extracted.name.toLowerCase())
      discovered++

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      errors.push(`${item.title}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { discovered, skipped, errors }
}
