/**
 * World Bank Open Data API client
 * Licence: CC BY 4.0 — https://datacatalog.worldbank.org/public-licenses
 * No API key required. Free for any use.
 */

const WB_BASE = 'https://api.worldbank.org/v2'

// ISO3 codes — 20 platform countries across all 5 African regions
const COUNTRIES = [
  // Eastern Africa
  'KEN', 'ETH', 'TZA', 'RWA', 'UGA', 'MOZ',
  // Western Africa
  'NGA', 'GHA', 'SEN', 'CIV', 'CMR',
  // Southern Africa
  'ZAF', 'ZMB', 'AGO',
  // Northern Africa
  'EGY', 'MAR', 'DZA', 'TUN',
  // Central Africa
  'COD',
  // Island
  'MDG',
]
const COUNTRY_LIST = COUNTRIES.join(';')

// World Bank indicator codes — all from official WB Open Data catalogue (CC BY 4.0)
export const INDICATORS = {
  // Growth & economy
  gdp_growth:        'NY.GDP.MKTP.KD.ZG', // GDP growth (annual %)
  inflation:         'FP.CPI.TOTL.ZG',    // Inflation, consumer prices (annual %)
  fdi:               'BX.KLT.DINV.WD.GD.ZS', // FDI net inflows (% of GDP)
  // Connectivity & digital
  internet_access:   'IT.NET.USER.ZS',    // Internet users (% of population)
  // Health & mortality
  mortality_u5:      'SH.DYN.MORT',       // Mortality rate, under-5 (per 1,000 live births)
  // Poverty & inequality
  poverty_215:       'SI.POV.DDAY',       // Poverty headcount at $2.15/day (% population)
  gini:              'SI.POV.GINI',       // Gini index
  unemployment:      'SL.UEM.TOTL.ZS',   // Unemployment, total (% of labour force)
  // Infrastructure
  water_access:      'SH.H2O.SMDW.ZS',   // People using safely managed drinking water (%)
  // Environment
  co2_per_capita:    'EN.ATM.CO2E.PC',   // CO2 emissions (metric tonnes per capita)
  // Governance (World Governance Indicators — subset via WB API)
  political_stability: 'PV.EST',         // Political Stability index (-2.5 to +2.5)
  // Demographics
  population:        'SP.POP.TOTL',      // Population, total
  // Education (SDG 4)
  school_enrollment_primary:   'SE.PRM.NENR',      // Net primary school enrollment (%)
  school_enrollment_secondary: 'SE.SEC.NENR',      // Net secondary school enrollment (%)
  literacy_rate:               'SE.ADT.LITR.ZS',  // Adult literacy rate (% ages 15+)
  primary_completion:          'SE.PRM.CMPT.ZS',  // Primary completion rate (% of relevant age group)
  // Gender equality (SDG 5)
  women_in_parliament:         'SG.GEN.PARL.ZS',  // Women in parliament (% of seats)
  female_labor_participation:  'SL.TLF.TOTL.FE.ZS', // Female labour force participation (%)
  gender_parity_education:     'SE.ENR.PRSC.FM.ZS', // Gender parity index — primary+secondary GPI
  // SDG 2 — Hunger
  undernourishment:            'SN.ITK.DEFC.ZS',    // Prevalence of undernourishment (%)
  stunting_u5:                 'SH.STA.STNT.ZS',    // Stunting, children under 5 (%)
  // SDG 3 — Health
  health_expenditure:          'SH.XPD.CHEX.GD.ZS', // Current health expenditure (% of GDP)
  hospital_beds:               'SH.MED.BEDS.ZS',     // Hospital beds (per 1,000 people)
  // SDG 4 — Education (spending proxy)
  education_expenditure:       'SE.XPD.TOTL.GD.ZS', // Gov expenditure on education (% of GDP)
  // SDG 7/12 — Energy
  renewable_electricity:       'EG.ELC.RNEW.ZS',    // Renewable electricity output (% of total)
  energy_use_per_capita:       'EG.USE.PCAP.KG.OE', // Energy use (kg of oil equivalent per capita)
  // SDG 11 — Sustainable Cities
  urban_population:            'SP.URB.TOTL.IN.ZS',  // Urban population (% of total)
  slum_population:             'EN.POP.SLUM.UR.ZS',  // Population in slums (% of urban population)
  // SDG 14 — Oceans
  marine_protected_areas:      'ER.MRN.PTMR.ZS',    // Marine protected areas (% of territorial waters)
  // SDG 15 — Land
  forest_area:                 'AG.LND.FRST.ZS',     // Forest area (% of land area)
  protected_areas:             'ER.PTD.TOTL.ZS',     // Terrestrial + marine protected areas (% of total)
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
    `?format=json&mrv=3&per_page=100`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`World Bank API error: ${res.status} for indicator ${indicator}`)
  }

  const json = await res.json()
  const rows = Array.isArray(json) && json.length > 1 ? json[1] : []

  // Keep only most recent non-null value per country
  const best: Record<string, WBDataPoint> = {}
  for (const r of parseResponse(rows, indicator)) {
    if (!best[r.iso3] || r.year > best[r.iso3].year) best[r.iso3] = r
  }
  return Object.values(best)
}

