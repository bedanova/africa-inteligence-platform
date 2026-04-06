/**
 * WHO Global Health Observatory — OData API client
 * Licence: CC BY-NC-SA 3.0 IGO — https://www.who.int/about/policies/publishing/copyright
 * Free for non-commercial use. No API key required.
 * API docs: https://www.who.int/data/gho/info/gho-odata-api
 */

const WHO_BASE = 'https://ghoapi.azureedge.net/api'

// ISO3 codes for platform countries
const COUNTRIES = ['KEN', 'NGA', 'ETH', 'GHA', 'ZAF', 'TZA', 'RWA', 'SEN']

// WHO indicator codes — from GHO catalogue
export const WHO_INDICATORS = {
  life_expectancy:    'WHOSIS_000001', // Life expectancy at birth (years)
  maternal_mortality: 'MDG_0000000026', // Maternal mortality ratio (per 100k live births)
} as const

export type WHOIndicatorKey = keyof typeof WHO_INDICATORS

export interface WHODataPoint {
  iso3: string
  indicator: WHOIndicatorKey
  value: number
  year: number
  source: 'WHO GHO'
}

async function fetchWHOIndicator(indicator: WHOIndicatorKey): Promise<WHODataPoint[]> {
  const code = WHO_INDICATORS[indicator]
  const filter = `SpatialDimType eq 'COUNTRY' and ParentLocationCode ne null`
  const url = `${WHO_BASE}/${code}?$filter=${encodeURIComponent(filter)}&$orderby=TimeDim desc`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) throw new Error(`WHO API error: ${res.status} for ${indicator}`)

  const json = await res.json()
  const rows: WHODataPoint[] = []
  const seen = new Set<string>()

  // Take most recent value per country
  for (const r of (json.value ?? [])) {
    const iso3: string = r.SpatialDim
    if (!COUNTRIES.includes(iso3)) continue
    if (seen.has(iso3)) continue
    const value = r.NumericValue
    if (value == null) continue
    seen.add(iso3)
    rows.push({
      iso3,
      indicator,
      value: Number(value),
      year: Number(r.TimeDim),
      source: 'WHO GHO',
    })
    if (seen.size === COUNTRIES.length) break
  }

  return rows
}

export async function fetchAllWHOIndicators(): Promise<WHODataPoint[]> {
  const [lifeExp, maternal] = await Promise.all([
    fetchWHOIndicator('life_expectancy'),
    fetchWHOIndicator('maternal_mortality'),
  ])
  return [...lifeExp, ...maternal]
}
