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
  if (!mounted) return <div style={{ height: 300 }} className="bg-slate-50 rounded-xl animate-pulse" />
  const sorted = [...countries].sort((a, b) => b.scores.opportunity - a.scores.opportunity)

  const names = sorted.map((c) => `${c.flag_emoji} ${c.name}`)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      textStyle: { fontFamily: 'inherit', fontSize: 12 },
    },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#64748b', fontSize: 11, fontFamily: 'inherit' },
      data: ['Need', 'Opportunity', 'Stability'],
    },
    grid: { left: 16, right: 16, bottom: 8, top: 36, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'inherit' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
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
        barMaxWidth: 10,
        itemStyle: { color: '#fca5a5', borderRadius: [0, 4, 4, 0] },
        data: sorted.map((c) => c.scores.need),
      },
      {
        name: 'Opportunity',
        type: 'bar',
        barMaxWidth: 10,
        itemStyle: { color: '#93c5fd', borderRadius: [0, 4, 4, 0] },
        data: sorted.map((c) => c.scores.opportunity),
      },
      {
        name: 'Stability',
        type: 'bar',
        barMaxWidth: 10,
        itemStyle: { color: '#6ee7b7', borderRadius: [0, 4, 4, 0] },
        data: sorted.map((c) => c.scores.stability),
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 300 }}
      opts={{ renderer: 'svg' }}
    />
  )
}
