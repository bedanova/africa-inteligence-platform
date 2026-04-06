'use client'

import dynamic from 'next/dynamic'
import type { CountrySummary } from '@/types'

const ScoreGaugeChartInner = dynamic(
  () => import('./score-gauge-chart').then((m) => m.ScoreGaugeChart),
  { ssr: false }
)

const CountryComparisonChartInner = dynamic(
  () => import('./country-comparison-chart').then((m) => m.CountryComparisonChart),
  { ssr: false }
)

const AfricaMapInner = dynamic(
  () => import('./africa-map-inner').then((m) => m.AfricaMapInner),
  { ssr: false }
)

export function ScoreGaugeChart(props: { need: number; opportunity: number; stability: number }) {
  return <ScoreGaugeChartInner {...props} />
}

export function CountryComparisonChart(props: { countries: CountrySummary[] }) {
  return <CountryComparisonChartInner {...props} />
}

export function AfricaMap(props: { countries: CountrySummary[] }) {
  return <AfricaMapInner {...props} />
}
