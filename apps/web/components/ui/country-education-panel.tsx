'use client'

import { useState } from 'react'
import { Minus, Plus, ChevronRight } from 'lucide-react'
import type { CountryEducation } from '@/lib/country-education'

const TABS = [
  { id: 'history',    label: 'History' },
  { id: 'current',   label: 'Current situation' },
  { id: 'economy',   label: 'Economy & resources' },
  { id: 'facts',     label: 'Key facts' },
] as const

type TabId = typeof TABS[number]['id']

interface Props {
  education: CountryEducation
  countryName: string
}

export function CountryEducationPanel({ education, countryName }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<TabId>('history')

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700">Country Overview — {countryName}</span>
        </div>
        {open ? <Minus className="w-4 h-4 text-slate-400" /> : <Plus className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div>
          {/* Tab bar */}
          <div className="flex border-t border-b border-slate-100 overflow-x-auto">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  tab === id
                    ? 'text-indigo-600 border-indigo-500 bg-indigo-50/40'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-6 py-5">
            {tab === 'history' && (
              <p className="text-sm text-slate-600 leading-relaxed">{education.history}</p>
            )}

            {tab === 'current' && (
              <p className="text-sm text-slate-600 leading-relaxed">{education.current}</p>
            )}

            {tab === 'economy' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">{education.economy}</p>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Key resources</p>
                  <ul className="space-y-1.5">
                    {education.resources.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === 'facts' && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Known for</p>
                  <ul className="space-y-1.5">
                    {education.knownFor.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Key challenges</p>
                  <ul className="space-y-1.5">
                    {education.challenges.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
