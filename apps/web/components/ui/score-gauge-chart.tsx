interface Props {
  need: number
  opportunity: number
  stability: number
}

interface ScoreRow {
  label: string
  value: number
  color: string
  bgColor: string
  borderColor: string
  annotation: string
  inverseLabel: string // what high score means
}

export function ScoreGaugeChart({ need, opportunity, stability }: Props) {
  const rows: ScoreRow[] = [
    {
      label: 'Need',
      value: need,
      color: '#ef4444',
      bgColor: 'bg-red-500',
      borderColor: 'border-red-200',
      annotation: 'Humanitarian & health pressure — higher = more urgent need for support',
      inverseLabel: need >= 70 ? 'High urgency' : need >= 45 ? 'Moderate' : 'Lower pressure',
    },
    {
      label: 'Opportunity',
      value: opportunity,
      color: '#22c55e',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-200',
      annotation: 'Economic growth, connectivity & investment signals — higher = stronger potential',
      inverseLabel: opportunity >= 65 ? 'Strong signals' : opportunity >= 45 ? 'Emerging' : 'Early stage',
    },
    {
      label: 'Stability',
      value: stability,
      color: '#3b82f6',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-200',
      annotation: 'Governance, peace & institutions — higher = more stable environment',
      inverseLabel: stability >= 65 ? 'Stable' : stability >= 45 ? 'Mixed signals' : 'Fragile',
    },
  ]

  return (
    <div className="space-y-5">
      {rows.map(({ label, value, bgColor, borderColor, annotation, inverseLabel }) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${borderColor} text-slate-600 bg-white`}>
                {inverseLabel}
              </span>
            </div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{value}<span className="text-sm font-normal text-slate-400">/100</span></span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${bgColor}`}
              style={{ width: `${value}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{annotation}</p>
        </div>
      ))}
      <p className="text-xs text-slate-300 border-t border-slate-100 pt-3 mt-2">
        Scores 0–100 · Composite of World Bank, WHO, and UN SDG data · Updated daily
      </p>
    </div>
  )
}
