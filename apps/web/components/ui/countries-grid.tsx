'use client'

import { useState } from "react"
import { CountryCard } from "@/components/ui/country-card"
import type { CountrySummary, Region } from "@/types"

const REGIONS: { value: Region | "all"; label: string }[] = [
  { value: "all", label: "All regions" },
  { value: "Eastern Africa", label: "Eastern Africa" },
  { value: "Western Africa", label: "Western Africa" },
  { value: "Southern Africa", label: "Southern Africa" },
  { value: "Northern Africa", label: "Northern Africa" },
  { value: "Central Africa", label: "Central Africa" },
]

export function CountriesGrid({ countries }: { countries: CountrySummary[] }) {
  const [region, setRegion] = useState<Region | "all">("all")
  const [search, setSearch] = useState("")

  const filtered = countries.filter((c) => {
    const matchRegion = region === "all" || c.region === region
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    return matchRegion && matchSearch
  })

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {REGIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRegion(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              region === value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length > 0 ? (
          filtered.map((c) => <CountryCard key={c.iso3} country={c} />)
        ) : (
          <p className="col-span-4 text-slate-400 text-sm py-12 text-center">
            No countries found.
          </p>
        )}
      </div>
    </>
  )
}