export async function fetchAllIndicators(): Promise<WBDataPoint[]> {
  // Fetch all indicators in parallel — WB API is resilient, errors per indicator are caught
  const results = await Promise.allSettled([
    fetchIndicator('gdp_growth'),
    fetchIndicator('inflation'),
    fetchIndicator('fdi'),
    fetchIndicator('internet_access'),
    fetchIndicator('mortality_u5'),
    fetchIndicator('poverty_215'),
    fetchIndicator('gini'),
    fetchIndicator('unemployment'),
    fetchIndicator('water_access'),
    fetchIndicator('co2_per_capita'),
    fetchIndicator('political_stability'),
    fetchIndicator('population'),
    fetchIndicator('school_enrollment_primary'),
    fetchIndicator('school_enrollment_secondary'),
    fetchIndicator('literacy_rate'),
    fetchIndicator('primary_completion'),
    fetchIndicator('women_in_parliament'),
    fetchIndicator('female_labor_participation'),
    fetchIndicator('gender_parity_education'),
    fetchIndicator('undernourishment'),
    fetchIndicator('stunting_u5'),
    fetchIndicator('health_expenditure'),
    fetchIndicator('hospital_beds'),
    fetchIndicator('education_expenditure'),
    fetchIndicator('renewable_electricity'),
    fetchIndicator('energy_use_per_capita'),
    fetchIndicator('urban_population'),
    fetchIndicator('slum_population'),
    fetchIndicator('marine_protected_areas'),
    fetchIndicator('forest_area'),
    fetchIndicator('protected_areas'),
  ])

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
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
 * Formulas v1.2 — multi-source weighted composite, expanded indicators.
 *
 * Need (0–100, higher = more need):
 *   - Under-5 mortality (WB) — 35%
 *   - Maternal mortality (WHO) — 25%
 *   - Life expectancy inverse (WHO) — 20%
 *   - Poverty headcount $2.15/day (WB) — 20%
 *
 * Opportunity (0–100, higher = more opportunity):
 *   - GDP growth (WB) — 25%
 *   - Internet access (WB) — 30%
 *   - Electricity access (UN SDG) — 25%
 *   - FDI inflows % GDP (WB) — 20%
 *
 * Stability (0–100, higher = more stable):
 *   - Political stability WGI (WB) — 60% (live!)
 *   - Prior DB value — 40% (smoothing)
 */
export function calculateScores(
  data: AllDataPoint[],
  iso3: string,
  currentStability: number,
): { need: number; opportunity: number; stability: number } {
  const get = (ind: string) => data.find((d) => d.iso3 === iso3 && d.indicator === ind)?.value

  // Need components
  const mortality  = get('mortality_u5')      // per 1k, range ~10–150
  const maternal   = get('maternal_mortality') // per 100k, range ~50–2000
  const lifeExp    = get('life_expectancy')    // years, range ~50–85
  const poverty    = get('poverty_215')        // %, range 0–90

  // Opportunity components
  const gdpGrowth   = get('gdp_growth')        // %, range -5 to +15
  const internet    = get('internet_access')   // %, range 0–100
  const electricity = get('electricity_access')// %, range 0–100
  const fdi         = get('fdi')               // % GDP, range -2 to +15

  // Stability components
  const politicalStab = get('political_stability') // WGI, range -2.5 to +2.5

  // Need score
  const needComponents: number[] = []
  if (mortality != null) needComponents.push(0.35 * Math.min(100, mortality * 1.0))
  if (maternal  != null) needComponents.push(0.25 * Math.min(100, maternal / 20))
  if (lifeExp   != null) needComponents.push(0.20 * Math.max(0, 100 - (lifeExp - 40) * 1.67))
  if (poverty   != null) needComponents.push(0.20 * Math.min(100, poverty))
  const need = needComponents.length > 0
    ? Math.min(100, Math.max(0, Math.round(needComponents.reduce((a, b) => a + b, 0))))
    : null

  // Opportunity score
  const oppComponents: number[] = []
  if (gdpGrowth   != null) oppComponents.push(0.25 * Math.min(100, Math.max(0, gdpGrowth * 6 + 30)))
  if (internet    != null) oppComponents.push(0.30 * internet)
  if (electricity != null) oppComponents.push(0.25 * electricity)
  if (fdi         != null) oppComponents.push(0.20 * Math.min(100, Math.max(0, fdi * 6 + 20)))
  const opportunity = oppComponents.length > 0
    ? Math.min(100, Math.max(0, Math.round(oppComponents.reduce((a, b) => a + b, 0))))
    : null

  // Stability score — now uses live WGI data!
  // WGI political stability: -2.5 (worst) to +2.5 (best) → 0–100
  let stability = currentStability
  if (politicalStab != null) {
    const liveStab = Math.min(100, Math.max(0, Math.round((politicalStab + 2.5) * 20)))
    // 60% live data, 40% smoothing from prior value
    stability = Math.round(liveStab * 0.6 + currentStability * 0.4)
  }

  return {
    need: need ?? 50,
    opportunity: opportunity ?? 50,
    stability,
  }
}
