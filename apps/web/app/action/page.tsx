import { Navbar } from "@/components/layout/navbar"
import { PageShell, PageHeader } from "@/components/layout/page-shell"
import { ActionsGrid } from "@/components/ui/actions-grid"
import { getAllActions } from "@/lib/supabase-server"
import { MOCK_ACTIONS } from "@/lib/mock-data"

export const dynamic = 'force-dynamic'
export const metadata = { title: "Take Action", description: "21 verified actions — donate, volunteer, invest or learn — to support people across Africa through trusted organisations.", openGraph: { title: "Take Action | AfricaImpactLab", description: "Find ways to donate, volunteer, invest or learn with verified African impact organisations." } }

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
        <PageHeader
          title="Take Action"
          description="Verified opportunities to donate, volunteer, invest, and learn — linked to real needs in African countries."
        />
        <ActionsGrid actions={actions} />
      </PageShell>
    </>
  )
}
