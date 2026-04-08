import type {
  CountrySummary,
  AIBrief,
  CountryMetric,
  ActionCard,
  Region,
  Organization,
} from '@/types'

export const MOCK_COUNTRIES: CountrySummary[] = [
  // Eastern Africa
  { iso3: 'KEN', name: 'Kenya',          region: 'Eastern Africa',  flag_emoji: '🇰🇪', scores: { need: 62, opportunity: 74, stability: 55, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'ETH', name: 'Ethiopia',       region: 'Eastern Africa',  flag_emoji: '🇪🇹', scores: { need: 78, opportunity: 52, stability: 38, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'TZA', name: 'Tanzania',       region: 'Eastern Africa',  flag_emoji: '🇹🇿', scores: { need: 65, opportunity: 61, stability: 60, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'RWA', name: 'Rwanda',         region: 'Eastern Africa',  flag_emoji: '🇷🇼', scores: { need: 52, opportunity: 70, stability: 75, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'UGA', name: 'Uganda',         region: 'Eastern Africa',  flag_emoji: '🇺🇬', scores: { need: 68, opportunity: 58, stability: 48, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'MOZ', name: 'Mozambique',     region: 'Eastern Africa',  flag_emoji: '🇲🇿', scores: { need: 74, opportunity: 55, stability: 44, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  // Western Africa
  { iso3: 'NGA', name: 'Nigeria',        region: 'Western Africa',  flag_emoji: '🇳🇬', scores: { need: 71, opportunity: 68, stability: 41, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'GHA', name: 'Ghana',          region: 'Western Africa',  flag_emoji: '🇬🇭', scores: { need: 48, opportunity: 71, stability: 72, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'SEN', name: 'Senegal',        region: 'Western Africa',  flag_emoji: '🇸🇳', scores: { need: 55, opportunity: 64, stability: 67, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'CIV', name: "Côte d'Ivoire", region: 'Western Africa',  flag_emoji: '🇨🇮', scores: { need: 58, opportunity: 66, stability: 55, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'CMR', name: 'Cameroon',       region: 'Western Africa',  flag_emoji: '🇨🇲', scores: { need: 60, opportunity: 57, stability: 45, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  // Southern Africa
  { iso3: 'ZAF', name: 'South Africa',   region: 'Southern Africa', flag_emoji: '🇿🇦', scores: { need: 44, opportunity: 66, stability: 63, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'ZMB', name: 'Zambia',         region: 'Southern Africa', flag_emoji: '🇿🇲', scores: { need: 66, opportunity: 58, stability: 54, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'AGO', name: 'Angola',         region: 'Southern Africa', flag_emoji: '🇦🇴', scores: { need: 70, opportunity: 56, stability: 50, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  // Northern Africa
  { iso3: 'EGY', name: 'Egypt',          region: 'Northern Africa', flag_emoji: '🇪🇬', scores: { need: 50, opportunity: 65, stability: 52, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'MAR', name: 'Morocco',        region: 'Northern Africa', flag_emoji: '🇲🇦', scores: { need: 42, opportunity: 68, stability: 64, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'DZA', name: 'Algeria',        region: 'Northern Africa', flag_emoji: '🇩🇿', scores: { need: 38, opportunity: 59, stability: 57, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  { iso3: 'TUN', name: 'Tunisia',        region: 'Northern Africa', flag_emoji: '🇹🇳', scores: { need: 36, opportunity: 61, stability: 48, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  // Central Africa
  { iso3: 'COD', name: 'DR Congo',       region: 'Central Africa',  flag_emoji: '🇨🇩', scores: { need: 82, opportunity: 44, stability: 28, updated_at: new Date().toISOString() }, freshness: 'fresh' },
  // Indian Ocean
  { iso3: 'MDG', name: 'Madagascar',     region: 'Eastern Africa',  flag_emoji: '🇲🇬', scores: { need: 72, opportunity: 48, stability: 50, updated_at: new Date().toISOString() }, freshness: 'fresh' },
]

export const MOCK_BRIEFS: AIBrief[] = [
  {
    id: 'brief-001',
    title: 'East Africa: Sustained economic growth amid climate stress',
    summary:
      'GDP growth across East Africa remains above Sub-Saharan average, driven by services and mobile-first fintech adoption. Seasonal drought pressure continues in the Horn, with 3.2M people in Ethiopia requiring acute food assistance through Q2 2026.',
    bullets: [
      'Kenya GDP growth forecast at 5.1% for 2026 (World Bank, Apr 2026)',
      'Ethiopia acute food insecurity: 3.2M affected in Tigray and Afar regions (OCHA, Mar 2026)',
      'Rwanda digital economy index ranks 2nd in Africa for 2025 (AfDB)',
      'Mobile money penetration in East Africa now exceeds 65% of adult population (GSMA 2025)',
    ],
    risk_flags: ['Drought pressure Horn of Africa', 'Political transition Ethiopia'],
    citations: [
      { id: 'c1', label: 'World Bank Africa Pulse Apr 2026', source_type: 'official_data' },
      { id: 'c2', label: 'OCHA Ethiopia Situation Report Mar 2026', source_type: 'report' },
      { id: 'c3', label: 'AfDB African Economic Outlook 2025', source_type: 'official_data' },
      { id: 'c4', label: 'GSMA Mobile Economy Sub-Saharan Africa 2025', source_type: 'official_data' },
    ],
    scope: 'continent',
    freshness: 'fresh',
    generated_at: new Date().toISOString(),
    model_name: 'mock-v0',
    confidence: 0.88,
  },
  {
    id: 'brief-002',
    title: 'Nigeria: Infrastructure gap constrains opportunity capture',
    summary:
      'Nigeria holds the largest GDP and population in Africa but persistent electricity access gaps (41% of population) and currency instability constrain tech sector growth despite strong startup activity.',
    bullets: [
      'Electricity access: 41% national coverage, 17% rural (IEA 2025)',
      'Naira stabilised at ~1,580 NGN/USD after CBN policy interventions (Q1 2026)',
      'Lagos startup ecosystem ranked 3rd in Africa by deal volume (Partech 2025)',
    ],
    risk_flags: ['Currency volatility', 'Fuel subsidy reform impact'],
    citations: [
      { id: 'c5', label: 'IEA Africa Energy Outlook 2025', source_type: 'official_data' },
      { id: 'c6', label: 'Partech Africa Report 2025', source_type: 'report' },
    ],
    scope: 'country',
    country_iso3: 'NGA',
    freshness: 'fresh',
    generated_at: new Date().toISOString(),
    model_name: 'mock-v0',
    confidence: 0.82,
  },
  {
    id: 'brief-003',
    title: 'Rwanda: Governance model drives stability and investment',
    summary:
      'Rwanda maintains the highest governance score in the dataset, with strong public institution performance and a digital services economy growing at 7.2% annually. SDG 16 (Peace & Justice) scores rank first in Sub-Saharan Africa.',
    bullets: [
      'V-Dem institutional quality score: 0.71/1.0 (highest in dataset)',
      'ICT sector contribution to GDP: 8.1% in 2025 (RDB)',
      'World Bank Doing Business rank: 38th globally, 1st in EAC region',
    ],
    risk_flags: [],
    citations: [
      { id: 'c7', label: 'V-Dem Dataset v14 2025', source_type: 'official_data' },
      { id: 'c8', label: 'Rwanda Development Board Annual Report 2025', source_type: 'report' },
    ],
    scope: 'country',
    country_iso3: 'RWA',
    freshness: 'fresh',
    generated_at: new Date().toISOString(),
    model_name: 'mock-v0',
    confidence: 0.91,
  },
]

export const MOCK_METRICS: Record<string, CountryMetric[]> = {
  KEN: [
    { key: 'gdp_growth', label: 'GDP Growth', value: 5.1, unit: '%', trend: 'up', source: 'World Bank', source_year: 2026, freshness: 'fresh' },
    { key: 'connectivity', label: 'Internet Access', value: 42, unit: '%', trend: 'up', source: 'GSMA', source_year: 2025, freshness: 'fresh' },
    { key: 'conflict_pressure', label: 'Conflict Pressure', value: 'Moderate', unit: undefined, trend: 'flat', source: 'ACLED', source_year: 2026, freshness: 'fresh' },
    { key: 'health_burden', label: 'Under-5 Mortality', value: 38, unit: 'per 1k', trend: 'down', source: 'WHO GHO', source_year: 2024, freshness: 'aging' },
  ],
  NGA: [
    { key: 'gdp_growth', label: 'GDP Growth', value: 3.2, unit: '%', trend: 'flat', source: 'World Bank', source_year: 2026, freshness: 'fresh' },
    { key: 'connectivity', label: 'Internet Access', value: 35, unit: '%', trend: 'up', source: 'GSMA', source_year: 2025, freshness: 'fresh' },
    { key: 'conflict_pressure', label: 'Conflict Pressure', value: 'High', unit: undefined, trend: 'up', source: 'ACLED', source_year: 2026, freshness: 'fresh' },
    { key: 'health_burden', label: 'Under-5 Mortality', value: 71, unit: 'per 1k', trend: 'down', source: 'WHO GHO', source_year: 2024, freshness: 'aging' },
  ],
  ETH: [
    { key: 'gdp_growth', label: 'GDP Growth', value: 6.5, unit: '%', trend: 'up', source: 'World Bank', source_year: 2026, freshness: 'fresh' },
    { key: 'connectivity', label: 'Internet Access', value: 22, unit: '%', trend: 'up', source: 'GSMA', source_year: 2025, freshness: 'fresh' },
    { key: 'conflict_pressure', label: 'Conflict Pressure', value: 'Very High', unit: undefined, trend: 'flat', source: 'ACLED', source_year: 2026, freshness: 'fresh' },
    { key: 'health_burden', label: 'Under-5 Mortality', value: 52, unit: 'per 1k', trend: 'down', source: 'WHO GHO', source_year: 2024, freshness: 'aging' },
  ],
  GHA: [
    { key: 'gdp_growth', label: 'GDP Growth', value: 4.7, unit: '%', trend: 'up', source: 'World Bank', source_year: 2026, freshness: 'fresh' },
    { key: 'connectivity', label: 'Internet Access', value: 58, unit: '%', trend: 'up', source: 'GSMA', source_year: 2025, freshness: 'fresh' },
    { key: 'conflict_pressure', label: 'Conflict Pressure', value: 'Low', unit: undefined, trend: 'flat', source: 'ACLED', source_year: 2026, freshness: 'fresh' },
    { key: 'health_burden', label: 'Under-5 Mortality', value: 44, unit: 'per 1k', trend: 'down', source: 'WHO GHO', source_year: 2024, freshness: 'aging' },
  ],
  ZAF: [
    { key: 'gdp_growth', label: 'GDP Growth', value: 1.9, unit: '%', trend: 'down', source: 'World Bank', source_year: 2026, freshness: 'fresh' },
    { key: 'connectivity', label: 'Internet Access', value: 72, unit: '%', trend: 'up', source: 'GSMA', source_year: 2025, freshness: 'fresh' },
    { key: 'conflict_pressure', label: 'Conflict Pressure', value: 'Low-Mod', unit: undefined, trend: 'flat', source: 'ACLED', source_year: 2026, freshness: 'fresh' },
    { key: 'health_burden', label: 'Under-5 Mortality', value: 30, unit: 'per 1k', trend: 'down', source: 'WHO GHO', source_year: 2024, freshness: 'aging' },
  ],
}

export const MOCK_ACTIONS: Record<string, ActionCard[]> = {
  KEN: [
    {
      id: 'a-ken-1',
      type: 'donate',
      title: 'Support WASH programs in Turkana County',
      org_name: 'WaterAid Kenya',
      org_id: 'org-wateraid',
      org_verification_tier: 'A',
      country_iso3: 'KEN',
      url: '#',
      description: 'Funding clean water access for 50,000+ people in arid regions.',
    },
    {
      id: 'a-ken-2',
      type: 'volunteer',
      title: 'Remote data analyst — health indicators',
      org_name: 'AfriMapper',
      org_id: 'org-afrimapper',
      org_verification_tier: 'B',
      country_iso3: 'KEN',
      url: '#',
      description: '3-month remote engagement, flexible hours.',
    },
    {
      id: 'a-ken-3',
      type: 'invest',
      title: 'Agri-fintech seed opportunities — East Africa',
      org_name: 'Enza Capital',
      org_id: 'org-enza',
      org_verification_tier: 'A',
      country_iso3: 'KEN',
      url: '#',
      description: 'Screened early-stage opportunities in climate-smart agriculture.',
    },
  ],
  NGA: [
    {
      id: 'a-nga-1',
      type: 'donate',
      title: "Girls' secondary education in Kano State",
      org_name: 'Educate Girls Nigeria',
      org_id: 'org-egn',
      org_verification_tier: 'A',
      country_iso3: 'NGA',
      url: '#',
    },
    {
      id: 'a-nga-2',
      type: 'learn',
      title: 'Nigeria energy transition — policy brief',
      org_name: 'Energy Policy Research Africa',
      org_id: 'org-epra',
      org_verification_tier: 'B',
      country_iso3: 'NGA',
      url: '#',
    },
  ],
}

export const MOCK_SECTORS: Record<string, string[]> = {
  KEN: ['Fintech', 'Agri-tech', 'WASH', 'Renewable Energy', 'Health'],
  NGA: ['Energy Access', 'Education', 'Fintech', 'Climate Adaptation'],
  ETH: ['Humanitarian Response', 'WASH', 'Food Security', 'Health'],
  GHA: ['Cocoa Value Chain', 'Fintech', 'Renewable Energy', 'Education'],
  ZAF: ['Renewable Energy', 'Fintech', 'Mining Tech', 'Healthcare'],
  TZA: ['Tourism', 'Agriculture', 'WASH', 'Education'],
  RWA: ['Digital Economy', 'Healthcare', 'Agriculture', 'Manufacturing'],
  SEN: ['Fisheries', 'Agriculture', 'Renewable Energy', 'Fintech'],
}

export function getCountryBrief(iso3: string): AIBrief | null {
  return MOCK_BRIEFS.find((b) => b.country_iso3 === iso3) ?? null
}

export const MOCK_ORGS: Organization[] = [
  { id: 'org-wateraid', name: 'WaterAid Africa', website: 'https://www.wateraid.org/africa', mission: 'Universal access to clean water, decent toilets and good hygiene across Africa.', countries: ['KEN','ETH','TZA','GHA','SEN','MOZ','NGA','ZMB','MDG'], sectors: ['WASH','Health','Climate Adaptation'], sdg_tags: [3,6], verification_tier: 'A', last_reviewed_at: '2026-03-01', action_types: ['donate','volunteer'] },
  { id: 'org-amref', name: 'Amref Health Africa', website: 'https://amref.org', mission: 'Strengthening health systems through training, research and community engagement across sub-Saharan Africa.', countries: ['KEN','ETH','TZA','ZAF','SEN','UGA'], sectors: ['Health','Health Workforce'], sdg_tags: [3], verification_tier: 'A', last_reviewed_at: '2026-02-15', action_types: ['donate','volunteer'] },
  { id: 'org-enza', name: 'Enza Capital', website: 'https://enzacapital.com', mission: 'Seed-stage venture capital investing in climate-smart agri-tech and fintech across East Africa.', countries: ['KEN','TZA','RWA','UGA'], sectors: ['Agri-tech','Fintech','Climate Tech'], sdg_tags: [1,2,8,13], verification_tier: 'A', last_reviewed_at: '2026-03-01', action_types: ['invest'] },
  { id: 'org-solarsister', name: 'Solar Sister', website: 'https://solarsister.org', mission: 'Training women entrepreneurs to bring clean energy to last-mile communities.', countries: ['TZA','NGA','ETH','RWA','UGA'], sectors: ['Renewable Energy','Gender Equality','Economic Empowerment'], sdg_tags: [5,7,13], verification_tier: 'A', last_reviewed_at: '2026-01-05', action_types: ['donate','invest'] },
  { id: 'org-egn', name: 'Educate Girls Nigeria', website: 'https://educategirlsnigeria.org', mission: 'Keeping girls in secondary school across Northern Nigeria through scholarships and mentorship.', countries: ['NGA'], sectors: ['Education','Gender Equality'], sdg_tags: [4,5], verification_tier: 'A', last_reviewed_at: '2026-01-20', action_types: ['donate'] },
  { id: 'org-givedirectly', name: 'GiveDirectly', website: 'https://www.givedirectly.org', mission: 'Enabling donors to send money directly to people living in extreme poverty.', countries: ['KEN','UGA','ETH','RWA','MOZ'], sectors: ['Poverty Alleviation','Cash Transfers'], sdg_tags: [1,2,10], verification_tier: 'A', last_reviewed_at: '2026-02-01', action_types: ['donate'] },
  { id: 'org-oneacrefund', name: 'One Acre Fund', website: 'https://oneacrefund.org', mission: 'Serving smallholder farmers in Africa with seeds, training, and financing to increase harvests.', countries: ['KEN','RWA','TZA','ETH','MOZ','ZMB'], sectors: ['Agriculture','Food Security','Climate Adaptation'], sdg_tags: [1,2,13], verification_tier: 'A', last_reviewed_at: '2026-02-10', action_types: ['donate','volunteer'] },
  { id: 'org-practicalaction', name: 'Practical Action', website: 'https://practicalaction.org', mission: 'Using technology to challenge poverty in developing countries.', countries: ['KEN','ZMB','ZAF','MOZ','ETH'], sectors: ['Renewable Energy','Climate Adaptation','WASH','Agriculture'], sdg_tags: [7,9,11,13], verification_tier: 'A', last_reviewed_at: '2026-01-15', action_types: ['donate','learn'] },
  { id: 'org-gsbi', name: 'Global Startup Bridge Initiative', website: 'https://gsbi.africa', mission: 'Connecting African founders with global investors and mentors to scale impact-first startups.', countries: ['KEN','NGA','GHA','RWA','SEN'], sectors: ['Fintech','Digital Economy','Impact Investing'], sdg_tags: [8,9,17], verification_tier: 'B', last_reviewed_at: '2026-03-10', action_types: ['invest','learn'] },
  { id: 'org-ashoka', name: 'Ashoka Africa', website: 'https://www.ashoka.org/africa', mission: "Supporting Africa's leading social entrepreneurs to scale proven solutions.", countries: ['KEN','NGA','GHA','ZAF','SEN','ETH'], sectors: ['Social Enterprise','Education','Health','Economic Empowerment'], sdg_tags: [4,8,10], verification_tier: 'A', last_reviewed_at: '2026-01-30', action_types: ['invest','volunteer','learn'] },
  { id: 'org-msfafrica', name: 'Médecins Sans Frontières — Africa', website: 'https://www.msf.org', mission: 'Providing impartial medical care to people affected by conflict, epidemics, and disasters.', countries: ['COD','ETH','SEN','NGA','MOZ','ZAF','CMR'], sectors: ['Humanitarian Response','Health','Emergency Medicine'], sdg_tags: [3,16], verification_tier: 'A', last_reviewed_at: '2026-02-20', action_types: ['donate','volunteer'] },
  { id: 'org-afrimapper', name: 'AfriMapper', website: 'https://afrimapper.org', mission: 'Building open geospatial data infrastructure for African development.', countries: ['KEN','NGA','GHA','TZA','ETH','RWA'], sectors: ['Open Data','Digital Infrastructure','Urban Planning'], sdg_tags: [9,11,17], verification_tier: 'B', last_reviewed_at: '2026-03-05', action_types: ['volunteer','learn'] },
]
