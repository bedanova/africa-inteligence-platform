'use client'

import { useState } from 'react'
import { triggerSeed, triggerIngest, triggerHistory, triggerBriefs } from './actions'
import { Database, RefreshCw, TrendingUp, FileText } from 'lucide-react'

type Status = 'idle' | 'running' | 'ok' | 'error'

interface JobState {
  status: Status
  message: string
}

const INITIAL: JobState = { status: 'idle', message: '' }

export default function AdminPage() {
  const [seed,    setSeed]    = useState<JobState>(INITIAL)
  const [ingest,  setIngest]  = useState<JobState>(INITIAL)
  const [history, setHistory] = useState<JobState>(INITIAL)
  const [briefs,  setBriefs]  = useState<JobState>(INITIAL)

  async function run(
    setter: (s: JobState) => void,
    fn: () => Promise<{ ok: boolean; data: unknown }>,
  ) {
    setter({ status: 'running', message: 'Running…' })
    try {
      const { ok, data } = await fn()
      const d = data as Record<string, unknown>
      const msg = ok
        ? JSON.stringify(d, null, 2).slice(0, 300)
        : String(d?.error ?? JSON.stringify(d))
      setter({ status: ok ? 'ok' : 'error', message: msg })
    } catch (e) {
      setter({ status: 'error', message: String(e) })
    }
  }

  const jobs = [
    {
      id: 'seed',
      label: 'Seed Partners & Actions',
      desc: 'Upserts 12 verified partners and 21 actions into Supabase. Safe to run multiple times.',
      icon: <Database className="w-5 h-5" />,
      color: 'blue',
      state: seed,
      action: () => run(setSeed, triggerSeed),
    },
    {
      id: 'ingest',
      label: 'Run Data Ingest',
      desc: 'Fetches live data from World Bank, WHO, UN SDG, IMF, ACLED, UNHCR. Updates all metrics and scores.',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'green',
      state: ingest,
      action: () => run(setIngest, triggerIngest),
    },
    {
      id: 'history',
      label: 'Run History Ingest',
      desc: 'Fetches up to 10 years of historical data per indicator. Populates sparklines on metric cards.',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'violet',
      state: history,
      action: () => run(setHistory, triggerHistory),
    },
    {
      id: 'briefs',
      label: 'Generate AI Briefs',
      desc: 'Generates country briefs for all 20 countries + 1 continent overview using Groq / Llama 3.',
      icon: <FileText className="w-5 h-5" />,
      color: 'amber',
      state: briefs,
      action: () => run(setBriefs, triggerBriefs),
    },
  ]

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300',
    green:  'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300',
    violet: 'bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300',
    amber:  'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300',
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Panel</h1>
        <p className="text-sm text-slate-500 mb-8">Africa Intelligence Platform — manual triggers</p>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">{job.icon}</div>
                  <div>
                    <h2 className="font-semibold text-slate-900">{job.label}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{job.desc}</p>
                  </div>
                </div>
                <button
                  onClick={job.action}
                  disabled={job.state.status === 'running'}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${colorMap[job.color]}`}
                >
                  {job.state.status === 'running' ? 'Running…' : 'Run'}
                </button>
              </div>

              {job.state.status !== 'idle' && (
                <div className={`mt-4 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap break-all ${
                  job.state.status === 'running' ? 'bg-slate-50 text-slate-500' :
                  job.state.status === 'ok'      ? 'bg-green-50 text-green-800' :
                                                   'bg-red-50 text-red-800'
                }`}>
                  {job.state.message || 'Done'}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-8 text-center">
          /admin — protected by CRON_SECRET via server actions
        </p>
      </div>
    </div>
  )
}
