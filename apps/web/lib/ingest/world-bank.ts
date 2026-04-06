/**
 * World Bank Open Data API client
 * Licence: CC BY 4.0 — https://datacatalog.worldbank.org/public-licenses
 * No API key required. Free for any use.
 */

const WB_BASE = 'https://api.worldbank.org/v2'

// ISO3 codes for the 8 platform countries
const COUNTRIES = ['KEN', 'NGA', 'ETH', 'GHA', 'ZAF', 'TZA', 'RWA', 'SEN']
const COUNTRY_LIST = COUNTRIES.join(';')

// World Bank indicator codes — all from official WB Open Data catalogue
export const INDICATORS = {
  gdp_growth:     'NY.GDP.MKTP.KD.ZG', // GDP growth (annual %)
  internet_access: 'IT.NET.USER.ZS',    // Internet users (% of population)
  mortality_u5:   'SH.DYN.MORT',        // Mortality rate, under-5 (per 1,000 live births)
} as const

export type IndicatorKey = keyof typeof INDICATORS

export interface WBDataPoint {
  iso3: string
  countryName: string
  indicator: IndicatorKey
  value: number
  year: number
  source: 'World Bank'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseResponse(rows: any[], indicator: IndicatorKey): WBDataPoint[] {
  return rows
    .filter((r) => r.value !== null && r.countryiso3code && COUNTRIES.includes(r.countryiso3code))
    .map((r) => ({
      iso3: r.countryiso3code,
      countryName: r.country.value,
      indicator,
      value: Number(r.value),
      year: Number(r.date),
      source: 'World Bank' as const,
    }))
}

async function fetchIndicator(indicator: IndicatorKey): Promise<WBDataPoint[]> {
  const url =
    `${WB_BASE}/country/${COUNTRY_LIST}/indicator/${INDICATORS[indicator]}` +
    `?format=json&mrv=1&per_page=20`

  const res = await fetch(url, {
    next: { revalidate: 0 }, // never cache — always fresh from ingest
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`World Bank API error: ${res.status} for indicator ${indicator}`)
  }

  const json = await res.json()
  // WB API returns [metadata, dataArray]
  const rows = Array.isArray(json) && json.length > 1 ? json[1] : []
  return parseResponse(rows, indicator)
}

export async function fetchAllIndicators(): Promise<WBDataPoint[]> {
  const [gdp, internet, mortality] = await Promise.all([
    fetchIndicator('gdp_growth'),
    fetchIndicator('internet_access'),
    fetchIndicator('mortality_u5'),
  ])
  return [...gdp, ...internet, ...mortality]
}

/**
 * All data points from all sources combined for score calculation.
 */
export interface AllDataPoint {
  iso3: string
  indicator: string
  value: number
  source: string
}

/**
 * Calculate composite scores from live indicators across World Bank, WHO, and UN SDG.
 * Formulas v1.1 — multi-source weighted composite.
 *
 * Need (0–100, higher = more need):
 *   - Under-5 mortality (World Bank) — 50% weight
 *   - Maternal mortality (WHO) — 30% weight
 *   - Life expectancy inverse (WHO) — 20% weight
 *
 * Opportunity (0–100, higher = more opportunity):
 *   - GDP growth (World Bank) — 30% weight
 *   - Internet access (World Bank) — 35% weight
 *   - Electricity access (UN SDG) — 35% weight
 *
 * Stability: no suitable free live API — preserved from DB.
 */
export function calculateScores(
  data: AllDataPoint[],
  iso3: string,
  currentStability: number,
): { need: number; opportunity: number; stability: number } {
  const get = (ind: string) => data.find((d) => d.iso3 === iso3 && d.indicator === ind)?.value

  // Need components
  const mortality = get('mortality_u5')      // WB: per 1k, range ~20–150
  const maternal  = get('maternal_mortality') // WHO: per 100k, range ~100–2000
  const lifeExp   = get('life_expectancy')    // WHO: years, range ~50–80

  // Opportunity components
  const gdpGrowth    = get('gdp_growth')        // WB: %, range -5 to +15
  const internet     = get('internet_access')   // WB: %, range 0–100
  const electricity  = get('electricity_access')// UN SDG: %, range 0–100

  // Need score — normalise each component to 0–100
  const needComponents: number[] = []
  if (mortality  != null) needComponents.push({ w: 0.5, v: Math.min(100, mortality * 1.0) }.w * Math.min(100, mortality * 1.0))
  if (maternal   != null) needComponents.push(0.3 * Math.min(100, maternal / 20))
  if (lifeExp    != null) needComponents.push(0.2 * Math.max(0, 100 - (lifeExp - 40) * 1.67))
  const need = needComponents.length > 0
    ? Math.min(100, Math.max(0, Math.round(needComponents.reduce((a, b) => a + b, 0))))
    : null

  // Opportunity score
  const oppComponents: number[] = []
  if (gdpGrowth   != null) oppComponents.push(0.30 * Math.min(100, Math.max(0, gdpGrowth * 6 + 30)))
  if (internet    != null) oppComponents.push(0.35 * internet)
  if (electricity != null) oppComponents.push(0.35 * electricity)
  const opportunity = oppComponents.length > 0
    ? Math.min(100, Math.max(0, Math.round(oppComponents.reduce((a, b) => a + b, 0))))
    : null

  return {
    need: need ?? 50,
    opportunity: opportunity ?? 50,
    stability: currentStability,
  }
}
