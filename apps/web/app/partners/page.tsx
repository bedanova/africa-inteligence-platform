import { Navbar } from "@/components/layout/navbar"
import { PageShell, PageHeader } from "@/components/layout/page-shell"
import { PartnersGrid } from "@/components/ui/partners-grid"
import { getOrganizations } from "@/lib/supabase-server"
import { MOCK_ORGS } from "@/lib/mock-data"

export const dynamic = 'force-dynamic'
export const metadata = { title: "Verified Partners", description: "12 editorially verified impact organisations working across Africa — donate, volunteer, invest or learn.", openGraph: { title: "Verified Partners | AfricaImpactLab", description: "Explore vetted NGOs and impact orgs active across Africa." } }

async function getAllOrgs() {
  try {
    return await getOrganizations()
  } catch {
    return MOCK_ORGS
  }
}

export default async function PartnersPage() {
  const orgs = await getAllOrgs()

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Verified Partners"
          description="Organisations verified by our editorial team — rated A or B based on transparency, impact evidence, and data quality."
        />
        <PartnersGrid orgs={orgs} />
      </PageShell>
    </>
  )
}
