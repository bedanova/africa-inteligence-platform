import { Navbar } from "@/components/layout/navbar"
import { PageShell, PageHeader } from "@/components/layout/page-shell"
import { PartnersGrid } from "@/components/ui/partners-grid"
import { getOrganizations } from "@/lib/supabase-server"
import type { Organization } from "@/types"

export const dynamic = 'force-dynamic'
export const metadata = { title: "Verified Partners" }

const MOCK_ORGS: Organization[] = [
  { id: 'org-wateraid', name: 'WaterAid Africa', website: 'https://www.wateraid.org/africa', mission: 'Universal access to clean water, decent toilets and good hygiene across Africa — reaching the furthest behind first.', countries: ['KEN','ETH','TZA','GHA','SEN','MOZ','NGA','ZMB','MDG'], sectors: ['WASH','Health','Climate Adaptation'], sdg_tags: [3,6], verification_tier: 'A', last_reviewed_at: '2026-03-01', action_types: ['donate','volunteer'] },
  { id: 'org-amref', name: 'Amref Health Africa', website: 'https://amref.org', mission: 'Strengthening health systems through training, research and community engagement across sub-Saharan Africa.', countries: ['KEN','ETH','TZA','ZAF','SEN','UGA'], sectors: ['Health','Health Workforce'], sdg_tags: [3], verification_tier: 'A', last_reviewed_at: '2026-02-15', action_types: ['donate','volunteer'] },
  { id: 'org-enza', name: 'Enza Capital', website: 'https://enzacapital.com', mission: 'Seed-stage venture capital investing in climate-smart agri-tech and fintech across East Africa.', countries: ['KEN','TZA','RWA','UGA'], sectors: ['Agri-tech','Fintech','Climate Tech'], sdg_tags: [1,2,8,13], verification_tier: 'A', last_reviewed_at: '2026-03-01', action_types: ['invest'] },
  { id: 'org-solarsister', name: 'Solar Sister', website: 'https://solarsister.org', mission: 'Training women entrepreneurs to bring clean energy to last-mile communities, ending energy poverty one woman at a time.', countries: ['TZA','NGA','ETH','RWA','UGA'], sectors: ['Renewable Energy','Gender Equality','Economic Empowerment'], sdg_tags: [5,7,13], verification_tier: 'A', last_reviewed_at: '2026-01-05', action_types: ['donate','invest'] },
  { id: 'org-egn', name: 'Educate Girls Nigeria', website: 'https://educategirlsnigeria.org', mission: 'Keeping girls in secondary school across Northern Nigeria through scholarships, mentorship, and community engagement.', countries: ['NGA'], sectors: ['Education','Gender Equality'], sdg_tags: [4,5], verification_tier: 'A', last_reviewed_at: '2026-01-20', action_types: ['donate'] },
  { id: 'org-givedirectly', name: 'GiveDirectly', website: 'https://www.givedirectly.org', mission: 'Enabling donors to send money directly to people living in extreme poverty, with no strings attached.', countries: ['KEN','UGA','ETH','RWA','MOZ'], sectors: ['Poverty Alleviation','Cash Transfers'], sdg_tags: [1,2,10], verification_tier: 'A', last_reviewed_at: '2026-02-01', action_types: ['donate'] },
  { id: 'org-oneacrefund', name: 'One Acre Fund', website: 'https://oneacrefund.org', mission: 'Serving smallholder farmers in Africa with seeds, training, and financing to sustainably increase their harvests.', countries: ['KEN','RWA','TZA','ETH','MOZ','ZMB'], sectors: ['Agriculture','Food Security','Climate Adaptation'], sdg_tags: [1,2,13], verification_tier: 'A', last_reviewed_at: '2026-02-10', action_types: ['donate','volunteer'] },
  { id: 'org-practicalaction', name: 'Practical Action', website: 'https://practicalaction.org', mission: 'Using technology to challenge poverty in developing countries — from disaster risk reduction to renewable energy access.', countries: ['KEN','ZMB','ZAF','MOZ','ETH'], sectors: ['Renewable Energy','Climate Adaptation','WASH','Agriculture'], sdg_tags: [7,9,11,13], verification_tier: 'A', last_reviewed_at: '2026-01-15', action_types: ['donate','learn'] },
  { id: 'org-gsbi', name: 'Global Startup Bridge Initiative', website: 'https://gsbi.africa', mission: 'Connecting African founders with global investors and mentors to scale impact-first startups.', countries: ['KEN','NGA','GHA','RWA','SEN'], sectors: ['Fintech','Digital Economy','Impact Investing'], sdg_tags: [8,9,17], verification_tier: 'B', last_reviewed_at: '2026-03-10', action_types: ['invest','learn'] },
  { id: 'org-ashoka', name: 'Ashoka Africa', website: 'https://www.ashoka.org/africa', mission: "Supporting Africa's leading social entrepreneurs to scale proven solutions to society's most pressing challenges.", countries: ['KEN','NGA','GHA','ZAF','SEN','ETH'], sectors: ['Social Enterprise','Education','Health','Economic Empowerment'], sdg_tags: [4,8,10], verification_tier: 'A', last_reviewed_at: '2026-01-30', action_types: ['invest','volunteer','learn'] },
  { id: 'org-msfafrica', name: 'Médecins Sans Frontières — Africa', website: 'https://www.msf.org', mission: 'Providing impartial medical care to people affected by conflict, epidemics, disasters, or exclusion from healthcare.', countries: ['COD','ETH','SEN','NGA','MOZ','ZAF','CMR'], sectors: ['Humanitarian Response','Health','Emergency Medicine'], sdg_tags: [3,16], verification_tier: 'A', last_reviewed_at: '2026-02-20', action_types: ['donate','volunteer'] },
  { id: 'org-afrimapper', name: 'AfriMapper', website: 'https://afrimapper.org', mission: 'Building open geospatial data infrastructure for African development — mapping infrastructure, resources and vulnerability.', countries: ['KEN','NGA','GHA','TZA','ETH','RWA'], sectors: ['Open Data','Digital Infrastructure','Urban Planning'], sdg_tags: [9,11,17], verification_tier: 'B', last_reviewed_at: '2026-03-05', action_types: ['volunteer','learn'] },
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
