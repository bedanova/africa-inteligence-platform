import Link from "next/link";
import { cn } from "@/lib/utils";
import { FreshnessBadge } from "./freshness-badge";
import { CountryFlag } from '@/components/ui/country-flag'
import type { CountrySummary } from "@/types";

function scoreLabel(value: number, type: 'need' | 'opportunity' | 'stability'): string {
  if (type === 'need') {
    if (value >= 70) return 'Critical'
    if (value >= 45) return 'High'
    return 'Moderate'
  }
  if (type === 'opportunity') {
    if (value >= 70) return 'Strong'
    if (value >= 45) return 'Emerging'
    return 'Early stage'
  }
  // stability
  if (value >= 70) return 'Stable'
  if (value >= 45) return 'Fragile'
  return 'Volatile'
}

interface ScoreRowProps {
  label: string
  value: number
  type: 'need' | 'opportunity' | 'stability'
  tooltip: string
}

function ScoreRow({ label, value, type, tooltip }: ScoreRowProps) {
  const rounded = Math.round(value)
  const bar = {
    need: 'bg-rose-500',
    opportunity: 'bg-emerald-500',
    stability: 'bg-blue-500',
  }[type]
  const labelColor = {
    need: 'text-rose-700',
    opportunity: 'text-emerald-700',
    stability: 'text-blue-700',
  }[type]

  return (
    <div title={tooltip}>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        <span className={cn("text-[10px] font-semibold", labelColor)}>
          {scoreLabel(value, type)} · {rounded}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-1.5 rounded-full transition-all", bar)} style={{ width: `${rounded}%` }} />
      </div>
    </div>
  )
}

interface CountryCardProps {
  country: CountrySummary;
  className?: string;
  loading?: boolean;
}

export function CountryCard({ country, className, loading }: CountryCardProps) {
  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl border border-slate-100 p-4 shadow-sm", className)}>
        <div className="skeleton h-8 w-8 rounded-full mb-3" />
        <div className="skeleton h-5 w-32 mb-2 rounded" />
        <div className="skeleton h-3 w-20 mb-4 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/countries/${country.iso3.toLowerCase()}`}
      className={cn(
        "block bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group",
        className
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <CountryFlag iso3={country.iso3} countryName={country.name} size="lg" />
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
            {country.name}
          </h3>
          <p className="text-xs text-slate-400 truncate">{country.region}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-3">
        <ScoreRow
          label="Need"
          value={country.scores.need}
          type="need"
          tooltip="Humanitarian & health pressure — higher = more urgent need for support (0–100)"
        />
        <ScoreRow
          label="Opportunity"
          value={country.scores.opportunity}
          type="opportunity"
          tooltip="Economic & connectivity potential — higher = stronger development opportunity (0–100)"
        />
        <ScoreRow
          label="Stability"
          value={country.scores.stability}
          type="stability"
          tooltip="Governance & peace score — higher = more politically stable environment (0–100)"
        />
      </div>

      <FreshnessBadge freshness={country.freshness} updatedAt={country.scores.updated_at} />
    </Link>
  );
}
