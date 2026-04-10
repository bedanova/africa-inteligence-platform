import { cn } from "@/lib/utils";
import { Heart, Users, TrendingUp, BookOpen, AlertTriangle, Wifi, MapPin, Clock } from 'lucide-react'
import type { ActionCard as ActionCardType, VerificationTier } from "@/types";

interface ActionCardProps {
  action: ActionCardType;
  className?: string;
}

const typeConfig = {
  donate:    { label: "Donate",    color: "text-emerald-800 bg-emerald-50 border-emerald-200", icon: <Heart className="w-3.5 h-3.5" /> },
  volunteer: { label: "Volunteer", color: "text-blue-800 bg-blue-50 border-blue-200",          icon: <Users className="w-3.5 h-3.5" /> },
  learn:     { label: "Learn",     color: "text-violet-800 bg-violet-50 border-violet-200",    icon: <BookOpen className="w-3.5 h-3.5" /> },
  invest:    { label: "Invest",    color: "text-amber-800 bg-amber-50 border-amber-200",       icon: <TrendingUp className="w-3.5 h-3.5" /> },
};

const tierConfig: Record<VerificationTier, { label: string; color: string }> = {
  A:          { label: "Verified A",  color: "text-green-700 bg-green-50 border-green-200" },
  B:          { label: "Verified B",  color: "text-blue-700 bg-blue-50 border-blue-200" },
  C:          { label: "Listed C",    color: "text-slate-600 bg-slate-100 border-slate-200" },
  unverified: { label: "Not verified",color: "text-red-600 bg-red-50 border-red-200" },
};

const SDG_LABELS: Record<number, string> = {
  1:'No Poverty', 2:'Zero Hunger', 3:'Good Health', 4:'Quality Education',
  5:'Gender Equality', 6:'Clean Water', 7:'Affordable Energy', 8:'Decent Work',
  9:'Innovation', 10:'Reduced Inequalities', 11:'Sustainable Cities',
  13:'Climate Action', 16:'Peace & Justice', 17:'Partnerships',
}

export function ActionCard({ action, className }: ActionCardProps) {
  const type = typeConfig[action.type];
  const tier = tierConfig[action.org_verification_tier];
  const isRestricted = action.org_verification_tier === "C" || action.org_verification_tier === "unverified";
  const isVolunteer = action.type === "volunteer";

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col gap-3",
        isRestricted && "opacity-60",
        className
      )}
    >
      {/* Header badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border", type.color)}>
          {type.icon} {type.label}
        </span>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", tier.color)}>
          {tier.label}
        </span>
        {isVolunteer && action.remote != null && (
          <span className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
            action.remote
              ? "text-teal-700 bg-teal-50 border-teal-200"
              : "text-orange-700 bg-orange-50 border-orange-200"
          )}>
            {action.remote ? <Wifi className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {action.remote ? "Remote" : "On-site"}
          </span>
        )}
      </div>

      {/* Title + org */}
      <div>
        <h4 className="font-semibold text-sm text-slate-900 leading-snug mb-0.5">{action.title}</h4>
        <p className="text-xs text-slate-400">{action.org_name}</p>
      </div>

      {/* Description */}
      {action.description && (
        <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>
      )}

      {/* Duration — volunteer */}
      {isVolunteer && action.duration && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {action.duration}
        </div>
      )}

      {/* Skills — volunteer */}
      {isVolunteer && action.skills_needed && action.skills_needed.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Skills needed</p>
          <div className="flex flex-wrap gap-1">
            {action.skills_needed.map((s) => (
              <span key={s} className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SDG tags */}
      {action.sdg_tags && action.sdg_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {action.sdg_tags.map((n) => (
            <span key={n} title={SDG_LABELS[n]} className="text-[10px] font-semibold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
              SDG {n}
            </span>
          ))}
        </div>
      )}

      {/* Warning */}
      {action.warning && (
        <div className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {action.warning}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-1">
        {isRestricted ? (
          <span className="text-xs text-slate-400 italic">Full verification required before CTA</span>
        ) : (
          <a
            href={action.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            {action.type === 'volunteer' ? 'Apply now' : action.type === 'donate' ? 'Donate now' : action.type === 'invest' ? 'Learn more' : 'Read more'}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
