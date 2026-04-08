'use client'

import { useState } from 'react'
import {
  triggerSeed, triggerIngest, triggerHistory, triggerBriefs,
  triggerStartupSeed, triggerDiscover, triggerInvestBriefs,
  approveStartup, rejectStartup,
} from './actions'
import { Database, RefreshCw, TrendingUp, FileText, Search, Rocket, BarChart2 } from 'lucide-react'

type Status = 'idle' | 'running' | 'ok' | 'error'
interface JobState { status: Status; message: string }
const INITIAL: JobState = { status: 'idle', message: '' }

interface PendingItem {
  id: number
  name: string
  country_iso3: string | null
  sector: string | null
  stage: string | null
  description: string | null
  source_url: string
  source_name: string | null
}

export default function AdminPage() {
  const [seed,         setSeed]         = useState<JobState>(INITIAL)
  const [ingest,       setIngest]       = useState<JobState>(INITIAL)
  const [history,      setHistory]      = useState<JobState>(INITIAL)
  const [briefs,       setBriefs]       = useState<JobState>(INITIAL)
  const [startupSeed,  setStartupSeed]  = useState<JobState>(INITIAL)
  const [discover,     setDiscover]     = useState<JobState>(INITIAL)
  const [investBriefs, setInvestBriefs] = useState<JobState>(INITIAL)
  const [pending,      setPending]      = useState<PendingItem[]>([])
  const [pendingLoaded, setPendingLoaded] = useState(false)

  async function run(setter: (s: JobState) => void, fn: () => Promise<{ ok: boolean; data: unknown }>) {
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

  async function loadPending() {
    try {
      const res = await fetch('/api/admin/pending-startups')
      const data = await res.json()
      setPending(data.items ?? [])
      setPendingLoaded(true)
    } catch {
      setPending([])
      setPendingLoaded(true)
    }
  }

  async function handleApprove(id: number) {
    const result = await approveStartup(id)
    if (result.ok) setPending((p) => p.filter((item) => item.id !== id))
  }

  async function handleReject(id: number) {
    const result = await rejectStartup(id)
    if (result.ok) setPending((p) => p.filter((item) => item.id !== id))
  }

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300',
    green:  'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300',
    violet: 'bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300',
    amber:  'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300',
    teal:   'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300',
    rose:   'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300',
  }

  const jobs = [
    { id: 'seed',        label: 'Seed Partners & Actions',   desc: 'Upserts 12 verified partners and 21 actions.',                       icon: <Database className="w-5 h-5" />,   color: 'blue',   state: seed,        action: () => run(setSeed, triggerSeed) },
    { id: 'ingest',      label: 'Run Data Ingest',           desc: 'Fetches live data from World Bank, WHO, UN SDG, IMF, ACLED, UNHCR.', icon: <RefreshCw className="w-5 h-5" />,  color: 'green',  state: ingest,      action: () => run(setIngest, triggerIngest) },
    { id: 'history',     label: 'Run History Ingest',        desc: 'Fetches up to 10 years of historical data per indicator.',           icon: <TrendingUp className="w-5 h-5" />, color: 'violet', state: history,     action: () => run(setHistory, triggerHistory) },
    { id: 'briefs',      label: 'Generate AI Briefs',        desc: 'Generates country briefs for all countries + continent overview.',   icon: <FileText className="w-5 h-5" />,   color: 'amber',  state: briefs,      action: () => run(setBriefs, triggerBriefs) },
    { id: 'startupseed', label: 'Seed Startups',             desc: 'Seeds 12 verified early-stage startups (fintech, agritech, health).', icon: <Rocket className="w-5 h-5" />,    color: 'indigo', state: startupSeed, action: () => run(setStartupSeed, triggerStartupSeed) },
    { id: 'discover',    label: 'Discover Startups',         desc: 'Scrapes TechCabal, Disrupt Africa, Techpoint, Ventureburn via RSS. Extracts new startups with Groq LLM → pending queue.', icon: <Search className="w-5 h-5" />, color: 'teal', state: discover, action: () => run(setDiscover, triggerDiscover) },
    { id: 'investbrief', label: 'Generate Investment Brief', desc: 'Generates weekly startup intelligence brief using Groq / Llama 3.',  icon: <BarChart2 className="w-5 h-5" />, color: 'rose',   state: investBriefs, action: () => run(setInvestBriefs, triggerInvestBriefs) },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Panel</h1>
        <p className="text-sm text-slate-500 mb-8">AfricaImpactLab — manual triggers</p>

        {/* Job triggers */}
        <div className="space-y-4 mb-10">
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

        {/* Pending startups queue */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">Pending Startup Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">Review startups discovered from RSS feeds. Approve to publish, reject to discard.</p>
            </div>
            <button
              onClick={loadPending}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              {pendingLoaded ? 'Refresh' : 'Load queue'}
            </button>
          </div>

          {!pendingLoaded && (
            <p className="text-sm text-slate-400 text-center py-6">Click &quot;Load queue&quot; to see pending startups.</p>
          )}

          {pendingLoaded && pending.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No pending startups. Run &quot;Discover Startups&quot; first.</p>
          )}

          {pending.length > 0 && (
            <div className="space-y-3">
              {pending.map((item) => (
                <div key={item.id} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[item.country_iso3, item.sector, item.stage].filter(Boolean).join(' · ')}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      {item.source_url && (
                        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:underline">
                          {item.source_name ?? 'Source'} →
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-600 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-8 text-center">
          /admin — protected by CRON_SECRET via server actions
        </p>
      </div>
    </div>
  )
}
