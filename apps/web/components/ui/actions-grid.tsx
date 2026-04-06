'use client'

import { useState } from "react"
import { ActionCard } from "@/components/ui/action-card"
import type { ActionCard as ActionCardType, ActionType } from "@/types"

const FILTERS: { value: ActionType | "all"; label: string; desc: string }[] = [
  { value: "all",       label: "All",         desc: "Every verified opportunity" },
  { value: "donate",    label: "💚 Donate",   desc: "Support vetted programmes financially" },
  { value: "volunteer", label: "🤝 Volunteer", desc: "Contribute skills and time" },
  { value: "invest",    label: "📈 Invest",   desc: "Impact-first capital deployment" },
  { value: "learn",     label: "📚 Learn",    desc: "Deepen your understanding" },
]

export function ActionsGrid({ actions }: { actions: ActionCardType[] }) {
  const [filter, setFilter] = useState<ActionType | "all">("all")

  const filtered = filter === "all" ? actions : actions.filter((a) => a.type === filter)
  const activeFilter = FILTERS.find((f) => f.value === filter)!

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-2">
        {FILTERS.map(({ value, label }) => (
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
      <p className="text-xs text-slate-400 mb-6">{activeFilter.desc}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((action) => <ActionCard key={action.id} action={action} />)
        ) : (
          <p className="col-span-3 text-slate-400 text-sm py-12 text-center">
            No actions found for this filter.
          </p>
        )}
      </div>
    </>
  )
}
