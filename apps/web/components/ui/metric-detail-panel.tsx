'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { X, TrendingUp, Calendar } from 'lucide-react'
import { cn, formatNum } from '@/lib/utils'
import type { CountryMetric } from '@/types'

// Dynamically load ECharts to avoid SSR issues
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

interface HistoryPoint { year: number; value: number }
interface ComparisonPoint { year: number; value: number; name: string }

interface MetricHistoryResponse {
  key: string
  iso3: string
  label: string
  unit: string | null
  latestValue: number | null
  latestYear: number | null
  hasComparison: boolean
  countryHistory: HistoryPoint[]
  comparisons: {
    GBR: ComparisonPoint[]
    EUU: ComparisonPoint[]
  }
}

interface MetricDetailPanelProps {
  metric: CountryMetric
  iso3: string
  countryName: string
  onClose: () => void
}

type TimeRange = '5Y' | '10Y' | 'All'
const CURRENT_YEAR = new Date().getFullYear()

function filterByRange(data: { year: number; value: number }[], range: TimeRange) {
  if (range === 'All') return data
  const cutoff = CURRENT_YEAR - (range === '5Y' ? 5 : 10)
  return data.filter((d) => d.year >= cutoff)
}

export function MetricDetailPanel({ metric, iso3, countryName, onClose }: MetricDetailPanelProps) {
  const [data, setData] = useState<MetricHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('10Y')
  const [showUK, setShowUK] = useState(false)
  const [showEU, setShowEU] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/v1/metric-history?key=${metric.key}&iso3=${iso3}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [metric.key, iso3])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const countryFiltered = data ? filterByRange(data.countryHistory, timeRange) : []
  const ukFiltered = data ? filterByRange(data.comparisons.GBR, timeRange) : []
  const euFiltered = data ? filterByRange(data.comparisons.EUU, timeRange) : []

  // Build year axis (union of all series years, sorted)
  const allYears = [
    ...countryFiltered.map((d) => d.year),
    ...(showUK ? ukFiltered.map((d) => d.year) : []),
    ...(showEU ? euFiltered.map((d) => d.year) : []),
  ]
  const years = [...new Set(allYears)].sort((a, b) => a - b).map(String)

  function seriesValues(pts: { year: number; value: number }[]) {
    const map = new Map(pts.map((p) => [String(p.year), p.value]))
    return years.map((y) => map.get(y) ?? null)
  }

  const unit = data?.unit ?? metric.unit ?? ''

  const echartsOption = {
    backgroundColor: 'transparent',
    grid: { top: 40, right: 24, bottom: 48, left: 56 },
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any[]) => {
        const lines = params
          .filter((p: { value: number | null }) => p.value != null)
          .map((p: { seriesName: string; value: number; axisValue: string }) => `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${
            p.seriesName === countryName ? '#3b82f6' :
            p.seriesName === 'United Kingdom' ? '#f97316' : '#22c55e'
          };margin-right:6px"></span>${p.seriesName}: <b>${formatNum(p.value)}</b>${unit ? ' ' + unit : ''}`)
          .join('<br/>')
        return `<div style="font-size:12px"><b>${params[0]?.axisValue}</b><br/>${lines}</div>`
      },
    },
    legend: {
      show: showUK || showEU,
      top: 8,
      textStyle: { fontSize: 11, color: '#64748b' },
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLabel: { fontSize: 11, color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: unit || undefined,
      nameTextStyle: { fontSize: 10, color: '#94a3b8', padding: [0, 0, 0, 0] },
      axisLabel: {
        fontSize: 10,
        color: '#94a3b8',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (v: any) => formatNum(Number(v)),
      },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        name: countryName,
        type: 'line',
        data: seriesValues(countryFiltered),
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#3b82f6', width: 2.5 },
        itemStyle: { color: '#3b82f6' },
        connectNulls: false,
      },
      ...(showUK && ukFiltered.length > 0 ? [{
        name: 'United Kingdom',
        type: 'line',
        data: seriesValues(ukFiltered),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#f97316', width: 2, type: 'dashed' as const },
        itemStyle: { color: '#f97316' },
        connectNulls: false,
      }] : []),
      ...(showEU && euFiltered.length > 0 ? [{
        name: 'European Union',
        type: 'line',
        data: seriesValues(euFiltered),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#22c55e', width: 2, type: 'dashed' as const },
        itemStyle: { color: '#22c55e' },
        connectNulls: false,
      }] : []),
    ],
  }

  const hasHistory = countryFiltered.length >= 2
  const yearRange = hasHistory
    ? `${countryFiltered[0].year}–${countryFiltered[countryFiltered.length - 1].year}`
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Detail: ${metric.label}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
              {iso3} · {metric.source}
            </p>
            <h2 className="text-lg font-bold text-slate-900">{metric.label}</h2>
            {yearRange && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {yearRange} · {countryFiltered.length} data points
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0 mt-0.5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current value + trend */}
        <div className="flex items-center gap-6 px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div>
            <p className="text-3xl font-bold text-slate-900 tabular-nums">
              {data?.latestValue != null ? formatNum(data.latestValue) : '—'}
              {unit && <span className="text-base font-medium text-slate-400 ml-1">{unit}</span>}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Latest value · {data?.latestYear ?? '—'}</p>
          </div>
          {hasHistory && (() => {
            const first = countryFiltered[0].value
            const last = countryFiltered[countryFiltered.length - 1].value
            const pct = ((last - first) / Math.abs(first)) * 100
            const up = last >= first
            return (
              <div className={cn('flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5',
                up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                <TrendingUp className={cn('w-4 h-4', !up && 'rotate-180')} />
                {up ? '+' : ''}{pct.toFixed(1)}% over period
              </div>
            )
          })()}
        </div>

        {/* Controls: time range + comparison */}
        <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-slate-100">
          {/* Time range */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {(['5Y', '10Y', 'All'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                  timeRange === r
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Comparison toggles */}
          {data?.hasComparison && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Compare:</span>
              <button
                onClick={() => setShowUK((v) => !v)}
                className={cn(
                  'px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors',
                  showUK
                    ? 'bg-orange-50 border-orange-300 text-orange-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                )}
              >
                🇬🇧 UK
              </button>
              <button
                onClick={() => setShowEU((v) => !v)}
                className={cn(
                  'px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors',
                  showEU
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                )}
              >
                🇪🇺 EU
              </button>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="flex-1 px-2 py-4 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
          )}
          {!loading && !hasHistory && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <TrendingUp className="w-10 h-10 opacity-30" />
              <p className="text-sm">No historical data available yet.</p>
              <p className="text-xs">Run /api/ingest/history to populate.</p>
            </div>
          )}
          {!loading && hasHistory && (
            <ReactECharts
              option={echartsOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          )}
        </div>

        {/* Context / source footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500 leading-relaxed">
            Source: <span className="font-medium">{metric.source}</span>
            {metric.source_year ? ` · ${metric.source_year}` : ''}
            {' · '}Comparison data: World Bank Open Data (CC BY 4.0)
          </p>
        </div>
      </div>
    </>
  )
}
