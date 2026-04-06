'use client'

import dynamic from 'next/dynamic'
import type { Organization, ActionCard } from '@/types'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

interface Props {
  orgs: Organization[]
  actions: ActionCard[]
}

const ACTION_COLORS: Record<string, string> = {
  donate:    '#22c55e',
  volunteer: '#3b82f6',
  invest:    '#8b5cf6',
  learn:     '#f59e0b',
}

export function ImpactCharts({ orgs, actions }: Props) {
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

  const FLAGS: Record<string, string> = {
    KEN: '🇰🇪', NGA: '🇳🇬', ETH: '🇪🇹', GHA: '🇬🇭',
    ZAF: '🇿🇦', TZA: '🇹🇿', RWA: '🇷🇼', SEN: '🇸🇳',
  }
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

  const countryOption = {
    tooltip: { trigger: 'axis', textStyle: { fontFamily: 'inherit', fontSize: 12 } },
    grid: { left: 12, right: 24, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontFamily: 'inherit', fontSize: 10 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
    yAxis: {
      type: 'category',
      data: byCountry.map((c) => `${FLAGS[c.iso3] ?? ''} ${NAMES[c.iso3] ?? c.iso3}`),
      axisLabel: { color: '#334155', fontFamily: 'inherit', fontSize: 12 },
      axisTick: { show: false }, axisLine: { show: false },
    },
    series: [{
      type: 'bar', barMaxWidth: 20,
      itemStyle: { color: '#3b82f6', borderRadius: [0, 6, 6, 0] },
      label: { show: true, position: 'right', color: '#334155', fontFamily: 'inherit', fontSize: 11 },
      data: byCountry.map((c) => c.count),
    }],
  }

  const sectorOption = {
    tooltip: { trigger: 'axis', textStyle: { fontFamily: 'inherit', fontSize: 12 } },
    grid: { left: 12, right: 24, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontFamily: 'inherit', fontSize: 10 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
    yAxis: {
      type: 'category',
      data: bySector.map(([s]) => s),
      axisLabel: { color: '#334155', fontFamily: 'inherit', fontSize: 11 },
      axisTick: { show: false }, axisLine: { show: false },
    },
    series: [{
      type: 'bar', barMaxWidth: 16,
      itemStyle: { color: '#8b5cf6', borderRadius: [0, 6, 6, 0] },
      label: { show: true, position: 'right', color: '#334155', fontFamily: 'inherit', fontSize: 11 },
      data: bySector.map(([, n]) => n),
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
        <ReactECharts option={countryOption} style={{ height: Math.max(180, byCountry.length * 40) }} opts={{ renderer: 'svg' }} />
      </div>

      {/* Sector coverage */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Sector Coverage — Partners per Sector</h3>
        <ReactECharts option={sectorOption} style={{ height: Math.max(180, bySector.length * 36) }} opts={{ renderer: 'svg' }} />
      </div>

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
