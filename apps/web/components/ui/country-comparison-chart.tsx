'use client'

import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { CountrySummary } from '@/types'

interface Props {
  countries: CountrySummary[]
}

export function CountryComparisonChart({ countries }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div style={{ height: 360 }} className="bg-slate-50 rounded-xl animate-pulse" />

  // Sort by need score descending
  const sorted = [...countries].sort((a, b) => b.scores.need - a.scores.need)
  const names = sorted.map((c) => `${c.flag_emoji} ${c.name}`)
  const height = Math.max(360, sorted.length * 58 + 48)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      textStyle: { fontFamily: 'inherit', fontSize: 12 },
      formatter: (params: { seriesName: string; value: number; marker: string }[]) =>
        params.map((p) => `${p.marker} ${p.seriesName}: <b>${p.value}</b>`).join('<br/>'),
    },
    legend: {
      top: 4,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      textStyle: { color: '#64748b', fontSize: 11, fontFamily: 'inherit' },
      data: ['Need', 'Opportunity', 'Stability'],
    },
    grid: { left: 12, right: 40, bottom: 8, top: 36, containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 25,
      axisLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'inherit', formatter: '{value}' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: '#334155', fontSize: 12, fontFamily: 'inherit' },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        name: 'Need',
        type: 'bar',
        barMaxWidth: 14,
        barCategoryGap: '35%',
        barGap: '8%',
        itemStyle: { color: '#ef4444', borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: '#94a3b8', fontSize: 10, fontFamily: 'inherit' },
        data: sorted.map((c) => c.scores.need),
      },
      {
        name: 'Opportunity',
        type: 'bar',
        barMaxWidth: 14,
        barGap: '8%',
        itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: '#94a3b8', fontSize: 10, fontFamily: 'inherit' },
        data: sorted.map((c) => c.scores.opportunity),
      },
      {
        name: 'Stability',
        type: 'bar',
        barMaxWidth: 14,
        barGap: '8%',
        itemStyle: { color: '#10b981', borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: '#94a3b8', fontSize: 10, fontFamily: 'inherit' },
        data: sorted.map((c) => c.scores.stability),
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      opts={{ renderer: 'svg' }}
    />
  )
}
