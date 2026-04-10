'use client'

import { useState, useMemo } from "react"
import { ActionCard } from "@/components/ui/action-card"
import { CountryFlag } from "@/components/ui/country-flag"
import type { ActionCard as ActionCardType, ActionType } from "@/types"

const TYPE_FILTERS: { value: ActionType | "all"; label: string; emoji: string }[] = [
  { value: "all",       label: "All",       emoji: "✦" },
  { value: "volunteer", label: "Volunteer", emoji: "🤝" },
  { value: "donate",    label: "Donate",    emoji: "❤️" },
  { value: "invest",    label: "Invest",    emoji: "📈" },
  { value: "learn",     label: "Learn",     emoji: "📖" },
]

const COUNTRY_NAMES: Record<string, string> = {
  KEN:'Kenya', NGA:'Nigeria', ETH:'Ethiopia', GHA:'Ghana', ZAF:'South Africa',
  TZA:'Tanzania', RWA:'Rwanda', SEN:'Senegal', UGA:'Uganda', MOZ:'Mozambique',
  COD:'DR Congo', CMR:'Cameroon', CIV:"Côte d'Ivoire", ZMB:'Zambia',
  AGO:'Angola', EGY:'Egypt', MAR:'Morocco', MDG:'Madagascar',
}

function CountryChip({ iso3 }: { iso3: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <CountryFlag iso3={iso3} size="sm" />
      {COUNTRY_NAMES[iso3] ?? iso3}
    </span>
  )
}

export function ActionsGrid({ actions }: { actions: ActionCardType[] }) {
  const [typeFilter, setTypeFilter]     = useState<ActionType | "all">("all")
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [remoteFilter, setRemoteFilter]  = useState<"all" | "remote" | "onsite">("all")

  // Derive available countries from actions
  const countries = useMemo(() => {
    const isos = [...new Set(actions.map((a) => a.country_iso3).filter(Boolean) as string[])]
    return isos.sort((a, b) => (COUNTRY_NAMES[a] ?? a).localeCompare(COUNTRY_NAMES[b] ?? b))
  }, [actions])

  const filtered = useMemo(() => {
    return actions.filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false
      if (countryFilter !== "all" && a.country_iso3 !== countryFilter) return false
      if (remoteFilter === "remote" && a.remote !== true) return false
      if (remoteFilter === "onsite" && a.remote !== false) return false
      return true
    })
  }, [actions, typeFilter, countryFilter, remoteFilter])

  const volunteerCount = actions.filter((a) => a.type === "volunteer").length
  const hasActiveFilter = typeFilter !== "all" || countryFilter !== "all" || remoteFilter !== "all"

  return (
    <div>
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total actions",  value: actions.length,       color: "text-slate-900" },
          { label: "Volunteer roles",value: volunteerCount,       color: "text-blue-700" },
          { label: "Organisations",  value: new Set(actions.map((a) => a.org_id)).size, color: "text-slate-900" },
          { label: "Countries",      value: countries.length,     color: "text-slate-900" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col gap-3">

        {/* Type pills */}
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map(({ value, label, emoji }) => {
            const count = value === "all" ? actions.length : actions.filter((a) => a.type === value).length
            const active = typeFilter === value
            return (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <span>{emoji}</span>
                {label}
                <span className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Country */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">All countries</option>
            {countries.map((iso3) => (
              <option key={iso3} value={iso3}>{COUNTRY_NAMES[iso3] ?? iso3}</option>
            ))}
          </select>

          {/* Remote toggle — only visible when Volunteer filter active */}
          {(typeFilter === "volunteer" || typeFilter === "all") && (
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {(["all", "remote", "onsite"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setRemoteFilter(v)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    remoteFilter === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {v === "all" ? "Any" : v === "remote" ? "Remote" : "On-site"}
                </button>
              ))}
            </div>
          )}

          {hasActiveFilter && (
            <button
              onClick={() => { setTypeFilter("all"); setCountryFilter("all"); setRemoteFilter("all") }}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-slate-400">
            {filtered.length} of {actions.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((action) => (
            <div key={action.id} className="relative">
              <ActionCard action={action} />
              {action.country_iso3 && (
                <div className="absolute top-4 right-4">
                  <CountryChip iso3={action.country_iso3} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 text-sm">
          No actions match these filters.{" "}
          <button onClick={() => { setTypeFilter("all"); setCountryFilter("all"); setRemoteFilter("all") }} className="text-blue-500 hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
