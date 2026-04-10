import { Navbar } from "@/components/layout/navbar"
import { PageShell } from "@/components/layout/page-shell"
import { ActionsGrid } from "@/components/ui/actions-grid"
import { getAllActions } from "@/lib/supabase-server"
import { MOCK_ACTIONS } from "@/lib/mock-data"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: "Take Action",
  description: "Verified volunteer roles, donation opportunities, and investment leads — linked to real data across Africa.",
  openGraph: {
    title: "Take Action | AfricaImpactLab",
    description: "Find ways to volunteer, donate, invest or learn with verified African impact organisations.",
  },
}

async function getActions() {
  try {
    return await getAllActions()
  } catch {
    return Object.values(MOCK_ACTIONS).flat()
  }
}

export default async function ActionPage() {
  const actions = await getActions()

  return (
    <>
      <Navbar />
      <PageShell>
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Take Action</h1>
          <p className="text-slate-500 max-w-2xl">
            Every action is tied to verified impact data. Filter by what you can offer — volunteer your skills remotely,
            donate to vetted organisations, or explore investment opportunities.
          </p>
        </div>

        <ActionsGrid actions={actions} />
      </PageShell>
    </>
  )
}
