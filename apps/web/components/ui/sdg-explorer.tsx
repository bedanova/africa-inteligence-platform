'use client'

import { useState } from 'react'
import type { CountrySummary, CountryMetric } from '@/types'

const GOALS = [
  { n: 1,  label: 'No Poverty',              color: '#e5243b' },
  { n: 2,  label: 'Zero Hunger',             color: '#dda63a' },
  { n: 3,  label: 'Good Health',             color: '#4c9f38' },
  { n: 4,  label: 'Quality Education',       color: '#c5192d' },
  { n: 5,  label: 'Gender Equality',         color: '#ff3a21' },
  { n: 6,  label: 'Clean Water',             color: '#26bde2' },
  { n: 7,  label: 'Affordable Energy',       color: '#fcc30b' },
  { n: 8,  label: 'Decent Work',             color: '#a21942' },
  { n: 9,  label: 'Industry & Innovation',   color: '#fd6925' },
  { n: 10, label: 'Reduced Inequalities',    color: '#dd1367' },
  { n: 11, label: 'Sustainable Cities',      color: '#fd9d24' },
  { n: 12, label: 'Responsible Consumption', color: '#bf8b2e' },
  { n: 13, label: 'Climate Action',          color: '#3f7e44' },
  { n: 14, label: 'Life Below Water',        color: '#0a97d9' },
  { n: 15, label: 'Life on Land',            color: '#56c02b' },
  { n: 16, label: 'Peace & Justice',         color: '#00689d' },
  { n: 17, label: 'Partnerships',            color: '#19486a' },
]

interface MetricDef {
  key: string
  label: string
  // "good" direction: higher = good → green bar at high values
  //                   lower = good → green at low values, red at high
  higherIsBetter: boolean
  source: string
}

// Maps SDG number → relevant metric keys from our DB
const SDG_METRICS: Record<number, MetricDef[]> = {
  1: [
    { key: 'gdp_growth', label: 'GDP growth rate (% annual)', higherIsBetter: true, source: 'World Bank' },
  ],
  2: [
    { key: 'mortality_u5', label: 'Under-5 mortality (per 1,000 live births)', higherIsBetter: false, source: 'World Bank' },
  ],
  3: [
    { key: 'life_expectancy',    label: 'Life expectancy at birth (years)',           higherIsBetter: true,  source: 'WHO GHO' },
    { key: 'maternal_mortality', label: 'Maternal mortality ratio (per 100k births)', higherIsBetter: false, source: 'WHO GHO' },
    { key: 'mortality_u5',       label: 'Under-5 mortality (per 1,000 live births)',  higherIsBetter: false, source: 'World Bank' },
  ],
  7: [
    { key: 'electricity_access', label: 'Population with electricity access (%)', higherIsBetter: true, source: 'UN SDG' },
  ],
  8: [
    { key: 'gdp_growth',     label: 'GDP growth rate (% annual)',    higherIsBetter: true, source: 'World Bank' },
  ],
  9: [
    { key: 'internet_access', label: 'Internet users (% of population)', higherIsBetter: true, source: 'World Bank' },
  ],
  16: [
    { key: 'score_stability', label: 'Governance & peace score (0–100)', higherIsBetter: true, source: 'Platform composite' },
  ],
}

interface Props {
  countries: CountrySummary[]
  metrics: Record<string, CountryMetric[]>
}

function getBarColor(pctGood: number): string {
  if (pctGood >= 70) return '#22c55e' // green
  if (pctGood >= 40) return '#f59e0b' // amber
  return '#ef4444'                     // red
}

