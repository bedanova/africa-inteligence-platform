interface SparkLineProps {
  data: { year: number; value: number }[]
  className?: string
  color?: string
}

export function SparkLine({ data, className, color = 'currentColor' }: SparkLineProps) {
  if (data.length < 2) return null
  const sorted = [...data].sort((a, b) => a.year - b.year)
  const values = sorted.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 80
  const H = 28
  const pts = sorted
    .map((d, i) => {
      const x = (i / (sorted.length - 1)) * W
      const y = H - ((d.value - min) / range) * (H - 2) - 1
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const last = sorted[sorted.length - 1]
  const first = sorted[0]
  const isUp = last.value >= first.value

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-label={`Trend: ${first.year}–${last.year}`}
      role="img"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {/* End dot */}
      {(() => {
        const lastX = W
        const lastY = H - ((last.value - min) / range) * (H - 2) - 1
        return <circle cx={lastX} cy={lastY} r={2} fill={color} />
      })()}
    </svg>
  )
}
