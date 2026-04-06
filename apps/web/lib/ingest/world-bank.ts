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
 * Calculate composite scores from live indicators.
 * Formulas are v1.0 — will be refined as more sources are added.
 *
 * Need (0–100, higher = more need):
 *   Driven by under-5 mortality as primary proxy for humanitarian burden.
 *   mortality range for SSA: ~20 (ZAF) to ~100+ (high-burden countries)
 *
 * Opportunity (0–100, higher = more opportunity):
 *   GDP growth trajectory + internet/connectivity penetration.
 *
 * Stability: not recalculated here — no suitable free live API.
 */
export function calculateScores(
  data: WBDataPoint[],
  iso3: string,
  currentStability: number,
): { need: number; opportunity: number; stability: number } {
  const get = (ind: IndicatorKey) => data.find((d) => d.iso3 === iso3 && d.indicator === ind)?.value

  const mortality = get('mortality_u5')
  const gdpGrowth = get('gdp_growth')
  const internet = get('internet_access')

  const need =
    mortality != null
      ? Math.min(100, Math.max(0, Math.round(mortality * 0.9 + 10)))
      : null

  const opportunity =
    gdpGrowth != null && internet != null
      ? Math.min(100, Math.max(0, Math.round(internet * 0.35 + Math.max(gdpGrowth, 0) * 3.5 + 25)))
      : null

  return {
    need: need ?? 50,
    opportunity: opportunity ?? 50,
    stability: currentStability, // preserved — no live source yet
  }
}
