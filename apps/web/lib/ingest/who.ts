/**
 * WHO Global Health Observatory — OData API client
 * Licence: CC BY-NC-SA 3.0 IGO — https://www.who.int/about/policies/publishing/copyright
 * Free for non-commercial use. No API key required.
 * API docs: https://www.who.int/data/gho/info/gho-odata-api
 */

const WHO_BASE = 'https://ghoapi.azureedge.net/api'

const COUNTRIES = [
  'KEN', 'ETH', 'TZA', 'RWA', 'UGA', 'MOZ',
  'NGA', 'GHA', 'SEN', 'CIV', 'CMR',
  'ZAF', 'ZMB', 'AGO',
  'EGY', 'MAR', 'DZA', 'TUN',
  'COD', 'MDG',
]

// WHO indicator codes + optional Dim1 filter (for sex-disaggregated indicators)
const WHO_INDICATORS = {
  life_expectancy:     { code: 'WHOSIS_000001',  dim1Filter: null },
  maternal_mortality:  { code: 'MDG_0000000026', dim1Filter: null },
  ncd_mortality:       { code: 'NCDMORT3070',    dim1Filter: 'SEX_BTSX' }, // NCD premature death probability (%)
  obesity_rate:        { code: 'NCD_BMI_30A',    dim1Filter: 'SEX_BTSX' }, // Obesity prevalence (%)
  physicians_per_10k:  { code: 'HWF_0001',       dim1Filter: null },       // Medical doctors per 10,000
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
  const { code, dim1Filter } = WHO_INDICATORS[indicator]
  let filter = `SpatialDimType eq 'COUNTRY' and ParentLocationCode ne null`
  if (dim1Filter) filter += ` and Dim1 eq '${dim1Filter}'`

  const url = `${WHO_BASE}/${code}?$filter=${encodeURIComponent(filter)}&$orderby=TimeDim desc`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) throw new Error(`WHO API error: ${res.status} for ${indicator}`)

  const json = await res.json()
  const rows: WHODataPoint[] = []
  const seen = new Set<string>()

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
  const results = await Promise.allSettled([
    fetchWHOIndicator('life_expectancy'),
    fetchWHOIndicator('maternal_mortality'),
    fetchWHOIndicator('ncd_mortality'),
    fetchWHOIndicator('obesity_rate'),
    fetchWHOIndicator('physicians_per_10k'),
  ])
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}
