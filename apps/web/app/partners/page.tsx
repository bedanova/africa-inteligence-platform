import { Navbar } from "@/components/layout/navbar"
import { PageShell, PageHeader } from "@/components/layout/page-shell"
import { PartnersGrid } from "@/components/ui/partners-grid"
import { getOrganizations } from "@/lib/supabase-server"
import type { Organization } from "@/types"

export const dynamic = 'force-dynamic'
export const metadata = { title: "Verified Partners" }

const MOCK_ORGS: Organization[] = [
  { id: 'org-wateraid', name: 'WaterAid Africa', website: 'https://www.wateraid.org', mission: 'Universal access to clean water, decent toilets and good hygiene across Africa.', countries: ['KEN','ETH','TZA','GHA','SEN'], sectors: ['WASH','Health'], sdg_tags: [3,6], verification_tier: 'A', last_reviewed_at: '2026-02-01', action_types: ['donate','volunteer'] },
  { id: 'org-amref', name: 'Amref Health Africa', website: 'https://amref.org', mission: 'Strengthening health systems and enabling communities to access quality, affordable healthcare.', countries: ['KEN','ETH','TZA','ZAF','SEN'], sectors: ['Health'], sdg_tags: [3], verification_tier: 'A', last_reviewed_at: '2026-02-15', action_types: ['donate','volunteer'] },
  { id: 'org-enza', name: 'Enza Capital', website: 'https://enzacapital.com', mission: 'Seed-stage venture capital investing in climate-smart agri-tech and fintech across East Africa.', countries: ['KEN','TZA','RWA'], sectors: ['Agri-tech','Fintech'], sdg_tags: [1,2,13], verification_tier: 'A', last_reviewed_at: '2026-03-01', action_types: ['invest'] },
  { id: 'org-solarsister', name: 'Solar Sister', website: 'https://solarsister.org', mission: 'Training women entrepreneurs to bring solar energy to last-mile communities across East Africa.', countries: ['TZA','NGA','ETH'], sectors: ['Renewable Energy'], sdg_tags: [5,7,13], verification_tier: 'A', last_reviewed_at: '2026-01-05', action_types: ['donate','invest'] },
  { id: 'org-egn', name: 'Educate Girls Nigeria', website: 'https://educategirlsnigeria.org', mission: 'Keeping girls in secondary school across Northern Nigeria through scholarships and community engagement.', countries: ['NGA'], sectors: ['Education'], sdg_tags: [4,5], verification_tier: 'A', last_reviewed_at: '2026-01-20', action_types: ['donate'] },
  { id: 'org-gsbi', name: 'Global Startup Bridge Initiative', website: 'https://gsbi.africa', mission: 'Connecting African founders with global investors and mentors to scale impact-first startups.', countries: ['KEN','NGA','GHA','RWA','SEN'], sectors: ['Fintech','Digital Economy'], sdg_tags: [8,9,17], verification_tier: 'B', last_reviewed_at: '2026-03-10', action_types: ['invest','learn'] },
]

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
