/**
 * One-time seed endpoint — populates organizations and actions tables.
 * Run once after deploy: GET /api/seed (with CRON_SECRET header)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

const ORGS = [
  {
    id: 'org-wateraid',
    name: 'WaterAid Africa',
    website: 'https://www.wateraid.org/africa',
    mission: 'Universal access to clean water, decent toilets and good hygiene across Africa — reaching the furthest behind first.',
    countries: ['KEN', 'ETH', 'TZA', 'GHA', 'SEN', 'MOZ', 'NGA', 'ZMB', 'MDG'],
    sectors: ['WASH', 'Health', 'Climate Adaptation'],
    sdg_tags: [3, 6],
    verification_tier: 'A',
    last_reviewed_at: '2026-03-01',
    action_types: ['donate', 'volunteer'],
    logo_url: null,
  },
  {
    id: 'org-amref',
    name: 'Amref Health Africa',
    website: 'https://amref.org',
    mission: 'Strengthening health systems through training, research and community engagement across sub-Saharan Africa.',
    countries: ['KEN', 'ETH', 'TZA', 'ZAF', 'SEN', 'UGA'],
    sectors: ['Health', 'Health Workforce'],
    sdg_tags: [3],
    verification_tier: 'A',
    last_reviewed_at: '2026-02-15',
    action_types: ['donate', 'volunteer'],
    logo_url: null,
  },
  {
    id: 'org-enza',
    name: 'Enza Capital',
    website: 'https://enzacapital.com',
    mission: 'Seed-stage venture capital investing in climate-smart agri-tech and fintech across East Africa.',
    countries: ['KEN', 'TZA', 'RWA', 'UGA'],
    sectors: ['Agri-tech', 'Fintech', 'Climate Tech'],
    sdg_tags: [1, 2, 8, 13],
    verification_tier: 'A',
    last_reviewed_at: '2026-03-01',
    action_types: ['invest'],
    logo_url: null,
  },
  {
    id: 'org-solarsister',
    name: 'Solar Sister',
    website: 'https://solarsister.org',
    mission: 'Training women entrepreneurs to bring clean energy to last-mile communities, ending energy poverty one woman at a time.',
    countries: ['TZA', 'NGA', 'ETH', 'RWA', 'UGA'],
    sectors: ['Renewable Energy', 'Gender Equality', 'Economic Empowerment'],
    sdg_tags: [5, 7, 13],
    verification_tier: 'A',
    last_reviewed_at: '2026-01-05',
    action_types: ['donate', 'invest'],
    logo_url: null,
  },
  {
    id: 'org-egn',
    name: 'Educate Girls Nigeria',
    website: 'https://educategirlsnigeria.org',
    mission: 'Keeping girls in secondary school across Northern Nigeria through scholarships, mentorship, and community engagement.',
    countries: ['NGA'],
    sectors: ['Education', 'Gender Equality'],
    sdg_tags: [4, 5],
    verification_tier: 'A',
    last_reviewed_at: '2026-01-20',
    action_types: ['donate'],
    logo_url: null,
  },
  {
    id: 'org-givedirectly',
    name: 'GiveDirectly',
    website: 'https://www.givedirectly.org',
    mission: 'Enabling donors to send money directly to people living in extreme poverty, with no strings attached.',
    countries: ['KEN', 'UGA', 'ETH', 'RWA', 'MOZ'],
    sectors: ['Poverty Alleviation', 'Cash Transfers'],
    sdg_tags: [1, 2, 10],
    verification_tier: 'A',
    last_reviewed_at: '2026-02-01',
    action_types: ['donate'],
    logo_url: null,
  },
  {
    id: 'org-oneacrefund',
    name: 'One Acre Fund',
    website: 'https://oneacrefund.org',
    mission: 'Serving smallholder farmers in Africa with seeds, training, and financing to sustainably increase their harvests.',
    countries: ['KEN', 'RWA', 'TZA', 'ETH', 'MOZ', 'ZMB'],
    sectors: ['Agriculture', 'Food Security', 'Climate Adaptation'],
    sdg_tags: [1, 2, 13],
    verification_tier: 'A',
    last_reviewed_at: '2026-02-10',
    action_types: ['donate', 'volunteer'],
    logo_url: null,
  },
  {
    id: 'org-practicalaction',
    name: 'Practical Action',
    website: 'https://practicalaction.org',
    mission: 'Using technology to challenge poverty in developing countries — from disaster risk reduction to renewable energy access.',
    countries: ['KEN', 'ZMB', 'ZAF', 'MOZ', 'ETH'],
    sectors: ['Renewable Energy', 'Climate Adaptation', 'WASH', 'Agriculture'],
    sdg_tags: [7, 9, 11, 13],
    verification_tier: 'A',
    last_reviewed_at: '2026-01-15',
    action_types: ['donate', 'learn'],
    logo_url: null,
  },
  {
    id: 'org-gsbi',
    name: 'Global Startup Bridge Initiative',
    website: 'https://gsbi.africa',
    mission: 'Connecting African founders with global investors and mentors to scale impact-first startups.',
    countries: ['KEN', 'NGA', 'GHA', 'RWA', 'SEN'],
    sectors: ['Fintech', 'Digital Economy', 'Impact Investing'],
    sdg_tags: [8, 9, 17],
    verification_tier: 'B',
    last_reviewed_at: '2026-03-10',
    action_types: ['invest', 'learn'],
    logo_url: null,
  },
  {
    id: 'org-ashoka',
    name: 'Ashoka Africa',
    website: 'https://www.ashoka.org/africa',
    mission: "Supporting Africa's leading social entrepreneurs to scale proven solutions to society's most pressing challenges.",
    countries: ['KEN', 'NGA', 'GHA', 'ZAF', 'SEN', 'ETH'],
    sectors: ['Social Enterprise', 'Education', 'Health', 'Economic Empowerment'],
    sdg_tags: [4, 8, 10],
    verification_tier: 'A',
    last_reviewed_at: '2026-01-30',
    action_types: ['invest', 'volunteer', 'learn'],
    logo_url: null,
  },
  {
    id: 'org-msfafrica',
    name: 'Médecins Sans Frontières — Africa',
    website: 'https://www.msf.org',
    mission: 'Providing impartial medical care to people affected by conflict, epidemics, disasters, or exclusion from healthcare.',
    countries: ['COD', 'ETH', 'SEN', 'NGA', 'MOZ', 'ZAF', 'CMR'],
    sectors: ['Humanitarian Response', 'Health', 'Emergency Medicine'],
    sdg_tags: [3, 16],
    verification_tier: 'A',
    last_reviewed_at: '2026-02-20',
    action_types: ['donate', 'volunteer'],
    logo_url: null,
  },
  {
    id: 'org-afrimapper',
    name: 'AfriMapper',
    website: 'https://afrimapper.org',
    mission: 'Building open geospatial data infrastructure for African development — mapping infrastructure, resources and vulnerability.',
    countries: ['KEN', 'NGA', 'GHA', 'TZA', 'ETH', 'RWA'],
    sectors: ['Open Data', 'Digital Infrastructure', 'Urban Planning'],
    sdg_tags: [9, 11, 17],
    verification_tier: 'B',
    last_reviewed_at: '2026-03-05',
    action_types: ['volunteer', 'learn'],
    logo_url: null,
  },
]

const ACTIONS = [
  // WaterAid
  { id: 'act-wateraid-1', type: 'donate', title: 'Fund safe water access in rural Kenya', description: "WaterAid's Kenya programme reaches underserved communities in arid Turkana and Marsabit counties. Each £30 provides clean water for one person for life.", org_name: 'WaterAid Africa', org_id: 'org-wateraid', org_verification_tier: 'A', country_iso3: 'KEN', url: 'https://www.wateraid.org/uk/donate' },
  { id: 'act-wateraid-2', type: 'donate', title: 'Emergency WASH response — Mozambique floods', description: 'Cholera prevention and clean water delivery following seasonal flooding in low-lying provinces.', org_name: 'WaterAid Africa', org_id: 'org-wateraid', org_verification_tier: 'A', country_iso3: 'MOZ', url: 'https://www.wateraid.org/uk/donate' },
  { id: 'act-wateraid-3', type: 'volunteer', title: 'Remote WASH data analyst (3-month)', description: "Support WaterAid's data team with analysis of water point functionality surveys across East Africa. Flexible remote hours.", org_name: 'WaterAid Africa', org_id: 'org-wateraid', org_verification_tier: 'A', country_iso3: 'KEN', url: 'https://www.wateraid.org/uk/get-involved/volunteer' },
  // Amref
  { id: 'act-amref-1', type: 'donate', title: 'Train community health workers in Ethiopia', description: "Amref's health extension worker programme has trained 38,000+ community health workers. Donate to expand to Afar and Somali regions.", org_name: 'Amref Health Africa', org_id: 'org-amref', org_verification_tier: 'A', country_iso3: 'ETH', url: 'https://amref.org/donate' },
  { id: 'act-amref-2', type: 'volunteer', title: 'Medical professional — remote consultation programme', description: 'Virtual specialist consultations supporting district hospitals in Tanzania and Uganda. Minimum 2 sessions/month.', org_name: 'Amref Health Africa', org_id: 'org-amref', org_verification_tier: 'A', country_iso3: 'TZA', url: 'https://amref.org/get-involved/volunteer' },
  // Enza Capital
  { id: 'act-enza-1', type: 'invest', title: 'Agri-fintech seed fund — East Africa 2026', description: "Enza's Fund III focuses on climate-smart agriculture and financial inclusion for smallholders in Kenya, Tanzania and Rwanda. Min. ticket: $25k.", org_name: 'Enza Capital', org_id: 'org-enza', org_verification_tier: 'A', country_iso3: 'KEN', url: 'https://enzacapital.com' },
  // Solar Sister
  { id: 'act-solarsister-1', type: 'donate', title: 'Equip a Solar Sister entrepreneur in Nigeria', description: 'Each $200 donation helps a woman entrepreneur access clean energy products, training, and a business-in-a-bag starter kit.', org_name: 'Solar Sister', org_id: 'org-solarsister', org_verification_tier: 'A', country_iso3: 'NGA', url: 'https://solarsister.org/donate' },
  { id: 'act-solarsister-2', type: 'invest', title: 'Impact investment — off-grid solar distribution', description: "Blended-finance opportunities in Solar Sister's last-mile distribution network across East Africa. Returns linked to climate impact metrics.", org_name: 'Solar Sister', org_id: 'org-solarsister', org_verification_tier: 'A', country_iso3: 'TZA', url: 'https://solarsister.org/invest' },
  // Educate Girls Nigeria
  { id: 'act-egn-1', type: 'donate', title: "Sponsor a girl's secondary education in Kano State", description: "£180/year covers school fees, books and mentoring for one girl in Northern Nigeria. 94% of sponsored girls complete secondary school.", org_name: 'Educate Girls Nigeria', org_id: 'org-egn', org_verification_tier: 'A', country_iso3: 'NGA', url: 'https://educategirlsnigeria.org/donate' },
  // GiveDirectly
  { id: 'act-givedirectly-1', type: 'donate', title: 'Direct cash transfer to families in extreme poverty — Kenya', description: 'GiveDirectly sends cash directly to verified ultra-poor households. 89% of funds reach recipients. No restrictions on use.', org_name: 'GiveDirectly', org_id: 'org-givedirectly', org_verification_tier: 'A', country_iso3: 'KEN', url: 'https://www.givedirectly.org/give-now' },
  { id: 'act-givedirectly-2', type: 'donate', title: 'Emergency cash relief — Ethiopia drought response', description: 'Rapid unconditional cash transfers to households affected by the Horn of Africa drought. Disbursed within 48 hours of verification.', org_name: 'GiveDirectly', org_id: 'org-givedirectly', org_verification_tier: 'A', country_iso3: 'ETH', url: 'https://www.givedirectly.org/give-now' },
  // One Acre Fund
  { id: 'act-oaf-1', type: 'donate', title: 'Support smallholder farmers in Rwanda', description: 'One Acre Fund provides seeds, fertiliser on credit, and training. Average farmer sees a 50% increase in income. Donate to expand coverage.', org_name: 'One Acre Fund', org_id: 'org-oneacrefund', org_verification_tier: 'A', country_iso3: 'RWA', url: 'https://oneacrefund.org/donate' },
  { id: 'act-oaf-2', type: 'volunteer', title: 'Field operations manager — East Africa', description: '12-month placement managing field teams in Kenya or Tanzania. Background in agriculture, logistics or operations required.', org_name: 'One Acre Fund', org_id: 'org-oneacrefund', org_verification_tier: 'A', country_iso3: 'KEN', url: 'https://oneacrefund.org/careers' },
  // Practical Action
  { id: 'act-pa-1', type: 'donate', title: 'Solar irrigation for smallholders in Zambia', description: 'Fund solar water pumps for farmers in Southern Province — reducing dependence on rain-fed agriculture and extending the growing season.', org_name: 'Practical Action', org_id: 'org-practicalaction', org_verification_tier: 'A', country_iso3: 'ZMB', url: 'https://practicalaction.org/donate' },
  { id: 'act-pa-2', type: 'learn', title: 'Free online course: Climate-resilient agriculture in Africa', description: "Practical Action's open learning series on sustainable farming, water harvesting, and post-harvest loss reduction. 6 hours total.", org_name: 'Practical Action', org_id: 'org-practicalaction', org_verification_tier: 'A', country_iso3: null, url: 'https://practicalaction.org/learning' },
  // MSF
  { id: 'act-msf-1', type: 'donate', title: 'Emergency medical response — DR Congo', description: "MSF teams provide trauma surgery and cholera treatment in conflict-affected areas of eastern DRC. No strings attached — funding goes where it's most needed.", org_name: 'Médecins Sans Frontières — Africa', org_id: 'org-msfafrica', org_verification_tier: 'A', country_iso3: 'COD', url: 'https://www.msf.org/donate' },
  { id: 'act-msf-2', type: 'volunteer', title: 'Medical/logistical field positions — Africa placements', description: 'MSF recruits doctors, nurses, logisticians and finance staff for 6–12 month field missions across sub-Saharan Africa.', org_name: 'Médecins Sans Frontières — Africa', org_id: 'org-msfafrica', org_verification_tier: 'A', country_iso3: 'ETH', url: 'https://www.msf.org/work-us' },
  // GSBI
  { id: 'act-gsbi-1', type: 'invest', title: 'Impact-first startup portfolio — West Africa', description: 'GSBI curates a co-investment vehicle for screened African startups across fintech, agri-tech and health-tech in Ghana, Nigeria and Senegal.', org_name: 'Global Startup Bridge Initiative', org_id: 'org-gsbi', org_verification_tier: 'B', country_iso3: 'GHA', url: 'https://gsbi.africa/invest' },
  { id: 'act-gsbi-2', type: 'learn', title: 'Africa Startup Ecosystem Report 2026', description: 'Free annual report on funding trends, sector growth, and emerging opportunities across African startup ecosystems. PDF + webinar.', org_name: 'Global Startup Bridge Initiative', org_id: 'org-gsbi', org_verification_tier: 'B', country_iso3: null, url: 'https://gsbi.africa/report' },
  // AfriMapper
  { id: 'act-afrimapper-1', type: 'volunteer', title: 'OpenStreetMap contributor — infrastructure mapping', description: 'Help map roads, health facilities and water points in unmapped areas of sub-Saharan Africa. Remote, flexible. Training provided.', org_name: 'AfriMapper', org_id: 'org-afrimapper', org_verification_tier: 'B', country_iso3: null, url: 'https://afrimapper.org/volunteer' },
  // Ashoka
  { id: 'act-ashoka-1', type: 'learn', title: 'Social entrepreneur case studies — African innovators', description: "Free access to Ashoka's library of 200+ African social entrepreneur profiles, with impact metrics and replication guides.", org_name: 'Ashoka Africa', org_id: 'org-ashoka', org_verification_tier: 'A', country_iso3: null, url: 'https://www.ashoka.org/africa/social-entrepreneurs' },
]

async function seed(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  const [orgsResult, actionsResult] = await Promise.all([
    supabase.from('organizations').upsert(ORGS, { onConflict: 'id' }),
    supabase.from('actions').upsert(ACTIONS, { onConflict: 'id' }),
  ])

  const errors: Record<string, string> = {}
  if (orgsResult.error) errors.organizations = orgsResult.error.message
  if (actionsResult.error) errors.actions = actionsResult.error.message

  const hasErrors = Object.keys(errors).length > 0

  return NextResponse.json(
    {
      success: !hasErrors,
      seeded: {
        organizations: ORGS.length,
        actions: ACTIONS.length,
      },
      errors: hasErrors ? errors : undefined,
    },
    { status: hasErrors ? 500 : 200 }
  )
}

export async function GET(req: NextRequest) {
  return seed(req)
}

export async function POST(req: NextRequest) {
  return seed(req)
}
