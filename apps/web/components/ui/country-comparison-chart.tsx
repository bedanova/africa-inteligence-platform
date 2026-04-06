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

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      textStyle: { fontFamily: 'inherit', fontSize: 12 },
      formatter: (params: { seriesName: string; value: number; marker: string }[]) =>
        params.map((p) => `${p.marker} ${p.seriesName}: <b>${p.value}</b>`).join('<br/>'),
    },
    legend: {
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 20,
      textStyle: { color: '#64748b', fontSize: 11, fontFamily: 'inherit' },
      data: ['Need', 'Opportunity', 'Stability'],
    },
    grid: { left: 8, right: 8, bottom: 40, top: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: '#334155', fontSize: 11, fontFamily: 'inherit', interval: 0 },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 25,
      axisLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'inherit' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: 'Need',
        type: 'bar',
        barMaxWidth: 18,
        barCategoryGap: '30%',
        barGap: '6%',
        itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top', color: '#94a3b8', fontSize: 10, fontFamily: 'inherit' },
        data: sorted.map((c) => c.scores.need),
      },
      {
        name: 'Opportunity',
        type: 'bar',
        barMaxWidth: 18,
        barGap: '6%',
        itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top', color: '#94a3b8', fontSize: 10, fontFamily: 'inherit' },
        data: sorted.map((c) => c.scores.opportunity),
      },
      {
        name: 'Stability',
        type: 'bar',
        barMaxWidth: 18,
        barGap: '6%',
        itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top', color: '#94a3b8', fontSize: 10, fontFamily: 'inherit' },
        data: sorted.map((c) => c.scores.stability),
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 320 }}
      opts={{ renderer: 'svg' }}
    />
  )
}
