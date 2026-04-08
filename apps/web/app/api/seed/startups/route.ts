import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateViabilityScore } from '@/lib/startup-viability-score'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// Country baseline scores (approximate, will be updated by live ingest)
const COUNTRY_SCORES: Record<string, { need: number; opportunity: number }> = {
  KEN: { need: 62, opportunity: 58 },
  NGA: { need: 71, opportunity: 55 },
  GHA: { need: 48, opportunity: 52 },
  ZAF: { need: 44, opportunity: 65 },
  RWA: { need: 52, opportunity: 60 },
}

const STARTUPS = [
  // Kenya — fintech
  {
    id: 'pezesha',
    name: 'Pezesha',
    country_iso3: 'KEN',
    sector: 'fintech',
    stage: 'series-a',
    description: 'Digital credit infrastructure enabling SME lending across Africa through embedded finance partnerships.',
    problem: 'SMEs in Africa lack access to affordable working capital from formal financial institutions.',
    solution: 'API-first lending platform that lets banks and fintechs embed credit products for underserved SMEs.',
    founder_name: 'Hilda Moraa',
    website: 'https://pezesha.com',
    funding_amount_usd: 11000000,
    funding_source: 'IFC, Women\'s World Banking, Cardano',
    sdg_tags: [8, 10],
    impact_tags: ['financial-inclusion', 'sme-lending', 'women-led'],
    verification_tier: 'A',
    source_url: 'https://techcabal.com/2022/03/pezesha-series-a',
    source_name: 'TechCabal',
  },
  // Kenya — agritech
  {
    id: 'apollo-agriculture',
    name: 'Apollo Agriculture',
    country_iso3: 'KEN',
    sector: 'agritech',
    stage: 'series-a',
    description: 'Uses satellite data and machine learning to provide smallholder farmers with credit, inputs, and insurance.',
    problem: 'Smallholder farmers lack access to credit and quality inputs, limiting their yields and incomes.',
    solution: 'AI-powered platform scoring farmer creditworthiness via satellite imagery, then delivering inputs on credit.',
    founder_name: 'Eli Pollak',
    website: 'https://apolloagriculture.com',
    funding_amount_usd: 40000000,
    funding_source: 'Softbank, Anthemis, Flourish Ventures',
    sdg_tags: [1, 2, 8],
    impact_tags: ['food-security', 'smallholder-farmers', 'climate-smart'],
    verification_tier: 'A',
    source_url: 'https://techcabal.com/2022/apollo-agriculture',
    source_name: 'TechCabal',
  },
  // Kenya — healthtech
  {
    id: 'ilara-health',
    name: 'Ilara Health',
    country_iso3: 'KEN',
    sector: 'healthtech',
    stage: 'seed',
    description: 'Embeds affordable diagnostic devices into private primary care clinics, financed via revenue-share.',
    problem: 'Most Kenyans receive primary care from small private clinics that lack diagnostic tools.',
    solution: 'AI-powered portable diagnostic devices with embedded financing — clinics pay back from increased revenue.',
    founder_name: 'Emilian Popa',
    website: 'https://ilarahealth.com',
    funding_amount_usd: 3600000,
    funding_source: 'Leaps by Bayer, Y Combinator',
    sdg_tags: [3, 8],
    impact_tags: ['primary-care', 'diagnostics', 'rural-health'],
    verification_tier: 'B',
    source_url: 'https://techcabal.com/2021/ilara-health-seed',
    source_name: 'TechCabal',
  },
  // Nigeria — fintech
  {
    id: 'migo',
    name: 'Migo',
    country_iso3: 'NGA',
    sector: 'fintech',
    stage: 'series-a',
    description: 'Embedded lending platform enabling telcos, banks, and retailers to offer instant credit to customers.',
    problem: 'Most Nigerians are excluded from formal credit due to lack of credit history.',
    solution: 'API platform using alternative data (airtime, transaction patterns) to underwrite micro-loans.',
    founder_name: 'Ekechi Nwokah',
    website: 'https://migo.money',
    funding_amount_usd: 20000000,
    funding_source: 'Velocity Capital, IFC, MTN',
    sdg_tags: [8, 10],
    impact_tags: ['financial-inclusion', 'micro-credit', 'embedded-finance'],
    verification_tier: 'A',
    source_url: 'https://techcabal.com/2019/migo-funding',
    source_name: 'TechCabal',
  },
  // Nigeria — agritech
  {
    id: 'farmcrowdy',
    name: 'Farmcrowdy',
    country_iso3: 'NGA',
    sector: 'agritech',
    stage: 'seed',
    description: 'Digital agriculture platform connecting smallholder farmers with sponsors to fund farm cycles.',
    problem: 'Nigerian smallholder farmers lack capital to scale production and access to markets.',
    solution: 'Crowdfunding model where investors fund specific farm cycles and share in profits at harvest.',
    founder_name: 'Onyeka Akumah',
    website: 'https://farmcrowdy.com',
    funding_amount_usd: 1000000,
    funding_source: 'EchoVC, Lowercase Capital',
    sdg_tags: [1, 2, 8],
    impact_tags: ['food-security', 'crowdfunding', 'smallholder-farmers'],
    verification_tier: 'B',
    source_url: 'https://techpoint.africa/farmcrowdy',
    source_name: 'Techpoint Africa',
  },
  // Nigeria — healthtech
  {
    id: 'helium-health',
    name: 'Helium Health',
    country_iso3: 'NGA',
    sector: 'healthtech',
    stage: 'series-a',
    description: 'Hospital management software and health data infrastructure for African healthcare providers.',
    problem: 'African hospitals rely on paper-based systems, losing data and reducing efficiency.',
    solution: 'SaaS EMR and hospital management platform with data analytics and telemedicine modules.',
    founder_name: 'Adegoke Olubusi',
    website: 'https://heliumhealth.com',
    funding_amount_usd: 10000000,
    funding_source: 'Breega, Ohara Venture Partners',
    sdg_tags: [3, 17],
    impact_tags: ['digital-health', 'hospital-management', 'health-data'],
    verification_tier: 'A',
    source_url: 'https://techcabal.com/helium-health-series-a',
    source_name: 'TechCabal',
  },
  // Ghana — fintech
  {
    id: 'zeepay',
    name: 'Zeepay',
    country_iso3: 'GHA',
    sector: 'fintech',
    stage: 'series-a',
    description: 'Mobile financial services platform connecting remittances directly to mobile money wallets across Africa.',
    problem: 'Diaspora remittances lose 7–10% in fees and often don\'t reach mobile money users directly.',
    solution: 'API platform linking international money transfer operators to local mobile money networks.',
    founder_name: 'Andrew Takyi-Appiah',
    website: 'https://myzeepay.com',
    funding_amount_usd: 7900000,
    funding_source: 'Verdant Capital, Proparco',
    sdg_tags: [8, 10],
    impact_tags: ['remittances', 'mobile-money', 'financial-inclusion'],
    verification_tier: 'A',
    source_url: 'https://ventureburn.com/zeepay-series-a',
    source_name: 'Ventureburn',
  },
  // Ghana — agritech
  {
    id: 'farmerline',
    name: 'Farmerline',
    country_iso3: 'GHA',
    sector: 'agritech',
    stage: 'seed',
    description: 'Digital platform delivering agricultural advisory, inputs, and market access to smallholder farmers via feature phones.',
    problem: 'Ghanaian smallholder farmers lack access to agronomic advice, quality inputs, and fair market prices.',
    solution: 'Voice-based advisory system + digital marketplace accessible on basic mobile phones in local languages.',
    founder_name: 'Alloysius Attah',
    website: 'https://farmerline.co',
    funding_amount_usd: 1600000,
    funding_source: 'Acumen, MasterCard Foundation',
    sdg_tags: [1, 2, 8],
    impact_tags: ['food-security', 'last-mile', 'smallholder-farmers'],
    verification_tier: 'B',
    source_url: 'https://disrupt-africa.com/farmerline',
    source_name: 'Disrupt Africa',
  },
  // Ghana — healthtech
  {
    id: 'mpharma',
    name: 'mPharma',
    country_iso3: 'GHA',
    sector: 'healthtech',
    stage: 'series-b+',
    description: 'Manages medicine supply chains for hospitals and pharmacies, reducing costs and improving access.',
    problem: 'Medicine stockouts and high drug prices are major barriers to healthcare across Africa.',
    solution: 'Inventory management SaaS + group purchasing cooperative that negotiates bulk prices for pharmacies.',
    founder_name: 'Gregory Rockson',
    website: 'https://mpharma.com',
    funding_amount_usd: 30000000,
    funding_source: 'Novastar, Grand Challenges Canada, Merck',
    sdg_tags: [3, 8],
    impact_tags: ['medicine-access', 'pharmacy', 'supply-chain'],
    verification_tier: 'A',
    source_url: 'https://techcabal.com/mpharma-series-b',
    source_name: 'TechCabal',
  },
  // South Africa — fintech
  {
    id: 'paymenow',
    name: 'PayNow',
    country_iso3: 'ZAF',
    sector: 'fintech',
    stage: 'seed',
    description: 'Earned wage access platform allowing South African workers to access earned wages before payday.',
    problem: 'Workers living paycheck to paycheck resort to high-interest payday loans between pay cycles.',
    solution: 'EWA platform integrated with payroll systems, letting employees withdraw earned wages at any time.',
    founder_name: 'Dov Stern',
    website: 'https://paymenow.co.za',
    funding_amount_usd: 1700000,
    funding_source: 'Naspers Foundry',
    sdg_tags: [8, 10],
    impact_tags: ['financial-wellness', 'earned-wage-access', 'workers'],
    verification_tier: 'B',
    source_url: 'https://ventureburn.com/paymenow-funding',
    source_name: 'Ventureburn',
  },
  // South Africa — agritech
  {
    id: 'aerobotics',
    name: 'Aerobotics',
    country_iso3: 'ZAF',
    sector: 'agritech',
    stage: 'series-b+',
    description: 'AI and drone platform providing precision agriculture analytics to detect crop stress and pests early.',
    problem: 'Farmers lose 20–40% of crops to pests and disease, often detected too late for intervention.',
    solution: 'Drone imagery + AI algorithms that detect crop stress at individual tree level weeks before visible symptoms.',
    founder_name: 'James Paterson',
    website: 'https://aerobotics.com',
    funding_amount_usd: 17000000,
    funding_source: 'Naspers, Cathay AfricInvest',
    sdg_tags: [2, 9, 13],
    impact_tags: ['precision-agriculture', 'drones', 'food-security'],
    verification_tier: 'A',
    source_url: 'https://disrupt-africa.com/aerobotics',
    source_name: 'Disrupt Africa',
  },
  // Rwanda — healthtech
  {
    id: 'babyl-rwanda',
    name: 'Babyl Rwanda',
    country_iso3: 'RWA',
    sector: 'healthtech',
    stage: 'series-a',
    description: 'AI-powered digital health service offering symptom assessment, doctor consultations, and prescriptions via mobile.',
    problem: 'Rwanda has fewer than 1 doctor per 10,000 people — most cannot access a GP in time.',
    solution: 'Mobile app with AI triage + remote doctor consultations available 24/7, integrated with NHIS.',
    founder_name: 'Jonathan Wills',
    website: 'https://babyl.rw',
    funding_amount_usd: 20000000,
    funding_source: 'Leapfrog, Bill & Melinda Gates Foundation',
    sdg_tags: [3, 10],
    impact_tags: ['telemedicine', 'universal-health-coverage', 'ai-health'],
    verification_tier: 'A',
    source_url: 'https://techcabal.com/babyl-rwanda',
    source_name: 'TechCabal',
  },
]

export async function runStartupSeed() {
  const sb = getSupabase()
  const results: string[] = []
  const errors: string[] = []

  for (const startup of STARTUPS) {
    try {
      const countryScores = COUNTRY_SCORES[startup.country_iso3] ?? { need: 50, opportunity: 50 }
      const viability_score = calculateViabilityScore({
        country_need: countryScores.need,
        country_opportunity: countryScores.opportunity,
        has_source_url: !!startup.source_url,
        has_funding: !!startup.funding_amount_usd,
        funding_source: startup.funding_source,
        has_founder_name: !!startup.founder_name,
        verification_tier: startup.verification_tier as 'A' | 'B' | 'C',
      })

      const { error } = await sb.from('startups').upsert(
        { ...startup, viability_score },
        { onConflict: 'id' }
      )
      if (error) errors.push(`${startup.name}: ${error.message}`)
      else results.push(startup.name)
    } catch (err) {
      errors.push(`${startup.name}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({
    ok: true,
    seeded: results.length,
    results,
    errors: errors.length > 0 ? errors : undefined,
  })
}

export async function GET() { return runStartupSeed() }
export async function POST() { return runStartupSeed() }
