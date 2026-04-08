import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { PageShell } from '@/components/layout/page-shell'
import { CountryFlag } from '@/components/ui/country-flag'
import { StartupCard } from '@/components/ui/startup-card'
import { getStartup, getStartups } from '@/lib/supabase-startups'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

const COUNTRY_NAMES: Record<string, string> = {
  KEN: 'Kenya', NGA: 'Nigeria', GHA: 'Ghana', ZAF: 'South Africa', RWA: 'Rwanda',
  ETH: 'Ethiopia', TZA: 'Tanzania', UGA: 'Uganda', MOZ: 'Mozambique', MDG: 'Madagascar',
  COD: 'DR Congo', AGO: 'Angola', CMR: 'Cameroon', CIV: "Côte d'Ivoire",
  SEN: 'Senegal', ZMB: 'Zambia', EGY: 'Egypt', MAR: 'Morocco', DZA: 'Algeria', TUN: 'Tunisia',
}

const SECTOR_COLORS: Record<string, string> = {
  fintech:    'bg-blue-50 text-blue-700 border-blue-200',
  agritech:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  healthtech: 'bg-rose-50 text-rose-700 border-rose-200',
  edtech:     'bg-violet-50 text-violet-700 border-violet-200',
  cleantech:  'bg-teal-50 text-teal-700 border-teal-200',
  logistics:  'bg-amber-50 text-amber-700 border-amber-200',
  other:      'bg-slate-50 text-slate-600 border-slate-200',
}

const STAGE_LABELS: Record<string, string> = {
  'pre-seed': 'Pre-seed', 'seed': 'Seed', 'series-a': 'Series A', 'series-b+': 'Series B+',
}

const TIER_COLORS: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700', B: 'bg-blue-100 text-blue-700', C: 'bg-slate-100 text-slate-500',
}

const TIER_LABELS: Record<string, string> = {
  A: 'Tier A — Multiple trusted sources',
  B: 'Tier B — One strong verified source',
  C: 'Tier C — Informational only',
}

const SDG_LABELS: Record<number, string> = {
  1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health', 4: 'Quality Education',
  5: 'Gender Equality', 6: 'Clean Water', 7: 'Affordable Energy', 8: 'Decent Work',
  9: 'Innovation', 10: 'Reduced Inequalities', 11: 'Sustainable Cities',
  12: 'Responsible Consumption', 13: 'Climate Action', 16: 'Peace & Justice', 17: 'Partnerships',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const startup = await getStartup(id).catch(() => null)
  if (!startup) return { title: 'Startup not found' }
  const desc = startup.description ?? `${startup.name} — ${startup.sector} startup in ${COUNTRY_NAMES[startup.country_iso3] ?? startup.country_iso3}`
  return {
    title: startup.name,
    description: desc,
    openGraph: { title: `${startup.name} | AfricaImpactLab`, description: desc },
  }
}

