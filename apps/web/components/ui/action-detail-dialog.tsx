"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Heart, Users, TrendingUp, BookOpen, AlertTriangle, Wifi, MapPin, Clock, ExternalLink, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionCard as ActionCardType, VerificationTier } from "@/types";

interface ActionDetailDialogProps {
  action: ActionCardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig = {
  donate:    { label: "Donate",    color: "text-emerald-800 bg-emerald-50 border-emerald-200", icon: Heart },
  volunteer: { label: "Volunteer", color: "text-blue-800 bg-blue-50 border-blue-200",          icon: Users },
  learn:     { label: "Learn",     color: "text-violet-800 bg-violet-50 border-violet-200",    icon: BookOpen },
  invest:    { label: "Invest",    color: "text-amber-800 bg-amber-50 border-amber-200",       icon: TrendingUp },
};

const tierInfo: Record<VerificationTier, { label: string; color: string; description: string }> = {
  A: {
    label: "Tier A — Verified",
    color: "text-green-700 bg-green-50 border-green-200",
    description: "Organisation verified by multiple trusted sources. Financials audited. Recommended for donations and volunteering.",
  },
  B: {
    label: "Tier B — Reviewed",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    description: "Organisation reviewed with at least one strong source. Legitimate operations confirmed. Some data may be self-reported.",
  },
  C: {
    label: "Tier C — Listed",
    color: "text-slate-600 bg-slate-100 border-slate-200",
    description: "Organisation listed but not fully verified. Exercise caution — we recommend independent research before engaging.",
  },
  unverified: {
    label: "Not Verified",
    color: "text-red-600 bg-red-50 border-red-200",
    description: "This organisation has not been verified. We cannot recommend engagement until verification is complete.",
  },
};

const SDG_LABELS: Record<number, string> = {
  1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health & Well-being', 4: 'Quality Education',
  5: 'Gender Equality', 6: 'Clean Water & Sanitation', 7: 'Affordable & Clean Energy', 8: 'Decent Work & Economic Growth',
  9: 'Industry, Innovation & Infrastructure', 10: 'Reduced Inequalities', 11: 'Sustainable Cities & Communities',
  12: 'Responsible Consumption', 13: 'Climate Action', 14: 'Life Below Water', 15: 'Life on Land',
  16: 'Peace, Justice & Strong Institutions', 17: 'Partnerships for the Goals',
};

export function ActionDetailDialog({ action, open, onOpenChange }: ActionDetailDialogProps) {
  const type = typeConfig[action.type];
  const tier = tierInfo[action.org_verification_tier];
  const TypeIcon = type.icon;
  const isRestricted = action.org_verification_tier === "C" || action.org_verification_tier === "unverified";
  const isVolunteer = action.type === "volunteer";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl overflow-y-auto sm:rounded-l-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", type.color)}>
                <TypeIcon className="w-3.5 h-3.5" />
                {type.label}
              </span>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", tier.color)}>
                {tier.label.split(' — ')[1] || tier.label}
              </span>
            </div>
            <Dialog.Close className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Title and org */}
            <div>
              <Dialog.Title className="text-xl font-bold text-slate-900 leading-snug mb-1">
                {action.title}
              </Dialog.Title>
              <p className="text-sm text-slate-500">{action.org_name}</p>
            </div>

            {/* Description */}
            {action.description && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Description</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{action.description}</p>
              </div>
            )}

            {/* Volunteer details */}
            {isVolunteer && (
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Volunteer Details</h3>

                {/* Remote / On-site */}
                {action.remote != null && (
                  <div className="flex items-center gap-2">
                    {action.remote ? (
                      <Wifi className="w-4 h-4 text-teal-600" />
                    ) : (
                      <MapPin className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      {action.remote ? "Remote — work from anywhere" : "On-site — travel required"}
                    </span>
                  </div>
                )}

                {/* Duration */}
                {action.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">{action.duration}</span>
                  </div>
                )}

                {/* Skills */}
                {action.skills_needed && action.skills_needed.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {action.skills_needed.map((s) => (
                        <span key={s} className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Organisation Verification */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <Shield className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Organisation Verification</h3>
                  <span className={cn("inline-flex text-xs font-medium px-2 py-0.5 rounded-full border mb-2", tier.color)}>
                    {tier.label}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">{tier.description}</p>
                </div>
              </div>
            </div>

            {/* Warning / Risks */}
            {action.warning && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-1">Important Notice</h3>
                    <p className="text-sm text-amber-800 leading-relaxed">{action.warning}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sector */}
            {action.sector && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sector:</span>
                <span className="text-sm text-slate-700">{action.sector}</span>
              </div>
            )}

            {/* SDG Alignment */}
            {action.sdg_tags && action.sdg_tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">SDG Alignment</h3>
                <div className="flex flex-wrap gap-2">
                  {action.sdg_tags.map((n) => (
                    <div key={n} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                      <span className="text-xs font-bold text-slate-600">SDG {n}</span>
                      <span className="text-[11px] text-slate-500">{SDG_LABELS[n]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General conditions notice */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-500 leading-relaxed space-y-1">
                  <p>
                    <strong>Before you apply:</strong> Review the organisation&apos;s website for full terms, eligibility criteria, and any costs involved.
                    AfricaImpactLab verifies organisations but does not manage applications.
                  </p>
                  {action.type === 'invest' && (
                    <p className="text-amber-700">
                      <strong>Investment risk:</strong> All investments carry risk. Past performance is not indicative of future results.
                      This is informational only — not investment advice.
                    </p>
                  )}
                  {action.type === 'donate' && (
                    <p>
                      Check the organisation&apos;s annual report and financial disclosures before donating. Tier A organisations have been audited.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              {isRestricted ? (
                <div className="text-center py-4 text-sm text-slate-400 italic">
                  Full verification required before we can link to this action.
                </div>
              ) : (
                <a
                  href={action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  {action.type === 'volunteer' ? 'Apply on organisation website' :
                   action.type === 'donate' ? 'Donate on organisation website' :
                   action.type === 'invest' ? 'Learn more on their website' :
                   'Visit resource'}
                </a>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
