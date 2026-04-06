import { cn } from "@/lib/utils";
import type { Organization, ActionType } from "@/types";

const tierConfig = {
  A: { label: "Verified A", className: "bg-green-50 text-green-700 border-green-200" },
  B: { label: "Verified B", className: "bg-blue-50 text-blue-700 border-blue-200" },
  C: { label: "Verified C", className: "bg-slate-50 text-slate-600 border-slate-200" },
  unverified: { label: "Unverified", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

const actionConfig: Record<ActionType, { label: string; className: string }> = {
  donate: { label: "Donate", className: "bg-red-50 text-red-700 border-red-100" },
  volunteer: { label: "Volunteer", className: "bg-purple-50 text-purple-700 border-purple-100" },
  invest: { label: "Invest", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  learn: { label: "Learn", className: "bg-amber-50 text-amber-700 border-amber-100" },
};

interface OrgCardProps {
  org: Organization;
  className?: string;
  loading?: boolean;
}

export function OrgCard({ org, className, loading }: OrgCardProps) {
  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl border border-slate-100 p-5 shadow-sm", className)}>
        <div className="skeleton h-5 w-40 mb-2 rounded" />
        <div className="skeleton h-3 w-full mb-1 rounded" />
        <div className="skeleton h-3 w-3/4 mb-4 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  const tier = tierConfig[org.verification_tier];

  return (
    <div className={cn("bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {org.website ? (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
            >
              {org.name} ↗
            </a>
          ) : (
            <h3 className="font-semibold text-slate-900">{org.name}</h3>
          )}
        </div>
        <span className={cn("flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border", tier.className)}>
          {tier.label}
        </span>
      </div>

      {/* Mission */}
      <p className="text-sm text-slate-600 leading-relaxed">{org.mission}</p>

      {/* Countries */}
      {org.countries.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {org.countries.map((iso3) => (
            <a
              key={iso3}
              href={`/countries/${iso3.toLowerCase()}`}
              className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              {iso3}
            </a>
          ))}
        </div>
      )}

      {/* Sectors */}
      {org.sectors.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {org.sectors.map((s) => (
            <span key={s} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Action types */}
      <div className="flex gap-1.5 flex-wrap pt-1 border-t border-slate-100">
        {org.action_types.map((type) => {
          const cfg = actionConfig[type];
          return (
            <span key={type} className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", cfg.className)}>
              {cfg.label}
            </span>
          );
        })}
        <span className="text-xs text-slate-400 ml-auto self-center">
          Reviewed {new Date(org.last_reviewed_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}
