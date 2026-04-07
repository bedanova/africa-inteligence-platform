'use client'

import { useState } from "react"
import { ActionCard } from "@/components/ui/action-card"
import { CountryFlag } from "@/components/ui/country-flag"
import type { ActionCard as ActionCardType, ActionType } from "@/types"

const TYPE_FILTERS: { value: ActionType | "all"; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "donate",    label: "Donate" },
  { value: "volunteer", label: "Volunteer" },
  { value: "invest",    label: "Invest" },
  { value: "learn",     label: "Learn" },
]

function CountryChip({ iso3 }: { iso3: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
      <CountryFlag iso3={iso3} size="sm" />
      {iso3}
    </span>
  )
}

function ActionCardWithFlag({ action }: { action: ActionCardType }) {
  return (
    <div className="relative">
      <ActionCard action={action} />
      {action.country_iso3 && (
        <div className="absolute top-3 right-3">
          <CountryChip iso3={action.country_iso3} />
        </div>
      )}
    </div>
  )
}

export function ActionsGrid({ actions }: { actions: ActionCardType[] }) {
  const [filter, setFilter] = useState<ActionType | "all">("all")

  const filtered = filter === "all" ? actions : actions.filter((a) => a.type === filter)

  function countForType(type: ActionType | "all") {
    if (type === "all") return actions.length
    return actions.filter((a) => a.type === type).length
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Take Action</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified opportunities to donate, volunteer, invest, and learn.
          </p>
        </div>
        <span className="flex-shrink-0 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1">
          {actions.length} total
        </span>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm py-2 mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        {TYPE_FILTERS.map(({ value, label }) => {
          const count = countForType(value)
          const active = filter === value
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {label}
              <span
                className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
        <span className="ml-auto text-xs text-slate-400">
          Showing {filtered.length} of {actions.length}
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((action) => (
            <ActionCardWithFlag key={action.id} action={action} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 text-sm">
          No actions match this filter.
        </div>
      )}
    </div>
  )
}
