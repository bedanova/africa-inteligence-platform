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

// Mapping from SDG number to our metric keys
const SDG_METRICS: Record<number, { key: string; label: string; higherIsBetter: boolean }[]> = {
  3: [
    { key: 'life_expectancy',    label: 'Life expectancy (years)',       higherIsBetter: true  },
    { key: 'maternal_mortality', label: 'Maternal mortality (per 100k)', higherIsBetter: false },
    { key: 'mortality_u5',       label: 'Under-5 mortality (per 1k)',    higherIsBetter: false },
  ],
  7: [
    { key: 'electricity_access', label: 'Electricity access (%)',        higherIsBetter: true  },
  ],
  8: [
    { key: 'gdp_growth',         label: 'GDP growth (%)',                higherIsBetter: true  },
  ],
  9: [
    { key: 'internet_access',    label: 'Internet access (%)',           higherIsBetter: true  },
  ],
}

interface Props {
  countries: CountrySummary[]
  metrics: Record<string, CountryMetric[]> // iso3 → metrics
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
                  : 'border-slate-100 shadow-sm opacity-50 cursor-not-allowed'
              }`}
              title={active ? label : 'Data coming in Phase 3'}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {n}
              </div>
              <p className="text-xs font-medium text-slate-700 leading-snug">{label}</p>
              {active && (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 w-fit">
                  Live data
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Detail panel */}
      {selected && goalMetrics && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base"
              style={{ backgroundColor: GOALS[selected - 1].color }}
            >
              {selected}
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">SDG {selected} — {GOALS[selected - 1].label}</h2>
              <p className="text-xs text-slate-400">Live data from World Bank & WHO</p>
            </div>
          </div>

          {goalMetrics.map(({ key, label, higherIsBetter }) => {
            const rows = countries
              .map((c) => {
                const m = (metrics[c.iso3] ?? []).find((x) => x.key === key)
                return { country: c, metric: m }
              })
              .filter((r) => r.metric != null)
              .sort((a, b) =>
                higherIsBetter
                  ? (b.metric!.value as number) - (a.metric!.value as number)
                  : (a.metric!.value as number) - (b.metric!.value as number)
              )

            if (rows.length === 0) return null

            const values = rows.map((r) => r.metric!.value as number)
            const max = Math.max(...values)
            const min = Math.min(...values)

            return (
              <div key={key} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-slate-600 mb-3">{label}</h3>
                <div className="space-y-2">
                  {rows.map(({ country, metric }) => {
                    const val = metric!.value as number
                    const pct = max === min ? 100 : ((val - min) / (max - min)) * 100
                    const barPct = higherIsBetter ? pct : 100 - pct
                    return (
                      <div key={country.iso3} className="flex items-center gap-3">
                        <span className="text-sm w-5">{country.flag_emoji}</span>
                        <span className="text-xs text-slate-600 w-28 truncate">{country.name}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${Math.max(4, barPct)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-700 w-16 text-right">
                          {typeof val === 'number' ? val.toFixed(1) : val}
                          {metric!.unit ? ` ${metric!.unit}` : ''}
                        </span>
                        <span className="text-[10px] text-slate-400 w-10 text-right">{metric!.source_year}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg">
        <p className="text-sm font-semibold text-blue-800 mb-1">SDGs 1, 2, 4, 5, 6, 10–15, 17</p>
        <p className="text-sm text-blue-700">
          Additional SDG indicators coming in Phase 3 — linked to UN SDG API, UNICEF, and FAO data sources.
        </p>
      </div>
    </div>
  )
}
