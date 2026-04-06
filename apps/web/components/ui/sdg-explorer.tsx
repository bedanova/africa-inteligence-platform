'use client'

import { useState } from 'react'
import { Minus, Plus, X, ChevronRight } from 'lucide-react'
import { CountryFlag } from '@/components/ui/country-flag'
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
      'What are CO₂ emissions per capita and is the trend improving?',
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
  display: DisplayType // 'percent' = absolute bar 0–100, 'rate' = ranked list with color badge
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
    { key: 'co2_per_capita',        label: 'CO₂ emissions per capita (tonnes)',     higherIsBetter: false, source: 'World Bank', display: 'rate',    unit: 't/cap' },
  ],
  13: [
    { key: 'co2_per_capita', label: 'CO₂ emissions per capita (tonnes)', higherIsBetter: false, source: 'World Bank', display: 'rate', unit: 't/cap' },
  ],
  14: [
    { key: 'marine_protected_areas', label: 'Marine protected areas (% of territorial waters)', higherIsBetter: true, source: 'World Bank', display: 'percent', unit: '%' },
  ],
  15: [
    { key: 'forest_area',    label: 'Forest area (% of land area)',               higherIsBetter: true, source: 'World Bank', display: 'percent', unit: '%' },
    { key: 'protected_areas', label: 'Protected areas (% of total territory)',    higherIsBetter: true, source: 'World Bank', display: 'percent', unit: '%' },
  ],
  16: [
    { key: 'score_stability',     label: 'Governance & peace score (0–100)',    higherIsBetter: true, source: 'Platform composite', display: 'percent', unit: '/100' },
    { key: 'political_stability', label: 'Political stability index (0–100)',   higherIsBetter: true, source: 'World Bank WGI',     display: 'percent', unit: '/100' },
    { key: 'conflict_deaths',     label: 'Conflict-related deaths (per 100k)', higherIsBetter: false, source: 'UN SDG',            display: 'rate',    unit: 'per 100k' },
  ],
  17: [
    { key: 'fdi', label: 'FDI net inflows (% of GDP) — investment proxy', higherIsBetter: true, source: 'World Bank', display: 'rate', unit: '% GDP' },
  ],
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
                  <span className="text-slate-300 mt-0.5 flex-shrink-0">›</span>
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

export function SDGExplorer({ countries, metrics }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const goalMetrics = selected ? SDG_METRICS[selected] : undefined
  const selectedGoal = selected ? GOALS[selected - 1] : undefined

  return (
    <div>
      {/* Goal tiles — all 17 are clickable */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {GOALS.map(({ n, label, color }) => {
          const isSelected = selected === n
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
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 w-fit border border-emerald-100">Live data</span>
            </button>
          )
        })}
      </div>

      {/* Detail panel */}
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

          {/* Education panel — always shown, collapsed by default */}
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
                  }
                }
                // political_stability from WGI is stored as raw -2.5→+2.5 in metrics — normalize to 0-100
                if (key === 'political_stability') {
                  const raw = (metrics[c.iso3] ?? []).find((x) => x.key === 'political_stability')
                  if (raw) {
                    const normalized = Math.min(100, Math.max(0, Math.round((Number(raw.value) + 2.5) * 20)))
                    return { country: c, metric: { ...raw, value: normalized, unit: '/100' } as CountryMetric }
                  }
                  return { country: c, metric: undefined }
                }
                const m = (metrics[c.iso3] ?? []).find((x) => x.key === key)
                return { country: c, metric: m }
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

              const values = rows.map((r) => r.metric!.value as number)
              const max = Math.max(...values)
              const min = Math.min(...values)
              const range = max - min || 1

              return (
                <div key={key}>
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                    <span className="text-[11px] text-slate-400">{source} · {higherIsBetter ? 'higher = better ↑' : 'lower = better ↓'}</span>
                  </div>

                  {display === 'percent' ? (
                    /* ── Percentage bar chart (absolute scale 0–100) ── */
                    <div className="space-y-2.5">
                      {rows.map(({ country, metric }, rank) => {
                        const val = metric!.value as number
                        const goodPct = higherIsBetter ? val : 100 - val
                        const { dot } = perfColor(goodPct)
                        // bar = absolute value (0–100 scale)
                        const barWidth = Math.min(100, Math.max(2, Math.abs(val)))
                        return (
                          <div key={country.iso3} className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-slate-300 w-4 text-right flex-shrink-0">{rank + 1}</span>
                            <CountryFlag iso3={country.iso3} countryName={country.name} size="sm" />
                            <span className="text-xs text-slate-600 w-24 flex-shrink-0 truncate">{country.name}</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, backgroundColor: dot }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 w-14 text-right flex-shrink-0">
                              {val.toFixed(1)}{unit ? ` ${unit}` : ''}
                            </span>
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
                    /* ── Rate / non-percentage: ranked cards ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rows.map(({ country, metric }, rank) => {
                        const val = metric!.value as number
                        const rawPct = ((val - min) / range) * 100
                        const goodPct = higherIsBetter ? rawPct : 100 - rawPct
                        const { bg, text, dot } = perfColor(goodPct)
                        return (
                          <div key={country.iso3} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
                            <span className="text-[11px] font-bold text-slate-300 w-4 flex-shrink-0">{rank + 1}</span>
                            <CountryFlag iso3={country.iso3} countryName={country.name} size="sm" />
                            <span className="text-sm text-slate-700 flex-1 truncate">{country.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
                              <span
                                className="text-sm font-bold px-2 py-0.5 rounded-lg"
                                style={{ backgroundColor: bg, color: text }}
                              >
                                {val % 1 === 0 ? val : val.toFixed(1)}
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
        <span className="text-xs text-slate-400">· Ranked best to worst within platform countries</span>
      </div>

    </div>
  )
}
