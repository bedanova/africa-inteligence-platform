'use client'

import { useState } from 'react'
import { StartupCard } from '@/components/ui/startup-card'
import type { Startup } from '@/types'

const SECTORS = ['All', 'fintech', 'agritech', 'healthtech']
const STAGES  = ['All', 'pre-seed', 'seed', 'series-a', 'series-b+']
const COUNTRIES = [
  { iso3: 'All', name: 'All countries' },
  { iso3: 'KEN', name: 'Kenya' },
  { iso3: 'NGA', name: 'Nigeria' },
  { iso3: 'GHA', name: 'Ghana' },
  { iso3: 'ZAF', name: 'South Africa' },
  { iso3: 'RWA', name: 'Rwanda' },
]

const STAGE_LABELS: Record<string, string> = {
  'pre-seed': 'Pre-seed', 'seed': 'Seed', 'series-a': 'Series A', 'series-b+': 'Series B+',
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
      }`}
    >
      {children}
    </button>
  )
}

export function StartupExplorer({ startups }: { startups: Startup[] }) {
  const [sector,  setSector]  = useState('All')
  const [stage,   setStage]   = useState('All')
  const [country, setCountry] = useState('All')
  const [search,  setSearch]  = useState('')

  const filtered = startups.filter((s) => {
    if (sector  !== 'All' && s.sector       !== sector)  return false
    if (stage   !== 'All' && s.stage        !== stage)   return false
    if (country !== 'All' && s.country_iso3 !== country) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !(s.description ?? '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      {/* Search */}
      <input
        type="search"
        placeholder="Search startups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-72 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4"
      />

      {/* Sector filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SECTORS.map((s) => (
          <Pill key={s} active={sector === s} onClick={() => setSector(s)}>
            {s === 'All' ? 'All sectors' : s}
          </Pill>
        ))}
      </div>

      {/* Stage filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        {STAGES.map((s) => (
          <Pill key={s} active={stage === s} onClick={() => setStage(s)}>
            {s === 'All' ? 'All stages' : STAGE_LABELS[s]}
          </Pill>
        ))}
      </div>

      {/* Country filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {COUNTRIES.map((c) => (
          <Pill key={c.iso3} active={country === c.iso3} onClick={() => setCountry(c.iso3)}>
            {c.name}
          </Pill>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-400 mb-4">
        {filtered.length} startup{filtered.length !== 1 ? 's' : ''} found
        {filtered.length < startups.length ? ` (of ${startups.length})` : ''}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm">No startups match your filters.</p>
          <button
            onClick={() => { setSector('All'); setStage('All'); setCountry('All'); setSearch('') }}
            className="mt-2 text-xs text-blue-500 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
