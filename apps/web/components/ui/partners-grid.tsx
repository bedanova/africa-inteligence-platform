'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { OrgCard } from '@/components/ui/org-card'
import { cn } from '@/lib/utils'
import type { Organization, ActionType } from '@/types'

export function PartnersGrid({ orgs }: { orgs: Organization[] }) {
  const [actionFilter, setActionFilter] = useState<ActionType | 'all'>('all')
  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Build sector list from data
  const allSectors = useMemo(() => {
    const counts: Record<string, number> = {}
    orgs.forEach((o) => o.sectors.forEach((s) => { counts[s] = (counts[s] ?? 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [orgs])

  // Action type counts
  const actionCounts = useMemo(() => {
    const c: Record<string, number> = { all: orgs.length }
    orgs.forEach((o) => o.action_types.forEach((t) => { c[t] = (c[t] ?? 0) + 1 }))
    return c
  }, [orgs])

  const filtered = useMemo(() => {
    return orgs.filter((o) => {
      if (actionFilter !== 'all' && !o.action_types.includes(actionFilter)) return false
      if (sectorFilter !== 'all' && !o.sectors.includes(sectorFilter)) return false
      if (search) {
        const q = search.toLowerCase()
        if (!o.name.toLowerCase().includes(q) && !o.mission.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [orgs, actionFilter, sectorFilter, search])

  const ACTION_LABELS: Record<string, string> = { all: 'All', donate: 'Donate', volunteer: 'Volunteer', invest: 'Invest', learn: 'Learn' }

  return (
    <div>
      {/* Stats */}
      <p className="text-sm text-slate-400 mb-5">
        {orgs.length} partners ·{' '}
        {new Set(orgs.flatMap((o) => o.sectors)).size} sectors ·{' '}
        {new Set(orgs.flatMap((o) => o.countries)).size} countries covered
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search partners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>

      {/* Action type filter */}
      <div className="flex gap-2 flex-wrap mb-3">
        {(['all', 'donate', 'volunteer', 'invest', 'learn'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setActionFilter(v)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              actionFilter === v
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            )}
          >
            {ACTION_LABELS[v]}
            {actionCounts[v] != null && (
              <span className={cn('ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                actionFilter === v ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
              )}>
                {actionCounts[v]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sector filter */}
      {allSectors.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-5">
          <button
            onClick={() => setSectorFilter('all')}
            className={cn('px-2.5 py-1 rounded-full text-xs border transition-colors',
              sectorFilter === 'all'
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            )}
          >
            All sectors
          </button>
          {allSectors.map(([sector, count]) => (
            <button
              key={sector}
              onClick={() => setSectorFilter(sectorFilter === sector ? 'all' : sector)}
              className={cn('px-2.5 py-1 rounded-full text-xs border transition-colors',
                sectorFilter === sector
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              )}
            >
              {sector} <span className="opacity-60">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-slate-400 mb-4">Showing {filtered.length} of {orgs.length} partners</p>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0
          ? filtered.map((org) => <OrgCard key={org.id} org={org} />)
          : (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <p className="text-sm">No partners match your filters.</p>
              <button onClick={() => { setActionFilter('all'); setSectorFilter('all'); setSearch('') }}
                className="mt-2 text-xs text-blue-500 hover:underline">Clear filters</button>
            </div>
          )
        }
      </div>
    </div>
  )
}
