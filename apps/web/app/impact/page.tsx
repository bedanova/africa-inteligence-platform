import { Navbar } from "@/components/layout/navbar"
import { PageShell, PageHeader } from "@/components/layout/page-shell"
import { ImpactCharts } from "@/components/ui/impact-charts"
import { getOrganizations, getAllActions } from "@/lib/supabase-server"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: "Impact Dashboards" }

async function getImpactData() {
  try {
    const [orgs, actions] = await Promise.all([getOrganizations(), getAllActions()])
    return { orgs, actions }
  } catch {
    return { orgs: [], actions: [] }
  }
}

export default async function ImpactPage() {
  const { orgs, actions } = await getImpactData()

  // Compute summary stats
  const countriesCovered = new Set(orgs.flatMap((o) => o.countries)).size
  const sectorsCovered = new Set(orgs.flatMap((o) => o.sectors)).size

  const stats = [
    { label: 'Verified partners',  value: orgs.length,       desc: 'Independently reviewed organisations' },
    { label: 'Verified actions',   value: actions.length,    desc: 'Donate, volunteer, invest, learn' },
    { label: 'Countries covered',  value: countriesCovered,  desc: 'African countries with active partners' },
    { label: 'Sectors covered',    value: sectorsCovered,    desc: 'Development sectors represented' },
  ]

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Impact Dashboards"
          description="Verified partners, actions, and sector coverage — linked to real needs across African countries."
        />

        {/* KPI tiles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, desc }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <p className="text-4xl font-bold text-slate-900 mb-1">{value}</p>
              <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          ))}
        </div>

        {orgs.length > 0
          ? <ImpactCharts orgs={orgs} actions={actions} />
          : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 max-w-lg">
              <p className="text-sm font-semibold text-amber-800 mb-1">No partner data</p>
              <p className="text-sm text-amber-700">Run the seed-partners.sql in Supabase to populate organisations and actions.</p>
            </div>
          )
        }
      </PageShell>
    </>
  )
}
