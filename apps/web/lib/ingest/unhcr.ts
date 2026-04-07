/**
 * UNHCR Population Statistics API client
 * UNHCR Population Statistics (CC BY 4.0) — https://www.unhcr.org/refugee-statistics
 * No API key required. Free for any use.
 */

const UNHCR_BASE = 'https://api.unhcr.org/population/v1'

// ISO3 codes — 20 platform countries
const COUNTRIES = [
  'KEN', 'NGA', 'ETH', 'GHA', 'ZAF', 'TZA', 'RWA', 'SEN', 'UGA', 'MOZ',
  'CIV', 'CMR', 'ZMB', 'AGO', 'EGY', 'MAR', 'DZA', 'TUN', 'COD', 'MDG',
] as const

export interface UNHCRDataPoint {
  iso3: string
  indicator: 'refugees_origin' | 'idps'
  value: number
  year: number
  source: 'UNHCR'
}

interface UNHCRRefugeeItem {
  year: number
  refugees:       number | null
  asylum_seekers: number | null
}

interface UNHCRIDPItem {
  year: number
  total: number | null
}

interface UNHCRRefugeeResponse {
  items: UNHCRRefugeeItem[]
}

interface UNHCRIDPResponse {
  items: UNHCRIDPItem[]
}

async function fetchRefugees(iso3: string, year: number): Promise<UNHCRDataPoint | null> {
  const url =
    `${UNHCR_BASE}/refugees/` +
    `?limit=100&page=1&yearFrom=${year}&yearTo=${year}&coo=${iso3}&cf_type=ISO`

  let res: Response
  try {
    res = await fetch(url, {
      next: { revalidate: 0 },
      headers: { Accept: 'application/json' },
    })
  } catch {
    return null
  }

  if (!res.ok) return null

  let json: UNHCRRefugeeResponse
  try {
    json = (await res.json()) as UNHCRRefugeeResponse
  } catch {
    return null
  }

  if (!json.items || json.items.length === 0) return null

  const total = json.items.reduce((sum, item) => {
    return sum + (item.refugees ?? 0) + (item.asylum_seekers ?? 0)
  }, 0)

  return { iso3, indicator: 'refugees_origin', value: total, year, source: 'UNHCR' }
}

async function fetchIDPs(iso3: string, year: number): Promise<UNHCRDataPoint | null> {
  const url =
    `${UNHCR_BASE}/idmc/` +
    `?limit=20&yearFrom=${year}&yearTo=${year}&coo=${iso3}&cf_type=ISO`

  let res: Response
  try {
    res = await fetch(url, {
      next: { revalidate: 0 },
      headers: { Accept: 'application/json' },
    })
  } catch {
    return null
  }

  if (!res.ok) return null

  let json: UNHCRIDPResponse
  try {
    json = (await res.json()) as UNHCRIDPResponse
  } catch {
    return null
  }

  if (!json.items || json.items.length === 0) return null

  const total = json.items.reduce((sum, item) => {
    return sum + (item.total ?? 0)
  }, 0)

  return { iso3, indicator: 'idps', value: total, year, source: 'UNHCR' }
}

export async function fetchAllUNHCRIndicators(): Promise<UNHCRDataPoint[]> {
  // UNHCR data lags by ~2 years
  const year = new Date().getFullYear() - 2

  const results = await Promise.allSettled(
    COUNTRIES.flatMap((iso3) => [
      fetchRefugees(iso3, year),
      fetchIDPs(iso3, year),
    ])
  )

  return results.flatMap((r) => {
    if (r.status === 'fulfilled' && r.value !== null) return [r.value]
    return []
  })
}
