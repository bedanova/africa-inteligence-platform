'use client'

import dynamic from 'next/dynamic'
import { CountryFlag } from '@/components/ui/country-flag'
import { cn } from '@/lib/utils'
import type { Organization, ActionCard, CountrySummary } from '@/types'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

interface Props {
  orgs: Organization[]
  actions: ActionCard[]
  countries?: CountrySummary[]
}

const ACTION_COLORS: Record<string, string> = {
  donate:    '#22c55e',
  volunteer: '#3b82f6',
  invest:    '#8b5cf6',
  learn:     '#f59e0b',
}

export function ImpactCharts({ orgs, actions, countries = [] }: Props) {
  // Actions by type
  const byType = ['donate', 'volunteer', 'invest', 'learn'].map((t) => ({
    name: t.charAt(0).toUpperCase() + t.slice(1),
    value: actions.filter((a) => a.type === t).length,
  }))

  // Actions by country
  const countryCounts: Record<string, number> = {}
  actions.forEach((a) => {
    if (a.country_iso3) countryCounts[a.country_iso3] = (countryCounts[a.country_iso3] ?? 0) + 1
  })
  const byCountry = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([iso3, count]) => ({ iso3, count }))

  const NAMES: Record<string, string> = {
    KEN: 'Kenya', NGA: 'Nigeria', ETH: 'Ethiopia', GHA: 'Ghana',
    ZAF: 'South Africa', TZA: 'Tanzania', RWA: 'Rwanda', SEN: 'Senegal',
  }

  // Sectors by org count
  const sectorCounts: Record<string, number> = {}
  orgs.forEach((o) => o.sectors.forEach((s) => {
    sectorCounts[s] = (sectorCounts[s] ?? 0) + 1
  }))
  const bySector = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Verification tier breakdown
  const tierCounts = { A: 0, B: 0, C: 0 }
  orgs.forEach((o) => { if (o.verification_tier in tierCounts) tierCounts[o.verification_tier as 'A'|'B'|'C']++ })

  const donutOption = {
    tooltip: { trigger: 'item', textStyle: { fontFamily: 'inherit', fontSize: 12 } },
    legend: { bottom: 0, textStyle: { color: '#64748b', fontFamily: 'inherit', fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '44%'],
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', fontFamily: 'inherit' } },
      data: byType.map((d) => ({ ...d, itemStyle: { color: ACTION_COLORS[d.name.toLowerCase()] } })),
    }],
  }


  return (
    <div className="space-y-8">
      {/* Action type breakdown + tier */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Actions by Type</h3>
          <ReactECharts option={donutOption} style={{ height: 240 }} opts={{ renderer: 'svg' }} />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Partner Verification</h3>
          <div className="space-y-3 mt-6">
            {[
              { tier: 'A', label: 'Tier A — Full audit trail', color: '#22c55e', count: tierCounts.A },
              { tier: 'B', label: 'Tier B — Verified mission', color: '#3b82f6', count: tierCounts.B },
              { tier: 'C', label: 'Tier C — Basic verification', color: '#94a3b8', count: tierCounts.C },
            ].map(({ tier, label, color, count }) => (
              <div key={tier} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                  {tier}
                </div>
                <span className="text-sm text-slate-600 flex-1">{label}</span>
                <span className="text-2xl font-bold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">All {orgs.length} partners independently reviewed by editorial team.</p>
        </div>
      </div>

      {/* Actions per country */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Actions per Country</h3>
        <div className="space-y-2">
          {byCountry.map(({ iso3, count }) => (
            <div key={iso3} className="flex items-center gap-3">
              <CountryFlag iso3={iso3} size="sm" />
              <span className="text-sm text-slate-600 w-28 flex-shrink-0">{NAMES[iso3] ?? iso3}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-blue-400 transition-all duration-500"
                  style={{ width: `${Math.round((count / (byCountry[0]?.count ?? 1)) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-700 w-6 text-right flex-shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sector coverage */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Sector Coverage — Partners per Sector</h3>
        <div className="flex flex-wrap gap-2">
          {bySector.map(([sector, count]) => (
            <div key={sector} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              <span className="text-lg font-bold text-violet-600">{count}</span>
              <span className="text-xs text-slate-600">{sector}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Gaps */}
      {countries.length > 0 && (() => {
        const gapData = countries
          .map((c) => ({
            iso3: c.iso3, name: c.name, need: Math.round(c.scores.need),
            actionCount: actions.filter((a) => a.country_iso3 === c.iso3).length,
          }))
          .filter(({ need }) => need >= 55)
          .sort((a, b) => (b.need - b.actionCount * 8) - (a.need - a.actionCount * 8))
          .slice(0, 8)

        return (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Coverage Gaps</h3>
            <p className="text-xs text-slate-400 mb-4">High-need countries with the fewest verified actions — where your support is most impactful.</p>
            <div className="space-y-3">
              {gapData.map(({ iso3, name, need, actionCount }) => (
                <div key={iso3} className="flex items-center gap-3">
                  <CountryFlag iso3={iso3} size="sm" />
                  <a href={`/countries/${iso3.toLowerCase()}`} className="text-sm text-slate-700 hover:text-blue-600 w-28 flex-shrink-0 truncate font-medium">
                    {name}
                  </a>
                  <div className="flex-1 relative bg-slate-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${need}%`, backgroundColor: need >= 70 ? '#ef4444' : need >= 55 ? '#f97316' : '#eab308', opacity: 0.7 }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-semibold text-slate-700">
                      Need {need}
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
                    actionCount === 0 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  )}>
                    {actionCount === 0 ? 'No actions' : `${actionCount} action${actionCount !== 1 ? 's' : ''}`}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4">
              <a href="/action" className="text-blue-500 hover:underline">Browse all actions →</a>
              {' '}or{' '}
              <a href="/partners" className="text-blue-500 hover:underline">view all partners →</a>
            </p>
          </div>
        )
      })()}

      {/* SDG Coverage */}
      {(() => {
        const SDG_LABELS: Record<number, string> = {
          1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health', 4: 'Quality Education',
          5: 'Gender Equality', 6: 'Clean Water', 7: 'Affordable Energy', 8: 'Decent Work',
          9: 'Innovation', 10: 'Reduced Inequalities', 11: 'Sustainable Cities',
          12: 'Responsible Consumption', 13: 'Climate Action', 14: 'Life Below Water',
          15: 'Life on Land', 16: 'Peace & Justice', 17: 'Partnerships',
        }

        const SDG_COLORS: Record<number, string> = {
          1: '#e5243b', 2: '#dda63a', 3: '#4c9f38', 4: '#c5192d', 5: '#ff3a21',
          6: '#26bde2', 7: '#fcc30b', 8: '#a21942', 9: '#fd6925', 10: '#dd1367',
          11: '#fd9d24', 12: '#bf8b2e', 13: '#3f7e44', 14: '#0a97d9', 15: '#56c02b',
          16: '#00689d', 17: '#19486a',
        }

        const sdgCoverage: Record<number, number> = {}
        orgs.forEach((o) => (o.sdg_tags ?? []).forEach((n) => { sdgCoverage[n] = (sdgCoverage[n] ?? 0) + 1 }))

        return (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">SDG Coverage by Partner Ecosystem</h3>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {Array.from({ length: 17 }, (_, i) => i + 1).map((n) => {
                const count = sdgCoverage[n] ?? 0
                const covered = count > 0
                return (
                  <div
                    key={n}
                    title={`SDG ${n}: ${SDG_LABELS[n]} — ${count} partner${count !== 1 ? 's' : ''}`}
                    className="flex flex-col items-center gap-1 rounded-lg p-2 cursor-default transition-opacity"
                    style={{ backgroundColor: covered ? SDG_COLORS[n] + '18' : '#f8fafc', opacity: covered ? 1 : 0.4 }}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: covered ? SDG_COLORS[n] : '#cbd5e1' }}
                    >
                      {n}
                    </div>
                    {covered && <span className="text-[10px] font-semibold text-slate-600">{count}</span>}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              {Object.keys(sdgCoverage).length} of 17 SDGs covered · faded tiles = no active partners yet
            </p>
          </div>
        )
      })()}

      {/* Partner cards */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">All Verified Partners</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {orgs.map((org) => {
            const orgActions = actions.filter((a) => a.org_id === org.id)
            return (
              <div key={org.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{org.name}</p>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      backgroundColor: org.verification_tier === 'A' ? '#dcfce7' : '#dbeafe',
                      color: org.verification_tier === 'A' ? '#16a34a' : '#1d4ed8',
                    }}
                  >
                    {org.verification_tier}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{org.mission}</p>
                <div className="flex flex-wrap gap-1">
                  {org.action_types.map((t) => (
                    <span key={t} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border" style={{ color: ACTION_COLORS[t], borderColor: ACTION_COLORS[t] + '44', backgroundColor: ACTION_COLORS[t] + '11' }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">{orgActions.length} action{orgActions.length !== 1 ? 's' : ''} · {org.countries.length} countr{org.countries.length !== 1 ? 'ies' : 'y'}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
