/**
 * ACLED (Armed Conflict Location & Event Data) API client
 * ACLED — https://acleddata.com — free academic/research use
 * Requires ACLED_API_KEY and ACLED_EMAIL environment variables.
 */

const ACLED_BASE = 'https://api.acleddata.com/acled/read.php'

// ISO numeric codes for our 20 platform countries
const COUNTRY_ISO_NUMERIC: Record<string, number> = {
  KEN: 404,
  ETH: 231,
  TZA: 834,
  RWA: 646,
  UGA: 800,
  MOZ: 508,
  NGA: 566,
  GHA: 288,
  SEN: 686,
  CIV: 384,
  CMR: 120,
  ZAF: 710,
  ZMB: 894,
  AGO:  24,
  EGY: 818,
  MAR: 504,
  DZA:  12,
  TUN: 788,
  COD: 180,
  MDG: 450,
}

export interface ACLEDDataPoint {
  iso3: string
  indicator: 'conflict_events' | 'conflict_fatalities'
  value: number
  year: number
  source: 'ACLED'
}

interface ACLEDResponse {
  count: number
  data: Array<{ fatalities: number | string }>
}

async function fetchACLEDCountry(
  iso3: string,
  isoNumeric: number,
  year: number,
  apiKey: string,
  email: string,
): Promise<ACLEDDataPoint[]> {
  const dateFrom = `${year}-01-01`
  const dateTo   = `${year}-12-31`

  const params = new URLSearchParams({
    key:              apiKey,
    email:            email,
    iso:              String(isoNumeric),
    event_date:       `${dateFrom}|${dateTo}`,
    event_date_where: 'BETWEEN',
    limit:            '0',
  })

  const url = `${ACLED_BASE}?${params.toString()}`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`ACLED API error: ${res.status} for country ${iso3}`)
  }

  const json = (await res.json()) as ACLEDResponse

  const count = json.count ?? 0
  const fatalities = (json.data ?? []).reduce((sum, row) => {
    return sum + Number(row.fatalities ?? 0)
  }, 0)

  return [
    { iso3, indicator: 'conflict_events',     value: count,      year, source: 'ACLED' },
    { iso3, indicator: 'conflict_fatalities', value: fatalities, year, source: 'ACLED' },
  ]
}

export async function fetchAllACLEDIndicators(): Promise<ACLEDDataPoint[]> {
  const apiKey = process.env.ACLED_API_KEY
  const email  = process.env.ACLED_EMAIL

  if (!apiKey || !email) {
    console.warn('[ACLED] Skipping: ACLED_API_KEY or ACLED_EMAIL env var is missing.')
    return []
  }

  // Fetch last full calendar year
  const year = new Date().getFullYear() - 1

  const results = await Promise.allSettled(
    Object.entries(COUNTRY_ISO_NUMERIC).map(([iso3, isoNumeric]) =>
      fetchACLEDCountry(iso3, isoNumeric, year, apiKey, email)
    )
  )

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}
