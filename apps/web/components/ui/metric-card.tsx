import { cn } from "@/lib/utils";
import { FreshnessBadge } from "./freshness-badge";
import { SourceBadge } from "./source-badge";
import type { CountryMetric } from "@/types";

interface MetricCardProps {
  metric: CountryMetric;
  className?: string;
  loading?: boolean;
}

const trendIcon = {
  up: (
    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-label="Trending up">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
    </svg>
  ),
  down: (
    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-label="Trending down">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.306-4.307a11.95 11.95 0 0 1 5.814 5.519l2.74 1.22m0 0-5.94 2.28m5.94-2.28-2.28-5.941" />
    </svg>
  ),
  flat: (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-label="Stable">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  ),
};

export function MetricCard({ metric, className, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl border border-slate-100 p-4 shadow-sm", className)}>
        <div className="skeleton h-3 w-24 mb-3 rounded" />
        <div className="skeleton h-7 w-16 mb-2 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow",
        metric.freshness === "stale" && "opacity-70 border-red-100",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {metric.label}
        </span>
        {metric.trend && trendIcon[metric.trend]}
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-slate-900 tabular-nums">
          {metric.value}
        </span>
        {metric.unit && (
          <span className="text-sm text-slate-400 font-medium">{metric.unit}</span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <SourceBadge source={metric.source} year={metric.source_year} />
        <FreshnessBadge freshness={metric.freshness} />
      </div>
    </div>
  );
}
