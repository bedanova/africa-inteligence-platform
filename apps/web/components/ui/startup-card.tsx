import Link from 'next/link'
import { CountryFlag } from '@/components/ui/country-flag'
import { cn } from '@/lib/utils'
import type { Startup } from '@/types'

const SECTOR_COLORS: Record<string, string> = {
  fintech:    'bg-blue-50 text-blue-700 border-blue-200',
  agritech:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  healthtech: 'bg-rose-50 text-rose-700 border-rose-200',
  edtech:     'bg-violet-50 text-violet-700 border-violet-200',
  cleantech:  'bg-teal-50 text-teal-700 border-teal-200',
  logistics:  'bg-amber-50 text-amber-700 border-amber-200',
  other:      'bg-slate-50 text-slate-600 border-slate-200',
}

const STAGE_LABELS: Record<string, string> = {
  'pre-seed': 'Pre-seed',
  'seed':     'Seed',
  'series-a': 'Series A',
  'series-b+': 'Series B+',
}

const TIER_COLORS: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-slate-100 text-slate-500',
}

function ViabilityBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-slate-300'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 tabular-nums w-6 text-right">{score}</span>
    </div>
  )
}

interface Props {
  startup: Startup
  className?: string
}

export function StartupCard({ startup, className }: Props) {
  const sectorClass = SECTOR_COLORS[startup.sector] ?? SECTOR_COLORS.other

  return (
    <Link
      href={`/startups/${startup.id}`}
      className={cn('block bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-blue-100 transition-all group', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight truncate">{startup.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <CountryFlag iso3={startup.country_iso3} size="sm" />
            <span className="text-xs text-slate-400">{startup.country_iso3}</span>
          </div>
        </div>
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0', TIER_COLORS[startup.verification_tier] ?? TIER_COLORS.C)}>
          {startup.verification_tier}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', sectorClass)}>
          {startup.sector}
        </span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
          {STAGE_LABELS[startup.stage] ?? startup.stage}
        </span>
        {startup.funding_amount_usd && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
            ${(startup.funding_amount_usd / 1_000_000).toFixed(1)}M raised
          </span>
        )}
      </div>

      {/* Description */}
      {startup.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{startup.description}</p>
      )}

      {/* Viability score */}
      {startup.viability_score != null && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Viability</span>
          </div>
          <ViabilityBar score={Math.round(startup.viability_score)} />
        </div>
      )}

      {/* SDGs */}
      {startup.sdg_tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {startup.sdg_tags.map((n) => (
            <span key={n} className="text-[10px] font-semibold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
              SDG {n}
            </span>
          ))}
        </div>
      )}

      <span className="text-[11px] text-blue-500 group-hover:underline mt-auto">View profile →</span>
    </Link>
  )
}
