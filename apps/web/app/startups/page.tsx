import { Navbar } from '@/components/layout/navbar'
import { PageShell, PageHeader, SectionHeader } from '@/components/layout/page-shell'
import { StartupExplorer } from '@/components/ui/startup-explorer'
import { getStartups, getLatestInvestmentBriefs } from '@/lib/supabase-startups'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Startups',
  description: 'Early-stage startup intelligence across Africa — fintech, agritech, and healthtech ventures in Kenya, Nigeria, Ghana, South Africa, and Rwanda.',
  openGraph: {
    title: 'Africa Startups | AfricaImpactLab',
    description: 'Discover and explore early-stage African startups with viability scoring, sector filters, and weekly AI investment briefs.',
  },
}

export default async function StartupsPage() {
  const [startups, briefs] = await Promise.all([
    getStartups().catch(() => []),
    getLatestInvestmentBriefs(3).catch(() => []),
  ])

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Startup Explorer"
          description="Early-stage ventures across Kenya, Nigeria, Ghana, South Africa, and Rwanda — fintech, agritech, and healthtech. Viability-scored and source-verified."
        />

        {/* Weekly investment briefs */}
        {briefs.length > 0 && (
          <div className="mb-8">
            <SectionHeader title="Weekly Investment Briefs" />
            <div className="space-y-4">
              {briefs.map((brief) => (
                <div key={brief.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">{brief.title}</h3>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {new Date(brief.week_of).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{brief.summary}</p>
                  {brief.bullets.length > 0 && (
                    <ul className="space-y-1">
                      {brief.bullets.map((b, i) => (
                        <li key={i} className="text-xs text-slate-500 flex gap-2">
                          <span className="text-blue-400 flex-shrink-0">·</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {brief.sources.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-3">Sources: {brief.sources.join(' · ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no briefs */}
        {briefs.length === 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-sm text-blue-700">
            <strong>Weekly Investment Briefs</strong> are generated every Monday. Run <code className="bg-blue-100 px-1 rounded text-xs">/admin → Generate Investment Brief</code> to create the first one.
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Not investment advice.</strong> AfricaImpactLab is an intelligence and research platform, not a broker or financial advisor. All startup data is sourced from public information and verified news sources. Viability scores are informational signals only.
          </p>
        </div>

        {/* Explorer */}
        {startups.length > 0 ? (
          <StartupExplorer startups={startups} />
        ) : (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm font-medium mb-1">No startups seeded yet.</p>
            <p className="text-xs">Go to <a href="/admin" className="text-blue-500 hover:underline">/admin</a> and run <strong>Seed Startups</strong> to populate.</p>
          </div>
        )}
      </PageShell>
    </>
  )
}
