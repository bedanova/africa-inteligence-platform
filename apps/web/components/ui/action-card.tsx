import { cn } from "@/lib/utils";
import { Heart, Users, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react'
import type { ActionCard as ActionCardType, VerificationTier } from "@/types";

interface ActionCardProps {
  action: ActionCardType;
  className?: string;
}

const typeConfig = {
  donate: { label: "Donate", color: "text-emerald-800 bg-emerald-50 border-emerald-200", icon: <Heart className="w-4 h-4" /> },
  volunteer: { label: "Volunteer", color: "text-blue-800 bg-blue-50 border-blue-200", icon: <Users className="w-4 h-4" /> },
  learn: { label: "Learn", color: "text-violet-800 bg-violet-50 border-violet-200", icon: <BookOpen className="w-4 h-4" /> },
  invest: { label: "Invest", color: "text-amber-800 bg-amber-50 border-amber-200", icon: <TrendingUp className="w-4 h-4" /> },
};

const tierConfig: Record<VerificationTier, { label: string; color: string }> = {
  A: { label: "Verified A", color: "text-green-700 bg-green-50 border-green-200" },
  B: { label: "Verified B", color: "text-blue-700 bg-blue-50 border-blue-200" },
  C: { label: "Listed C", color: "text-slate-600 bg-slate-100 border-slate-200" },
  unverified: { label: "Not verified", color: "text-red-600 bg-red-50 border-red-200" },
};

export function ActionCard({ action, className }: ActionCardProps) {
  const type = typeConfig[action.type];
  const tier = tierConfig[action.org_verification_tier];
  const isRestricted = action.org_verification_tier === "C" || action.org_verification_tier === "unverified";

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-100 p-4 shadow-sm",
        isRestricted && "opacity-60",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", type.color)}>
            {type.icon} {type.label}
          </span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", tier.color)}>
            {tier.label}
          </span>
        </div>
      </div>

      <h4 className="font-semibold text-sm text-slate-900 mb-1">{action.title}</h4>
      <p className="text-xs text-slate-500 mb-1">{action.org_name}</p>
      {action.description && (
        <p className="text-xs text-slate-600 mb-3 leading-relaxed">{action.description}</p>
      )}

      {action.warning && (
        <div className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {action.warning}
        </div>
      )}

      {isRestricted ? (
        <span className="text-xs text-slate-400 italic">
          Full verification required before donation CTA
        </span>
      ) : (
        <a
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Take action
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
      )}
    </div>
  );
}
