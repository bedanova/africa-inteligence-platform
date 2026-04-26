import { Navbar } from '@/components/layout/navbar'
import { PageShell, PageHeader, SectionHeader } from '@/components/layout/page-shell'
import { StartupExplorer } from '@/components/ui/startup-explorer'
import { getStartups, getLatestInvestmentBriefs } from '@/lib/supabase-startups'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const FUNDING_SOURCES = [
  {
    name: 'Launch Africa Ventures',
    url: 'https://launchafrica.vc',
    stage: 'Seed',
    description: 'Pan-African pre-seed and seed VC. 130+ portfolio companies across 20 African countries.',
    geography: 'Pan-African (Kenya, Nigeria, Egypt, South Africa)',
    sectors: 'Multi-sector, Fintech, Health',
  },
  {
    name: 'TLcom Capital',
    url: 'https://tlcomcapital.com',
    stage: 'Seed — Series A',
    description: 'Pan-African VC backing technology companies across sub-Saharan Africa. $150M+ deployed.',
    geography: 'Pan-African (Kenya, Nigeria, Egypt)',
    sectors: 'Tech-enabled businesses',
  },
  {
    name: 'Founders Factory Africa',
    url: 'https://foundersfactory.africa',
    stage: 'Pre-seed',
    description: 'Accelerator and venture builder co-creating startups with corporates. Pre-seed investment + operational support.',
    geography: 'South Africa, Kenya, Nigeria',
    sectors: 'Multi-sector',
  },
  {
    name: 'Flat6Labs',
    url: 'https://flat6labs.com',
    stage: 'Pre-seed — Seed',
    description: 'Leading seed and early-stage VC in MENA & Africa. 400+ portfolio companies. $130M+ invested.',
    geography: 'Egypt, Tunisia, Morocco',
    sectors: 'Multi-sector, Fintech, Health',
  },
  {
    name: 'Novastar Ventures',
    url: 'https://novastarventures.com',
    stage: 'Seed — Series A',
    description: 'Impact-driven VC investing in businesses serving the mass market in East and West Africa.',
    geography: 'East & West Africa',
    sectors: 'Financial inclusion, Agriculture, Energy',
  },
  {
    name: 'Future Africa',
    url: 'https://future.africa',
    stage: 'Pre-seed — Seed',
    description: 'Early-stage fund backing Africa-focused startups. Led by Iyin Aboyeji (co-founder of Andela and Flutterwave).',
    geography: 'Pan-African',
    sectors: 'Fintech, Health, Education',
  },
  {
    name: 'MEST Africa',
    url: 'https://meltwater.org',
    stage: 'Pre-seed',
    description: 'Pan-African incubator providing training, investment, and mentorship to tech entrepreneurs.',
    geography: 'Ghana, Kenya, Nigeria, South Africa',
    sectors: 'Software, SaaS, Mobile',
  },
  {
    name: 'Savannah Fund',
    url: 'https://savannah.vc',
    stage: 'Seed',
    description: 'Seed-stage VC focused on mobile-first and tech startups in sub-Saharan Africa.',
    geography: 'Sub-Saharan Africa',
    sectors: 'Mobile, E-commerce, SaaS',
  },
  {
    name: 'Google for Startups Accelerator: Africa',
    url: 'https://startup.google.com/accelerator/africa/',
    stage: 'Pre-seed — Seed',
    description: 'Equity-free accelerator providing mentorship, Google Cloud credits, and technical support to African startups.',
    geography: 'Pan-African',
    sectors: 'AI/ML, Fintech, Health',
  },
]

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

        {/* Verified Pre-Seed & Seed Funding Sources */}
        <div className="mb-10">
          <SectionHeader title="Verified Pre-Seed & Seed Funding Sources" />
          <p className="text-sm text-slate-500 mb-4">
            Active investors and accelerators with a track record of funding early-stage African startups. All links verified.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {FUNDING_SOURCES.map((src) => (
              <a
                key={src.name}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{src.name}</h4>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500 flex-shrink-0">
                    {src.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">{src.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-400">{src.geography}</span>
                  {src.sectors && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{src.sectors}</span>
                    </>
                  )}
                </div>
              </a>
            ))}
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>How we verify:</strong> Every funding source is checked against public records, Crunchbase profiles, portfolio pages, and media coverage.
              We list only investors with at least one confirmed African portfolio company. Last reviewed: April 2026.
            </p>
          </div>
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
