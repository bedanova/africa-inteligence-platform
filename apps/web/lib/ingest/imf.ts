/**
 * IMF DataMapper API client
 * IMF Data (CC BY 4.0) — https://www.imf.org/external/datamapper/
 * No API key required. Free for any use.
 */

const IMF_BASE = 'https://www.imf.org/external/datamapper/api/v1'

// ISO3 codes — 20 platform countries
const COUNTRIES = [
  'KEN', 'NGA', 'ETH', 'GHA', 'ZAF', 'TZA', 'RWA', 'SEN', 'UGA', 'MOZ',
  'CIV', 'CMR', 'ZMB', 'AGO', 'EGY', 'MAR', 'DZA', 'TUN', 'COD', 'MDG',
] as const

type IMFCountry = typeof COUNTRIES[number]

const COUNTRY_LIST = COUNTRIES.join('/')

// IMF indicator codes
const INDICATORS = {
  govt_debt:       'GGXWDG_NGDP', // General government gross debt (% GDP)
  current_account: 'BCA_NGDPD',   // Current account balance (% GDP)
} as const

type IMFIndicatorKey = keyof typeof INDICATORS

export interface IMFDataPoint {
  iso3: string
  indicator: IMFIndicatorKey
  value: number
  year: number
  source: 'IMF DataMapper'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseResponse(json: any, indicator: IMFIndicatorKey): IMFDataPoint[] {
  const indicatorCode = INDICATORS[indicator]
  const countryData = json?.values?.[indicatorCode]
  if (!countryData || typeof countryData !== 'object') return []

  const results: IMFDataPoint[] = []

  for (const iso3 of COUNTRIES) {
    const yearMap = countryData[iso3 as IMFCountry]
    if (!yearMap || typeof yearMap !== 'object') continue

    // Find the most recent year with a non-null value
    const years = Object.keys(yearMap)
      .map(Number)
      .filter((y) => yearMap[String(y)] !== null && yearMap[String(y)] !== undefined)
      .sort((a, b) => b - a)

    if (years.length === 0) continue

    const latestYear = years[0]
    const value = yearMap[String(latestYear)]

    if (typeof value !== 'number') continue

    results.push({
      iso3,
      indicator,
      value,
      year: latestYear,
      source: 'IMF DataMapper',
    })
  }

  return results
}

async function fetchIMFIndicator(indicator: IMFIndicatorKey): Promise<IMFDataPoint[]> {
  const url = `${IMF_BASE}/${INDICATORS[indicator]}/${COUNTRY_LIST}`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`IMF DataMapper API error: ${res.status} for indicator ${indicator}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json()
  return parseResponse(json, indicator)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseHistoricalResponse(json: any, indicator: IMFIndicatorKey): IMFDataPoint[] {
  const indicatorCode = INDICATORS[indicator]
  const countryData = json?.values?.[indicatorCode]
  if (!countryData || typeof countryData !== 'object') return []

  const results: IMFDataPoint[] = []
  const currentYear = new Date().getFullYear()
  const cutoffYear = currentYear - 10

  for (const iso3 of COUNTRIES) {
    const yearMap = countryData[iso3 as IMFCountry]
    if (!yearMap || typeof yearMap !== 'object') continue

    for (const yearStr of Object.keys(yearMap)) {
      const year = Number(yearStr)
      if (isNaN(year) || year < cutoffYear) continue
      const value = yearMap[yearStr]
      if (value === null || value === undefined || typeof value !== 'number') continue
      results.push({
        iso3,
        indicator,
        value,
        year,
        source: 'IMF DataMapper',
      })
    }
  }

  return results
}

async function fetchIMFIndicatorHistory(indicator: IMFIndicatorKey): Promise<IMFDataPoint[]> {
  const url = `${IMF_BASE}/${INDICATORS[indicator]}/${COUNTRY_LIST}`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`IMF DataMapper API error: ${res.status} for indicator ${indicator}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json()
  return parseHistoricalResponse(json, indicator)
}

export async function fetchAllIMFHistoricalData(): Promise<IMFDataPoint[]> {
  const results = await Promise.allSettled([
    fetchIMFIndicatorHistory('govt_debt'),
    fetchIMFIndicatorHistory('current_account'),
  ])

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}

export async function fetchAllIMFIndicators(): Promise<IMFDataPoint[]> {
  const results = await Promise.allSettled([
    fetchIMFIndicator('govt_debt'),
    fetchIMFIndicator('current_account'),
  ])

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}