export function SDGExplorer({ countries, metrics }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  const goalMetrics = selected ? SDG_METRICS[selected] : undefined
  const hasData = (n: number) => !!SDG_METRICS[n]

  return (
    <div>
      {/* Goal tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {GOALS.map(({ n, label, color }) => {
          const active = hasData(n)
          const isSelected = selected === n
          return (
            <button
              key={n}
              onClick={() => active ? setSelected(isSelected ? null : n) : undefined}
              className={`bg-white rounded-xl border text-left p-4 flex flex-col gap-2 transition-all ${
                active
                  ? isSelected
                    ? 'border-slate-400 shadow-md ring-2 ring-slate-300'
                    : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300 cursor-pointer'
                  : 'border-slate-100 shadow-sm opacity-40 cursor-not-allowed'
              }`}
              title={active ? `Click to expand ${label}` : 'Data coming in Phase 3'}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {n}
              </div>
              <p className="text-xs font-medium text-slate-700 leading-snug">{label}</p>
              {active && (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 w-fit border border-emerald-100">
                  Live data ↗
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Detail panel */}
      {selected && goalMetrics && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
              style={{ backgroundColor: GOALS[selected - 1].color }}
            >
              {selected}
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">SDG {selected} — {GOALS[selected - 1].label}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {goalMetrics.map(m => m.source).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="ml-auto text-slate-300 hover:text-slate-500 text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-8">
            {goalMetrics.map(({ key, label, higherIsBetter, source }) => {
              const rows = countries
                .map((c) => {
                  // Special virtual metrics derived from country scores
                  if (key === 'score_stability') {
                    return {
                      country: c,
                      metric: { key, label, value: c.scores.stability, unit: '/100', source, source_year: new Date().getFullYear(), freshness: 'fresh' } as CountryMetric,
                    }
                  }
                  const m = (metrics[c.iso3] ?? []).find((x) => x.key === key)
                  return { country: c, metric: m }
                })
                .filter((r) => r.metric != null)
                // Sort best performers first
                .sort((a, b) =>
                  higherIsBetter
                    ? (b.metric!.value as number) - (a.metric!.value as number)
                    : (a.metric!.value as number) - (b.metric!.value as number)
                )

              if (rows.length === 0) {
                return (
                  <div key={key}>
                    <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
                    <p className="text-xs text-slate-400">No data available yet — will populate after next ingest.</p>
                  </div>
                )
              }

              const values = rows.map((r) => r.metric!.value as number)
              const max = Math.max(...values)
              const min = Math.min(...values)
              const range = max - min || 1

              return (
                <div key={key}>
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                    <span className="text-[11px] text-slate-400">{source} · {higherIsBetter ? 'higher = better' : 'lower = better'}</span>
                  </div>
                  <div className="space-y-2.5">
                    {rows.map(({ country, metric }, rank) => {
                      const val = metric!.value as number
                      // barPct: raw proportion of the value within the range (0–100%)
                      const rawPct = ((val - min) / range) * 100
                      // goodPct: how "good" this value is (0=worst, 100=best)
                      const goodPct = higherIsBetter ? rawPct : 100 - rawPct
                      const barColor = getBarColor(goodPct)
                      // bar width = rawPct so it reflects the actual value scale
                      const barWidth = Math.max(3, rawPct)

                      return (
                        <div key={country.iso3} className="flex items-center gap-3">
                          <span className="text-[11px] font-bold text-slate-300 w-4 text-right flex-shrink-0">
                            {rank + 1}
                          </span>
                          <span className="text-base leading-none flex-shrink-0">{country.flag_emoji}</span>
                          <span className="text-xs text-slate-600 w-24 flex-shrink-0 truncate">{country.name}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 w-20 text-right flex-shrink-0">
                            {val.toFixed(val % 1 === 0 ? 0 : 1)}
                            {metric!.unit ? ` ${metric!.unit}` : ''}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {/* Scale reference */}
                  <div className="flex justify-between mt-1.5 px-8">
                    <span className="text-[10px] text-slate-300">
                      min {min.toFixed(min % 1 === 0 ? 0 : 1)}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      max {max.toFixed(max % 1 === 0 ? 0 : 1)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
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
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
        <span className="text-xs text-slate-400">· Best performers ranked first</span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg">
        <p className="text-sm font-semibold text-blue-800 mb-1">SDGs 4, 5, 6, 10–15, 17</p>
        <p className="text-sm text-blue-700">
          Additional indicators coming in Phase 3 — UNICEF, FAO, and UN SDG API data sources.
        </p>
      </div>
    </div>
  )
}
