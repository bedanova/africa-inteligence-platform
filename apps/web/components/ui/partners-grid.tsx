'use client'

import { useState } from "react"
import { OrgCard } from "@/components/ui/org-card"
import type { Organization, ActionType } from "@/types"

const ACTION_FILTERS: { value: ActionType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "donate", label: "Donate" },
  { value: "volunteer", label: "Volunteer" },
  { value: "invest", label: "Invest" },
  { value: "learn", label: "Learn" },
]

export function PartnersGrid({ orgs }: { orgs: Organization[] }) {
  const [filter, setFilter] = useState<ActionType | "all">("all")

  const filtered = filter === "all"
    ? orgs
    : orgs.filter((o) => o.action_types.includes(filter as ActionType))

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-6">
        {ACTION_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((org) => <OrgCard key={org.id} org={org} />)
        ) : (
          <p className="col-span-3 text-slate-400 text-sm py-12 text-center">
            No partners found for this filter.
          </p>
        )}
      </div>
    </>
  )
}
