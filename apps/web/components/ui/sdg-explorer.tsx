'use client'

import { useState, useMemo } from 'react'
import { Minus, Plus, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { CountryFlag } from '@/components/ui/country-flag'
import { formatNum } from '@/lib/utils'
import type { CountrySummary, CountryMetric } from '@/types'

interface GoalDef {
  n: number
  label: string
  color: string
  about: string
  keyQuestions: string[]
}

const GOALS: GoalDef[] = [
  {
    n: 1, label: 'No Poverty', color: '#e5243b',
    about: 'SDG 1 aims to end all forms of poverty everywhere by 2030. More than 700 million people still live on less than $2.15 a day. In sub-Saharan Africa, extreme poverty remains concentrated in rural areas, among women, and in conflict-affected regions.',
    keyQuestions: [
      'What share of the population lives below the national poverty line?',
      'How does GDP growth translate into household income gains?',
      'Are social protection systems reaching the most vulnerable?',
      'How does poverty intersect with gender, age, and geography?',
    ],
  },
  {
    n: 2, label: 'Zero Hunger', color: '#dda63a',
    about: 'SDG 2 targets an end to hunger, achieve food security and improved nutrition, and promote sustainable agriculture. Africa accounts for over half of the world\'s food-insecure population. Climate shocks, conflict, and supply chain fragility are primary drivers.',
    keyQuestions: [
      'What is the under-5 mortality rate as a nutrition proxy?',
      'How resilient are food systems to climate shocks?',
      'Is smallholder agricultural productivity improving?',
      'Are stunting and wasting rates declining among children?',
    ],
  },
  {
    n: 3, label: 'Good Health', color: '#4c9f38',
    about: 'SDG 3 aims to ensure healthy lives and promote well-being for all. Africa carries a disproportionate share of the global disease burden — including HIV, malaria, and tuberculosis — while facing chronic shortages of health workers and infrastructure.',
    keyQuestions: [
      'What is life expectancy at birth and how has it changed?',
      'What is the maternal mortality ratio per 100,000 live births?',
      'How accessible is primary healthcare in rural areas?',
      'Are vaccination coverage rates reaching herd immunity thresholds?',
    ],
  },
  {
    n: 4, label: 'Quality Education', color: '#c5192d',
    about: 'SDG 4 seeks inclusive, equitable quality education for all. Sub-Saharan Africa has the highest out-of-school rates globally. Girls, children with disabilities, and those in conflict zones face the greatest barriers. Internet access is a growing proxy for digital education.',
    keyQuestions: [
      'What percentage of the population has internet access (digital education proxy)?',
      'What are primary and secondary school completion rates by gender?',
      'Is teacher-to-student ratio improving?',
      'Are learning outcomes — not just enrolment — improving?',
    ],
  },
  {
    n: 5, label: 'Gender Equality', color: '#ff3a21',
    about: 'SDG 5 calls for gender equality and empowerment for all women and girls. In Africa, gender gaps persist in education, economic participation, political representation, and land ownership. Early marriage and gender-based violence remain significant barriers.',
    keyQuestions: [
      'What is the ratio of girls to boys completing secondary education?',
      'What share of parliamentary seats are held by women?',
      'What is the prevalence of child marriage (before age 18)?',
      'Do women have equal legal rights to land and property?',
    ],
  },
  {
    n: 6, label: 'Clean Water', color: '#26bde2',
    about: 'SDG 6 targets universal access to safe water and sanitation. Over 400 million Africans lack access to basic drinking water services. Climate change is intensifying water stress — particularly in the Sahel, Horn of Africa, and Southern Africa.',
    keyQuestions: [
      'What share of the population uses safely managed drinking water?',
      'What is open defecation prevalence?',
      'How are water bodies and aquifers changing under climate stress?',
      'Is WASH infrastructure reaching schools and health facilities?',
    ],
  },
  {
    n: 7, label: 'Affordable Energy', color: '#fcc30b',
    about: 'SDG 7 aims for affordable, reliable, sustainable modern energy access. About 600 million Africans lack electricity access. The continent has immense renewable energy potential — solar, wind, geothermal — but investment and grid infrastructure lag.',
    keyQuestions: [
      'What percentage of the population has electricity access?',
      'What share of energy comes from renewable sources?',
      'Are off-grid and mini-grid solutions scaling fast enough?',
      'What is the cost of electricity for households and businesses?',
    ],
  },
  {
    n: 8, label: 'Decent Work', color: '#a21942',
    about: 'SDG 8 promotes sustained, inclusive economic growth and decent work for all. Africa has the world\'s fastest-growing workforce, but formal job creation has not kept pace. Informal employment, youth unemployment, and exploitative labour conditions are core challenges.',
    keyQuestions: [
      'What is annual GDP growth rate?',
      'What is the youth unemployment rate?',
      'What share of employment is in the informal economy?',
      'Are labour rights and safe working conditions enforced?',
    ],
  },
  {
    n: 9, label: 'Industry & Innovation', color: '#fd6925',
    about: 'SDG 9 focuses on resilient infrastructure, inclusive industrialisation, and innovation. Africa\'s infrastructure gap costs an estimated 2% of GDP annually. Mobile connectivity and the tech startup ecosystem are the continent\'s fastest-growing innovation drivers.',
    keyQuestions: [
      'What percentage of the population uses the internet?',
      'What is mobile broadband coverage and penetration?',
      'How much R&D spending occurs as a share of GDP?',
      'Is manufacturing value added growing as a share of GDP?',
    ],
  },
  {
    n: 10, label: 'Reduced Inequalities', color: '#dd1367',
    about: 'SDG 10 aims to reduce inequality within and between countries. Africa has some of the world\'s highest Gini coefficients. Inequality is multidimensional — spanning income, health outcomes, geography, gender, and access to services.',
    keyQuestions: [
      'What is the Gini coefficient (income inequality)?',
      'Are the bottom 40% of earners growing their income faster than the national average?',
      'Are health outcomes — like under-5 mortality — converging across wealth quintiles?',
      'How do remittances affect inequality between urban and rural households?',
    ],
  },
  {
    n: 11, label: 'Sustainable Cities', color: '#fd9d24',
    about: 'SDG 11 targets safe, inclusive, resilient and sustainable cities. Africa is urbanising faster than any other continent — adding 1 billion urban residents by 2050. Most growth is in informal settlements with limited services, creating housing, transport, and governance challenges.',
    keyQuestions: [
      'What share of urban residents live in slums?',
      'Is public transport accessible and affordable?',
      'How are cities planning for climate resilience and flooding risk?',
      'Are urban governance and municipal finance systems improving?',
    ],
  },
  {
    n: 12, label: 'Responsible Consumption', color: '#bf8b2e',
    about: 'SDG 12 promotes sustainable production and consumption patterns. Africa\'s per-capita consumption footprint is low globally, but rapid economic growth is increasing resource use. Food waste, plastic pollution, and unsustainable land use are growing concerns.',
    keyQuestions: [
      'What is food loss and waste as a share of production?',
      'How is plastic waste managed across the value chain?',
      'Are sustainable procurement practices adopted by government?',
      'Is the private sector reporting on sustainability metrics?',
    ],
  },
  {
    n: 13, label: 'Climate Action', color: '#3f7e44',
    about: 'SDG 13 calls for urgent action to combat climate change. Africa contributes less than 4% of global emissions but is among the most climate-vulnerable regions. Droughts, floods, desertification, and rising temperatures threaten food systems, health, and livelihoods.',
    keyQuestions: [
      'What are CO2 emissions per capita and is the trend improving?',
      'Are national adaptation plans (NAPs) being implemented?',
      'How much climate finance is flowing to adaptation vs mitigation?',
      'Are early warning systems for extreme weather events in place?',
    ],
  },
  {
    n: 14, label: 'Life Below Water', color: '#0a97d9',
    about: 'SDG 14 aims to conserve and sustainably use oceans, seas and marine resources. Africa\'s coastline spans 40,000km. Overfishing, marine pollution, and coral bleaching threaten food security for millions who depend on fisheries.',
    keyQuestions: [
      'What share of marine areas are protected?',
      'Is fish stock depletion accelerating?',
      'How much plastic enters African coastal waters annually?',
      'Are small-scale fishers able to access and manage their resources sustainably?',
    ],
  },
  {
    n: 15, label: 'Life on Land', color: '#56c02b',
    about: 'SDG 15 seeks to protect, restore and sustainably manage terrestrial ecosystems. Africa hosts some of the world\'s most biodiverse habitats. Deforestation, desertification, and land degradation are accelerating — driven by agriculture expansion, illegal logging, and climate stress.',
    keyQuestions: [
      'What is the annual rate of forest loss?',
      'What share of land is affected by desertification?',
      'Are protected area systems adequately funded and managed?',
      'Is wildlife trafficking declining?',
    ],
  },
  {
    n: 16, label: 'Peace & Justice', color: '#00689d',
    about: 'SDG 16 promotes peaceful, inclusive societies, access to justice, and effective institutions. Conflict, fragility, and weak governance undermine all other SDGs. The Sahel, Horn of Africa, and Great Lakes region face the most acute challenges.',
    keyQuestions: [
      'What is the governance and peace composite score?',
      'Are conflict-related deaths and displacement declining?',
      'Do citizens have effective access to justice and legal identity?',
      'Is corruption being reduced in public institutions?',
    ],
  },
  {
    n: 17, label: 'Partnerships', color: '#19486a',
    about: 'SDG 17 is the means of implementation — mobilising finance, technology, and capacity to achieve all other goals. Africa\'s external debt burden and dependence on aid limit domestic investment. South-South cooperation, blended finance, and diaspora investment are growing alternatives.',
    keyQuestions: [
      'What is official development assistance (ODA) as a share of GNI?',
      'Are domestic resource mobilisation and tax revenues increasing?',
      'How is the debt-to-GDP ratio evolving?',
      'Is technology transfer and capacity building reaching least-developed countries?',
    ],
  },
]

type DisplayType = 'percent' | 'rate'

interface MetricDef {
  key: string
  label: string
  higherIsBetter: boolean
  source: string
  display: DisplayType
  unit?: string
}

const SDG_METRICS: Record<number, MetricDef[]> = {
  1: [
    { key: 'gdp_growth',   label: 'GDP growth (% annual)',                   higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'poverty_215',  label: 'Poverty headcount at $2.15/day (% pop)', higherIsBetter: false, source: 'World Bank', display: 'percent', unit: '%' },
  ],
  2: [
    { key: 'undernourishment', label: 'Undernourishment prevalence (%)',           higherIsBetter: false, source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'stunting_u5',      label: 'Stunting, children under 5 (%)',             higherIsBetter: false, source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'food_insecurity',  label: 'Moderate/severe food insecurity (%)',        higherIsBetter: false, source: 'UN SDG',     display: 'percent', unit: '%' },
    { key: 'mortality_u5',     label: 'Under-5 mortality — nutrition proxy (per 1k)', higherIsBetter: false, source: 'World Bank', display: 'rate',    unit: 'per 1k' },
  ],
  3: [
    { key: 'life_expectancy',    label: 'Life expectancy (years)',              higherIsBetter: true,  source: 'WHO GHO',    display: 'rate',    unit: 'yrs' },
    { key: 'maternal_mortality', label: 'Maternal mortality (per 100,000)',     higherIsBetter: false, source: 'WHO GHO',    display: 'rate',    unit: 'per 100k' },
    { key: 'mortality_u5',       label: 'Under-5 mortality (per 1,000)',        higherIsBetter: false, source: 'World Bank', display: 'rate',    unit: 'per 1k' },
    { key: 'ncd_mortality',      label: 'NCD premature mortality prob. (%)',    higherIsBetter: false, source: 'WHO GHO',    display: 'percent', unit: '%' },
    { key: 'obesity_rate',       label: 'Obesity prevalence (%)',               higherIsBetter: false, source: 'WHO GHO',    display: 'percent', unit: '%' },
    { key: 'physicians_per_10k', label: 'Medical doctors (per 10,000)',         higherIsBetter: true,  source: 'WHO GHO',    display: 'rate',    unit: 'per 10k' },
    { key: 'health_expenditure', label: 'Health expenditure (% of GDP)',        higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'hospital_beds',      label: 'Hospital beds (per 1,000)',            higherIsBetter: true,  source: 'World Bank', display: 'rate',    unit: 'per 1k' },
  ],
  4: [
    { key: 'school_enrollment_primary',   label: 'Net primary school enrollment (%)',        higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'school_enrollment_secondary', label: 'Net secondary school enrollment (%)',       higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'literacy_rate',               label: 'Adult literacy rate (% ages 15+)',          higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'primary_completion',          label: 'Primary completion rate (%)',                higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'education_expenditure',       label: 'Gov. education expenditure (% of GDP)',     higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'internet_access',             label: 'Internet access — digital learning proxy (%)', higherIsBetter: true, source: 'World Bank', display: 'percent', unit: '%' },
  ],
  5: [
    { key: 'women_in_parliament',        label: 'Women in parliament (% of seats)',          higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'female_labor_participation', label: 'Female labour force participation (%)',      higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'gender_parity_education',    label: 'Gender parity index — education (GPI)',      higherIsBetter: true,  source: 'World Bank', display: 'rate',    unit: 'GPI' },
    { key: 'maternal_mortality',         label: 'Maternal mortality (per 100,000)',           higherIsBetter: false, source: 'WHO GHO',    display: 'rate',    unit: 'per 100k' },
  ],
  6: [
    { key: 'water_access', label: 'Safely managed drinking water (%)', higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
  ],
  7: [
    { key: 'electricity_access',   label: 'Electricity access (%)',                higherIsBetter: true, source: 'UN SDG',     display: 'percent', unit: '%' },
    { key: 'renewable_electricity', label: 'Renewable electricity output (%)',     higherIsBetter: true, source: 'World Bank', display: 'percent', unit: '%' },
  ],
  8: [
    { key: 'gdp_growth',    label: 'GDP growth (% annual)',            higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'unemployment',  label: 'Unemployment rate (%)',            higherIsBetter: false, source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'inflation',     label: 'Inflation, CPI (% annual)',        higherIsBetter: false, source: 'World Bank', display: 'rate',    unit: '%' },
  ],
  9: [
    { key: 'internet_access',  label: 'Internet users (% population)',        higherIsBetter: true, source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'mobile_coverage',  label: '4G mobile network coverage (%)',       higherIsBetter: true, source: 'UN SDG',     display: 'percent', unit: '%' },
    { key: 'fdi',              label: 'FDI net inflows (% of GDP)',            higherIsBetter: true, source: 'World Bank', display: 'rate',    unit: '% GDP' },
  ],
  10: [
    { key: 'gini',                    label: 'Gini index (income inequality)',           higherIsBetter: false, source: 'World Bank', display: 'rate',    unit: '' },
    { key: 'mortality_u5',            label: 'Under-5 mortality — inequality proxy',    higherIsBetter: false, source: 'World Bank', display: 'rate',    unit: 'per 1k' },
    { key: 'gender_parity_education', label: 'Gender parity in education (GPI)',        higherIsBetter: true,  source: 'World Bank', display: 'rate',    unit: 'GPI' },
    { key: 'women_in_parliament',     label: 'Women in parliament (% of seats)',        higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
  ],
  11: [
    { key: 'urban_population', label: 'Urban population (% of total)',        higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'slum_population',  label: 'Population in slums (% of urban)',     higherIsBetter: false, source: 'World Bank', display: 'percent', unit: '% urban' },
  ],
  12: [
    { key: 'energy_use_per_capita', label: 'Energy use per capita (kg oil eq.)',    higherIsBetter: false, source: 'World Bank', display: 'rate',    unit: 'kg' },
    { key: 'renewable_electricity', label: 'Renewable electricity output (%)',      higherIsBetter: true,  source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'co2_per_capita',        label: 'CO2 emissions per capita (tonnes)',     higherIsBetter: false, source: 'World Bank', display: 'rate',    unit: 't/cap' },
  ],
  13: [
    { key: 'co2_per_capita', label: 'CO2 emissions per capita (tonnes)', higherIsBetter: false, source: 'World Bank', display: 'rate', unit: 't/cap' },
  ],
  14: [
    { key: 'marine_protected_areas', label: 'Marine protected areas (% of territorial waters)', higherIsBetter: true, source: 'World Bank', display: 'percent', unit: '%' },
  ],
  15: [
    { key: 'forest_area',    label: 'Forest area (% of land area)',               higherIsBetter: true, source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'protected_areas', label: 'Protected areas (% of total territory)',    higherIsBetter: true, source: 'World Bank', display: 'percent', unit: '%' },
  ],
  16: [
    { key: 'score_stability',     label: 'Governance & peace score (0-100)',    higherIsBetter: true, source: 'Platform composite', display: 'percent', unit: '/100' },
    { key: 'political_stability', label: 'Political stability index (0-100)',   higherIsBetter: true, source: 'World Bank WGI',     display: 'percent', unit: '/100' },
    { key: 'conflict_deaths',     label: 'Conflict-related deaths (per 100k)', higherIsBetter: false, source: 'UN SDG',            display: 'rate',    unit: 'per 100k' },
  ],
  17: [
    { key: 'fdi', label: 'FDI net inflows (% of GDP) — investment proxy', higherIsBetter: true, source: 'World Bank', display: 'rate', unit: '% GDP' },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface TrendResult {
  key: string
  label: string
  sdgGoal: number
  sdgLabel: string
  sdgColor: string
  higherIsBetter: boolean
  avgOldest: number
  avgNewest: number
  changePct: number
  direction: 'improving' | 'worsening'
  countriesWithData: number
  yearFrom: number
  yearTo: number
}

function computeContinentTrends(
  countries: CountrySummary[],
  metrics: Record<string, CountryMetric[]>,
): TrendResult[] {
  const seen = new Set<string>()
  const results: TrendResult[] = []

  for (const goal of GOALS) {
    const defs = SDG_METRICS[goal.n]
    if (!defs) continue

    for (const def of defs) {
      if (seen.has(def.key)) continue
      seen.add(def.key)

      const histories: { oldest: number; newest: number }[] = []
      let minYear = Infinity
      let maxYear = -Infinity

      for (const c of countries) {
        const cm = (metrics[c.iso3] ?? []).find(m => m.key === def.key)
        if (!cm?.history || cm.history.length < 2) continue
        const sorted = [...cm.history].sort((a, b) => a.year - b.year)
        histories.push({ oldest: sorted[0].value, newest: sorted[sorted.length - 1].value })
        if (sorted[0].year < minYear) minYear = sorted[0].year
        if (sorted[sorted.length - 1].year > maxYear) maxYear = sorted[sorted.length - 1].year
      }

      if (histories.length < 3) continue

      const avgOldest = histories.reduce((s, h) => s + h.oldest, 0) / histories.length
      const avgNewest = histories.reduce((s, h) => s + h.newest, 0) / histories.length

      if (avgOldest === 0) continue
      const changePct = ((avgNewest - avgOldest) / Math.abs(avgOldest)) * 100
      if (Math.abs(changePct) < 0.5) continue

      const isGoodChange = def.higherIsBetter ? changePct > 0 : changePct < 0

      results.push({
        key: def.key,
        label: def.label,
        sdgGoal: goal.n,
        sdgLabel: goal.label,
        sdgColor: goal.color,
        higherIsBetter: def.higherIsBetter,
        avgOldest,
        avgNewest,
        changePct,
        direction: isGoodChange ? 'improving' : 'worsening',
        countriesWithData: histories.length,
        yearFrom: minYear,
        yearTo: maxYear,
      })
    }
  }

  return results.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
}

function MiniSparkline({ data, color, width = 80, height = 28 }: {
  data: { year: number; value: number }[]
  color: string
  width?: number
  height?: number
}) {
  if (data.length < 2) return null
  const sorted = [...data].sort((a, b) => a.year - b.year)
  const values = sorted.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padding = 2

  const points = sorted.map((d, i) => {
    const x = padding + (i / (sorted.length - 1)) * (width - padding * 2)
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getAggregateHistory(
  countries: CountrySummary[],
  metrics: Record<string, CountryMetric[]>,
  metricKey: string,
): { year: number; value: number }[] {
  const byYear: Record<number, number[]> = {}
  for (const c of countries) {
    const cm = (metrics[c.iso3] ?? []).find(m => m.key === metricKey)
    if (!cm?.history) continue
    for (const h of cm.history) {
      if (!byYear[h.year]) byYear[h.year] = []
      byYear[h.year].push(h.value)
    }
  }
  return Object.entries(byYear)
    .map(([year, vals]) => ({ year: Number(year), value: vals.reduce((s, v) => s + v, 0) / vals.length }))
    .sort((a, b) => a.year - b.year)
}

interface Props {
  countries: CountrySummary[]
  metrics: Record<string, CountryMetric[]>
}

function perfColor(goodPct: number) {
  if (goodPct >= 70) return { bg: '#dcfce7', text: '#16a34a', dot: '#22c55e' }
  if (goodPct >= 40) return { bg: '#fef9c3', text: '#b45309', dot: '#f59e0b' }
  return { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' }
}

function EducationPanel({ goal }: { goal: GoalDef }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">About this goal</span>
        {open ? <Minus className="w-4 h-4 text-slate-400" /> : <Plus className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 py-4 bg-white space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{goal.about}</p>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Key questions</p>
            <ul className="space-y-1.5">
              {goal.keyQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-slate-300 mt-0.5 flex-shrink-0">&#8250;</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

function TrendCard({ t, type, countries, metrics }: {
  t: TrendResult
  type: 'improving' | 'worsening'
  countries: CountrySummary[]
  metrics: Record<string, CountryMetric[]>
}) {
  const aggHistory = getAggregateHistory(countries, metrics, t.key)
  const color = type === 'improving' ? '#22c55e' : '#ef4444'
  const textClass = type === 'improving' ? 'text-emerald-600' : 'text-rose-600'
  const borderClass = type === 'improving' ? 'border-emerald-100/60' : 'border-rose-100/60'
  const hoverClass = type === 'improving' ? 'hover:bg-emerald-50/50' : 'hover:bg-rose-50/50'

  return (
    <div className={`flex items-center gap-3 bg-white/80 rounded-xl border ${borderClass} px-3 py-2.5 ${hoverClass} transition-colors text-left`}>
      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: t.sdgColor }}>
        {t.sdgGoal}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">{t.label}</p>
        <p className="text-[10px] text-slate-400">{t.countriesWithData} countries · {t.yearFrom}&#8211;{t.yearTo}</p>
      </div>
      <MiniSparkline data={aggHistory} color={color} />
      <span className={`text-xs font-bold flex-shrink-0 ${textClass}`}>
        {t.changePct > 0 ? '+' : ''}{t.changePct.toFixed(1)}%
      </span>
    </div>
  )
}

export function SDGExplorer({ countries, metrics }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const goalMetrics = selected ? SDG_METRICS[selected] : undefined
  const selectedGoal = selected ? GOALS[selected - 1] : undefined

  const trends = useMemo(
    () => computeContinentTrends(countries, metrics),
    [countries, metrics],
  )

  // When a goal is selected, show only its trends; otherwise show continent-wide
  const heroTrends = useMemo(() => {
    if (selected) return trends.filter(t => t.sdgGoal === selected)
    return trends
  }, [trends, selected])

  const improving = heroTrends.filter(t => t.direction === 'improving')
  const worsening = heroTrends.filter(t => t.direction === 'worsening')

  // Equalize: both sides show the same count (max 6 for continent, max 4 for goal)
  const maxCards = selected ? 4 : 6
  const displayCount = Math.min(maxCards, Math.max(improving.length, worsening.length))
  const improvingDisplay = improving.slice(0, displayCount)
  const worseningDisplay = worsening.slice(0, displayCount)

  const hasTrends = improvingDisplay.length > 0 || worseningDisplay.length > 0

  // Compute overall year range for the subtitle
  const yearRange = useMemo(() => {
    if (heroTrends.length === 0) return null
    const from = Math.min(...heroTrends.map(t => t.yearFrom))
    const to = Math.max(...heroTrends.map(t => t.yearTo))
    return { from, to }
  }, [heroTrends])

  return (
    <div>
      {/* ── Hero: Page header ────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">SDG Explorer</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Track Africa's progress on the UN Sustainable Development Goals — powered by 10+ years of verified data from World Bank, WHO, UN SDG, and IMF sources.
        </p>
      </div>

      {/* ── Trend Hero Section ───────────────────────────────────────── */}
      {hasTrends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
          {/* Improving */}
          <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-emerald-900">
                  {selected ? `SDG ${selected}: Improving` : 'Improving across Africa'}
                </h2>
                <p className="text-[11px] text-emerald-600">
                  {yearRange ? `${yearRange.from}\u2013${yearRange.to}` : '10-year'} continent-wide average
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              {improvingDisplay.length > 0 ? improvingDisplay.map((t) => (
                <TrendCard key={t.key} t={t} type="improving" countries={countries} metrics={metrics} />
              )) : (
                <div className="flex items-center justify-center py-6 text-xs text-emerald-400">
                  No improving indicators {selected ? 'for this goal' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Worsening */}
          <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-rose-900">
                  {selected ? `SDG ${selected}: Needs attention` : 'Needs attention'}
                </h2>
                <p className="text-[11px] text-rose-600">
                  Indicators moving in the wrong direction
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              {worseningDisplay.length > 0 ? worseningDisplay.map((t) => (
                <TrendCard key={t.key} t={t} type="worsening" countries={countries} metrics={metrics} />
              )) : (
                <div className="flex items-center justify-center py-6 text-xs text-rose-400">
                  No worsening indicators {selected ? 'for this goal' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Goal tiles ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {GOALS.map(({ n, label, color }) => {
          const isSelected = selected === n
          const goalTrends = trends.filter(t => t.sdgGoal === n)
          const improvingCount = goalTrends.filter(t => t.direction === 'improving').length
          const worseningCount = goalTrends.filter(t => t.direction === 'worsening').length

          return (
            <button
              key={n}
              onClick={() => setSelected(isSelected ? null : n)}
              className={`bg-white rounded-xl border text-left p-4 flex flex-col gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-slate-400 shadow-md ring-2 ring-slate-300'
                  : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300'
              }`}
              title={`Click to expand ${label}`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {n}
              </div>
              <p className="text-xs font-medium text-slate-700 leading-snug">{label}</p>
              {goalTrends.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {improvingCount > 0 && (
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 border border-emerald-100 flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" /> {improvingCount}
                    </span>
                  )}
                  {worseningCount > 0 && (
                    <span className="text-[10px] font-medium text-rose-600 bg-rose-50 rounded-full px-2 py-0.5 border border-rose-100 flex items-center gap-0.5">
                      <TrendingDown className="w-2.5 h-2.5" /> {worseningCount}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 w-fit border border-emerald-100">Live data</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Detail panel ─────────────────────────────────────────────── */}
      {selected && selectedGoal && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
              style={{ backgroundColor: selectedGoal.color }}
            >
              {selected}
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">SDG {selected} — {selectedGoal.label}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {[...new Set(goalMetrics!.map(m => m.source))].join(' · ')}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="ml-auto text-slate-300 hover:text-slate-500"><X className="w-5 h-5" /></button>
          </div>

          <div className="mb-6">
            <EducationPanel goal={selectedGoal} />
          </div>

          {goalMetrics && (
          <div className="space-y-8">
            {goalMetrics.map(({ key, label, higherIsBetter, source, display, unit }) => {
              const rows = countries.map((c) => {
                if (key === 'score_stability') {
                  return {
                    country: c,
                    metric: { key, label, value: c.scores.stability, unit: '/100', source, source_year: new Date().getFullYear(), freshness: 'fresh' } as CountryMetric,
                    history: [] as { year: number; value: number }[],
                  }
                }
                if (key === 'political_stability') {
                  const raw = (metrics[c.iso3] ?? []).find((x) => x.key === 'political_stability')
                  if (raw) {
                    const normalized = Math.min(100, Math.max(0, Math.round((Number(raw.value) + 2.5) * 20)))
                    return { country: c, metric: { ...raw, value: normalized, unit: '/100' } as CountryMetric, history: raw.history ?? [] }
                  }
                  return { country: c, metric: undefined, history: [] as { year: number; value: number }[] }
                }
                const m = (metrics[c.iso3] ?? []).find((x) => x.key === key)
                return { country: c, metric: m, history: m?.history ?? [] }
              })
              .filter((r) => r.metric != null)
              .sort((a, b) =>
                higherIsBetter
                  ? (b.metric!.value as number) - (a.metric!.value as number)
                  : (a.metric!.value as number) - (b.metric!.value as number)
              )

              if (rows.length === 0) return (
                <div key={key}>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
                  <p className="text-xs text-slate-400">No data yet — will populate after next ingest.</p>
                </div>
              )

              // Compute aggregate trend for this indicator
              const aggHistory = getAggregateHistory(countries, metrics, key)
              const hasTrendData = aggHistory.length >= 2
              let trendChangePct = 0
              let trendDirection: 'up' | 'down' | 'flat' = 'flat'
              if (hasTrendData) {
                const first = aggHistory[0].value
                const last = aggHistory[aggHistory.length - 1].value
                if (first !== 0) {
                  trendChangePct = ((last - first) / Math.abs(first)) * 100
                  trendDirection = Math.abs(trendChangePct) < 0.5 ? 'flat' : trendChangePct > 0 ? 'up' : 'down'
                }
              }
              const isGoodTrend = higherIsBetter ? trendDirection === 'up' : trendDirection === 'down'

              const values = rows.map((r) => r.metric!.value as number)
              const max = Math.max(...values)
              const min = Math.min(...values)
              const range = max - min || 1

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                    <div className="flex items-center gap-3">
                      {hasTrendData && trendDirection !== 'flat' && (
                        <div className="flex items-center gap-1.5">
                          <MiniSparkline
                            data={aggHistory}
                            color={isGoodTrend ? '#22c55e' : '#ef4444'}
                            width={60}
                            height={22}
                          />
                          <span className={`text-[11px] font-bold ${isGoodTrend ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {trendChangePct > 0 ? '+' : ''}{trendChangePct.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400">10yr avg</span>
                        </div>
                      )}
                      <span className="text-[11px] text-slate-400">{source} · {higherIsBetter ? 'higher = better' : 'lower = better'}</span>
                    </div>
                  </div>

                  {display === 'percent' ? (
                    <div className="space-y-2.5">
                      {rows.map(({ country, metric, history }, rank) => {
                        const val = metric!.value as number
                        const goodPct = higherIsBetter ? val : 100 - val
                        const { dot } = perfColor(goodPct)
                        const barWidth = Math.min(100, Math.max(2, Math.abs(val)))
                        const sorted = [...history].sort((a, b) => a.year - b.year)
                        const hasCountryTrend = sorted.length >= 2
                        let countryTrendPct = 0
                        let countryTrendGood: boolean | null = null
                        if (hasCountryTrend) {
                          const f = sorted[0].value, l = sorted[sorted.length - 1].value
                          if (f !== 0) {
                            countryTrendPct = ((l - f) / Math.abs(f)) * 100
                            countryTrendGood = higherIsBetter ? countryTrendPct > 0.5 : countryTrendPct < -0.5
                            if (Math.abs(countryTrendPct) < 0.5) countryTrendGood = null
                          }
                        }

                        return (
                          <div key={country.iso3} className="flex items-center gap-2 sm:gap-3">
                            <span className="text-[11px] font-bold text-slate-300 w-4 text-right flex-shrink-0">{rank + 1}</span>
                            <CountryFlag iso3={country.iso3} countryName={country.name} size="sm" />
                            <span className="text-xs text-slate-600 w-24 flex-shrink-0 truncate">{country.name}</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, backgroundColor: dot }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 w-14 text-right flex-shrink-0">
                              {formatNum(val)}{unit ? ` ${unit}` : ''}
                            </span>
                            <div className="flex-shrink-0 w-[72px] hidden sm:flex items-center gap-1 justify-end">
                              {hasCountryTrend && (
                                <>
                                  <MiniSparkline data={sorted} color={dot} width={40} height={16} />
                                  {countryTrendGood !== null && (
                                    <span className={`text-[10px] font-bold ${countryTrendGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      {countryTrendGood ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex ml-[7.5rem] mt-1">
                        <span className="text-[10px] text-slate-300">0%</span>
                        <span className="flex-1 text-center text-[10px] text-slate-300">50%</span>
                        <span className="text-[10px] text-slate-300">100%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rows.map(({ country, metric, history }, rank) => {
                        const val = metric!.value as number
                        const rawPct = ((val - min) / range) * 100
                        const goodPct = higherIsBetter ? rawPct : 100 - rawPct
                        const { bg, text, dot } = perfColor(goodPct)
                        const sorted = [...history].sort((a, b) => a.year - b.year)
                        const hasCountryTrend = sorted.length >= 2
                        let countryTrendPct = 0
                        let countryTrendGood: boolean | null = null
                        if (hasCountryTrend) {
                          const f = sorted[0].value, l = sorted[sorted.length - 1].value
                          if (f !== 0) {
                            countryTrendPct = ((l - f) / Math.abs(f)) * 100
                            countryTrendGood = higherIsBetter ? countryTrendPct > 0.5 : countryTrendPct < -0.5
                            if (Math.abs(countryTrendPct) < 0.5) countryTrendGood = null
                          }
                        }

                        return (
                          <div key={country.iso3} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
                            <span className="text-[11px] font-bold text-slate-300 w-4 flex-shrink-0">{rank + 1}</span>
                            <CountryFlag iso3={country.iso3} countryName={country.name} size="sm" />
                            <span className="text-sm text-slate-700 flex-1 truncate">{country.name}</span>
                            {hasCountryTrend && (
                              <div className="flex-shrink-0 hidden sm:flex items-center gap-1">
                                <MiniSparkline data={sorted} color={dot} width={40} height={16} />
                                {countryTrendGood !== null && (
                                  <span className={`text-[10px] font-bold ${countryTrendGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {countryTrendGood ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
                              <span
                                className="text-sm font-bold px-2 py-0.5 rounded-lg"
                                style={{ backgroundColor: bg, color: text }}
                              >
                                {formatNum(val)}
                                <span className="text-[10px] font-normal ml-0.5">{unit}</span>
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { color: '#22c55e', label: 'Strong performance' },
          { color: '#f59e0b', label: 'Moderate' },
          { color: '#ef4444', label: 'Needs attention' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
        <span className="text-xs text-slate-400">· Ranked best to worst within platform countries · Sparklines show 10-year trend</span>
      </div>
    </div>
  )
}
