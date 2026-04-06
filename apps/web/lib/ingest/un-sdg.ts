/**
 * UN SDG API client
 * Licence: UN Data — free for any use with attribution
 * https://unstats.un.org/sdgs/dataContacts/
 * No API key required.
 */

const SDG_BASE = 'https://unstats.un.org/SDGAPI/v1/sdg'

// UN M.49 numeric area codes for platform countries
const COUNTRY_CODES: Record<string, number> = {
  KEN: 404,
  NGA: 566,
  ETH: 231,
  GHA: 288,
  ZAF: 710,
  TZA: 834,
  RWA: 646,
  SEN: 686,
}

// SDG indicator codes — total/all-areas series only
export const SDG_INDICATORS = {
  electricity_access: { indicator: '7.1.1', series: 'EG_ACS_ELEC' }, // % pop with electricity
} as const

export type SDGIndicatorKey = keyof typeof SDG_INDICATORS

export interface SDGDataPoint {
  iso3: string
  indicator: SDGIndicatorKey
  value: number
  year: number
  source: 'UN SDG'
}

async function fetchSDGIndicator(key: SDGIndicatorKey): Promise<SDGDataPoint[]> {
  const { indicator, series } = SDG_INDICATORS[key]
  const areaCodes = Object.values(COUNTRY_CODES).join(',')

  const url =
    `${SDG_BASE}/Indicator/Data` +
    `?indicator=${indicator}&series=${series}` +
    `&areaCode=${areaCodes}&timePeriodStart=2010&timePeriodEnd=2025&pageSize=200`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) throw new Error(`UN SDG API error: ${res.status} for ${key}`)

  const json = await res.json()
  const rows: SDGDataPoint[] = []
  const seen = new Map<string, number>() // iso3 → most recent year

  const iso3ByCode = Object.fromEntries(
    Object.entries(COUNTRY_CODES).map(([iso3, code]) => [code, iso3])
  )

  for (const r of (json.data ?? [])) {
    const iso3 = iso3ByCode[r.geoAreaCode]
    if (!iso3) continue

    // Filter for national total only (skip urban/rural breakdowns)
    const location = r.dimensions?.Location ?? r.dimensions?.location
    if (location && location !== 'All areas' && location !== 'ALLAREA') continue

    const value = parseFloat(r.value)
    if (isNaN(value)) continue
    const year = Math.round(r.timePeriodStart)

    // Keep only most recent year per country
    if (!seen.has(iso3) || year > seen.get(iso3)!) {
      seen.set(iso3, year)
      const existing = rows.findIndex((d) => d.iso3 === iso3)
      const point: SDGDataPoint = { iso3, indicator: key, value, year, source: 'UN SDG' }
      if (existing >= 0) rows[existing] = point
      else rows.push(point)
    }
  }

  return rows
}

export async function fetchAllSDGIndicators(): Promise<SDGDataPoint[]> {
  const electricity = await fetchSDGIndicator('electricity_access')
  return electricity
}
