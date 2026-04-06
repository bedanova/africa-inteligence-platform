/**
 * UN SDG API client
 * Licence: UN Data — free for any use with attribution
 * https://unstats.un.org/sdgs/dataContacts/
 * No API key required.
 */

const SDG_BASE = 'https://unstats.un.org/SDGAPI/v1/sdg'

// UN M.49 numeric area codes for all 20 platform countries
const COUNTRY_CODES: Record<string, number> = {
  // Eastern Africa
  KEN: 404, ETH: 231, TZA: 834, RWA: 646, UGA: 800, MOZ: 508,
  // Western Africa
  NGA: 566, GHA: 288, SEN: 686, CIV: 384, CMR: 120,
  // Southern Africa
  ZAF: 710, ZMB: 894, AGO: 24,
  // Northern Africa
  EGY: 818, MAR: 504, DZA: 12, TUN: 788,
  // Central Africa
  COD: 180,
  // Island
  MDG: 450,
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
    // dimensions can be an object or array depending on API version
    let location: string | undefined
    if (Array.isArray(r.dimensions)) {
      location = r.dimensions.find((d: { id: string; value: string }) =>
        d.id === 'Location' || d.id === 'location'
      )?.value
    } else if (r.dimensions && typeof r.dimensions === 'object') {
      location = r.dimensions.Location ?? r.dimensions.location
    }
    if (location && location !== 'All areas' && location !== 'ALLAREA' && location !== '_T') continue

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
