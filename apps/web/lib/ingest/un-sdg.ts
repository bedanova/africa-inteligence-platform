/**
 * UN SDG API client
 * Licence: UN Data — free for any use with attribution
 * https://unstats.un.org/sdgs/dataContacts/
 * No API key required.
 */

const SDG_BASE = 'https://unstats.un.org/SDGAPI/v1/sdg'

const COUNTRY_CODES: Record<string, number> = {
  KEN: 404, ETH: 231, TZA: 834, RWA: 646, UGA: 800, MOZ: 508,
  NGA: 566, GHA: 288, SEN: 686, CIV: 384, CMR: 120,
  ZAF: 710, ZMB: 894, AGO: 24,
  EGY: 818, MAR: 504, DZA: 12, TUN: 788,
  COD: 180, MDG: 450,
}

interface SDGIndicatorDef {
  indicator: string
  series: string
  // Optional: require these dimension values (key → required value) to filter for totals
  requiredDims?: Record<string, string>
}

const SDG_INDICATORS: Record<string, SDGIndicatorDef> = {
  electricity_access: {
    indicator: '7.1.1', series: 'EG_ACS_ELEC',
  },
  food_insecurity: {
    indicator: '2.1.2', series: 'AG_PRD_FIESMSN',
    // Prevalence of moderate or severe food insecurity (%) — total population
  },
  conflict_deaths: {
    indicator: '16.1.2', series: 'VC_DTH_CONFLICT',
    requiredDims: { Sex: '_T', Age: '_T' },
  },
  mobile_coverage: {
    indicator: '9.c.1', series: 'IT_MOB_4GNTWK',
    // Population covered by 4G mobile network (%)
  },
} as const

export type SDGIndicatorKey = keyof typeof SDG_INDICATORS

export interface SDGDataPoint {
  iso3: string
  indicator: SDGIndicatorKey
  value: number
  year: number
  source: 'UN SDG'
}

function getDimValue(r: Record<string, unknown>, key: string): string | undefined {
  if (Array.isArray(r.dimensions)) {
    return (r.dimensions as Array<{id: string; value: string}>)
      .find((d) => d.id === key || d.id === key.toLowerCase())?.value
  }
  if (r.dimensions && typeof r.dimensions === 'object') {
    const dims = r.dimensions as Record<string, string>
    return dims[key] ?? dims[key.toLowerCase()]
  }
  return undefined
}

async function fetchSDGIndicator(key: SDGIndicatorKey): Promise<SDGDataPoint[]> {
  const def = SDG_INDICATORS[key]
  const areaCodes = Object.values(COUNTRY_CODES).join(',')

  const url =
    `${SDG_BASE}/Indicator/Data` +
    `?indicator=${def.indicator}&series=${def.series}` +
    `&areaCode=${areaCodes}&timePeriodStart=2010&timePeriodEnd=2025&pageSize=500`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) throw new Error(`UN SDG API error: ${res.status} for ${key}`)

  const json = await res.json()
  const rows: SDGDataPoint[] = []
  const seen = new Map<string, number>()

  const iso3ByCode = Object.fromEntries(
    Object.entries(COUNTRY_CODES).map(([iso3, code]) => [code, iso3])
  )

  for (const r of (json.data ?? [])) {
    const iso3 = iso3ByCode[r.geoAreaCode]
    if (!iso3) continue

    // Filter for national total (location = all areas)
    const location = getDimValue(r as Record<string, unknown>, 'Location')
    if (location && location !== 'All areas' && location !== 'ALLAREA' && location !== '_T') continue

    // Apply required dimension filters
    if (def.requiredDims) {
      let skip = false
      for (const [dimKey, requiredVal] of Object.entries(def.requiredDims)) {
        const actual = getDimValue(r as Record<string, unknown>, dimKey)
        if (actual && actual !== requiredVal) { skip = true; break }
      }
      if (skip) continue
    }

    const value = parseFloat(r.value)
    if (isNaN(value)) continue
    const year = Math.round(r.timePeriodStart)

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
  const results = await Promise.allSettled([
    fetchSDGIndicator('electricity_access'),
    fetchSDGIndicator('food_insecurity'),
    fetchSDGIndicator('conflict_deaths'),
    fetchSDGIndicator('mobile_coverage'),
  ])
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}
