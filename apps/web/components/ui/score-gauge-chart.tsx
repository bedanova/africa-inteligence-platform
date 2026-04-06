'use client'

import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'

interface Props {
  need: number
  opportunity: number
  stability: number
}

function gaugeOption(label: string, value: number, color: string) {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        radius: '88%',
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: { color },
        },
        axisLine: {
          lineStyle: { width: 10, color: [[1, '#f1f5f9']] },
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        data: [
          {
            value,
            name: label,
            title: {
              offsetCenter: ['0%', '15%'],
              fontSize: 11,
              color: '#94a3b8',
              fontFamily: 'inherit',
            },
            detail: {
              valueAnimation: true,
              offsetCenter: ['0%', '-15%'],
              fontSize: 24,
              fontWeight: 700,
              color: '#0f172a',
              fontFamily: 'inherit',
              formatter: '{value}',
            },
          },
        ],
      },
    ],
  }
}

export function ScoreGaugeChart({ need, opportunity, stability }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const charts = [
    { label: 'Need', value: need, color: '#ef4444' },
    { label: 'Opportunity', value: opportunity, color: '#3b82f6' },
    { label: 'Stability', value: stability, color: '#10b981' },
  ]

  if (!mounted) return (
    <div className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-slate-50 rounded-xl p-2 animate-pulse" style={{ height: 140 }} />
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-3 gap-2">
      {charts.map(({ label, value, color }) => (
        <div key={label} className="bg-slate-50 rounded-xl p-2">
          <ReactECharts
            option={gaugeOption(label, value, color)}
            style={{ height: 140 }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      ))}
    </div>
  )
}
