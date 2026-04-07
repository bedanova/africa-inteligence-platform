'use client'

import { useState } from 'react'
import { MetricCard } from './metric-card'
import { MetricDetailPanel } from './metric-detail-panel'
import type { CountryMetric } from '@/types'

interface MetricsSectionProps {
  metrics: CountryMetric[]
  iso3: string
  countryName: string
}

export function MetricsSection({ metrics, iso3, countryName }: MetricsSectionProps) {
  const [selected, setSelected] = useState<CountryMetric | null>(null)

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-3">
        {metrics.map((m) => (
          <MetricCard
            key={m.key}
            metric={m}
            onClick={() => setSelected(m)}
            selected={selected?.key === m.key}
          />
        ))}
      </div>

      {selected && (
        <MetricDetailPanel
          metric={selected}
          iso3={iso3}
          countryName={countryName}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