export default async function StartupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [startup, allStartups] = await Promise.all([
    getStartup(id).catch(() => null),
    getStartups().catch(() => []),
  ])

  if (!startup) notFound()

  const related = allStartups
    .filter((s) => s.id !== startup.id && (s.country_iso3 === startup.country_iso3 || s.sector === startup.sector))
    .slice(0, 3)

  const score = startup.viability_score != null ? Math.round(startup.viability_score) : null
  const scoreColor = score == null ? 'text-slate-400' : score >= 70 ? 'text-emerald-700' : score >= 50 ? 'text-amber-600' : 'text-slate-500'
  const barColor   = score == null ? 'bg-slate-200'   : score >= 70 ? 'bg-emerald-500'  : score >= 50 ? 'bg-amber-400'    : 'bg-slate-300'

  return (
    <>
      <Navbar />
      <PageShell>
        {/* Back */}
        <Link
          href="/startups"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          All startups
        </Link>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          {/* Header row */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
            <CountryFlag iso3={startup.country_iso3} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight truncate">{startup.name}</h1>
              <p className="text-sm text-slate-400">{COUNTRY_NAMES[startup.country_iso3] ?? startup.country_iso3}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end flex-shrink-0">
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', SECTOR_COLORS[startup.sector] ?? SECTOR_COLORS.other)}>
                {startup.sector}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {STAGE_LABELS[startup.stage] ?? startup.stage}
              </span>
              <span className={cn('text-xs font-bold px-2 py-0.5 rounded', TIER_COLORS[startup.verification_tier] ?? TIER_COLORS.C)}>
                {startup.verification_tier}
              </span>
            </div>
          </div>

          {/* Viability score */}
          {score != null && (
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Viability Score</span>
                <span className={cn('text-2xl font-bold tabular-nums', scoreColor)}>
                  {score}<span className="text-sm font-normal text-slate-300 ml-0.5">/100</span>
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn('h-2 rounded-full', barColor)} style={{ width: `${score}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Composite signal — not investment advice. Weighted across market need, opportunity context, traction, funding signals, and founder visibility.
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            {startup.description && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">About</h2>
                <p className="text-sm text-slate-700 leading-relaxed">{startup.description}</p>
              </div>
            )}

            {/* Problem / Solution */}
            {(startup.problem || startup.solution) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {startup.problem && (
                  <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-5">
                    <h2 className="text-xs font-semibold text-rose-400 uppercase tracking-widest mb-3">Problem</h2>
                    <p className="text-sm text-slate-700 leading-relaxed">{startup.problem}</p>
                  </div>
                )}
                {startup.solution && (
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5">
                    <h2 className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-3">Solution</h2>
                    <p className="text-sm text-slate-700 leading-relaxed">{startup.solution}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI brief */}
            {startup.ai_brief && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">AI Brief</h2>
                <p className="text-sm text-slate-600 leading-relaxed italic">{startup.ai_brief}</p>
              </div>
            )}

            {/* Funding */}
            {(startup.funding_amount_usd || startup.funding_source) && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Funding</h2>
                <div className="flex items-baseline gap-3 flex-wrap">
                  {startup.funding_amount_usd && (
                    <span className="text-2xl font-bold text-slate-900">
                      ${(startup.funding_amount_usd / 1_000_000).toFixed(1)}M
                    </span>
                  )}
                  {startup.funding_source && (
                    <span className="text-sm text-slate-500 leading-relaxed">{startup.funding_source}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Side column */}
          <div className="space-y-4">
            {/* Quick info */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
              {startup.founder_name && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Founder</p>
                  <p className="text-sm font-medium text-slate-800">{startup.founder_name}</p>
                </div>
              )}
              {startup.website && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Website</p>
                  <Link
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline truncate block"
                  >
                    {startup.website.replace(/^https?:\/\//, '')}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Verification</p>
                <p className="text-xs text-slate-600">{TIER_LABELS[startup.verification_tier] ?? TIER_LABELS.C}</p>
              </div>
              {startup.source_url && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Source</p>
                  <Link
                    href={startup.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {startup.source_name ?? 'View source'} →
                  </Link>
                </div>
              )}
            </div>

            {/* SDG alignment */}
            {startup.sdg_tags.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">SDG Alignment</p>
                <div className="flex flex-wrap gap-2">
                  {startup.sdg_tags.map((n) => (
                    <div
                      key={n}
                      className="flex flex-col items-center bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 text-center"
                    >
                      <span className="text-xs font-bold text-slate-700">{n}</span>
                      <span className="text-[10px] text-slate-400 leading-tight max-w-[60px]">
                        {SDG_LABELS[n as keyof typeof SDG_LABELS]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Impact tags */}
            {startup.impact_tags.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Impact Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {startup.impact_tags.map((tag) => (
                    <span key={tag} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Not investment advice.</strong> Viability score is an informational signal only. Always conduct your own due diligence before investing.
              </p>
            </div>
          </div>
        </div>

        {/* Related startups */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Related Startups</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((s) => (
                <StartupCard key={s.id} startup={s} />
              ))}
            </div>
          </div>
        )}
      </PageShell>
    </>
  )
}
