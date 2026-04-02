import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScoreChip } from "./score-chip";
import { FreshnessBadge } from "./freshness-badge";
import type { CountrySummary } from "@/types";

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
        <span className="text-3xl leading-none" role="img" aria-label={`${country.name} flag`}>
          {country.flag_emoji}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
            {country.name}
          </h3>
          <p className="text-xs text-slate-400 truncate">{country.region}</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        <ScoreChip type="need" value={country.scores.need} size="sm" />
        <ScoreChip type="opportunity" value={country.scores.opportunity} size="sm" />
        <ScoreChip type="stability" value={country.scores.stability} size="sm" />
      </div>

      <FreshnessBadge freshness={country.freshness} updatedAt={country.scores.updated_at} />
    </Link>
  );
}
