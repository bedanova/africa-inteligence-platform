-- Africa Intelligence Platform — Supabase Schema + Seed
-- Spusť v Supabase: Dashboard → SQL Editor → New query → paste → Run

-- ─── TABLES ───────────────────────────────────────────────────────────────────

create table if not exists countries (
  iso3          char(3) primary key,
  name          text not null,
  region        text not null,
  flag_emoji    text not null,
  score_need    integer not null check (score_need between 0 and 100),
  score_opportunity integer not null check (score_opportunity between 0 and 100),
  score_stability   integer not null check (score_stability between 0 and 100),
  freshness     text not null default 'fresh',
  updated_at    timestamptz not null default now()
);

create table if not exists briefs (
  id            text primary key,
  title         text not null,
  summary       text not null,
  bullets       jsonb not null default '[]',
  risk_flags    jsonb not null default '[]',
  citations     jsonb not null default '[]',
  scope         text not null check (scope in ('continent', 'country', 'region')),
  country_iso3  char(3) references countries(iso3),
  freshness     text not null default 'fresh',
  model_name    text not null default 'mock-v0',
  confidence    numeric(3,2) not null default 0.80,
  generated_at  timestamptz not null default now()
);

create table if not exists metrics (
  id            bigint generated always as identity primary key,
  country_iso3  char(3) not null references countries(iso3),
  key           text not null,
  label         text not null,
  value_num     numeric,
  value_text    text,
  unit          text,
  trend         text check (trend in ('up', 'down', 'flat')),
  source        text not null,
  source_year   integer not null,
  freshness     text not null default 'fresh',
  unique (country_iso3, key)
);

create table if not exists actions (
  id                    text primary key,
  country_iso3          char(3) references countries(iso3),
  type                  text not null check (type in ('donate', 'volunteer', 'invest', 'learn')),
  title                 text not null,
  description           text,
  org_name              text not null,
  org_id                text not null,
  org_verification_tier text not null default 'B',
  url                   text not null default '#'
);

create table if not exists sectors (
  id            bigint generated always as identity primary key,
  country_iso3  char(3) not null references countries(iso3),
  name          text not null,
  sort_order    integer not null default 0
);

-- ─── SEED: COUNTRIES ──────────────────────────────────────────────────────────

insert into countries (iso3, name, region, flag_emoji, score_need, score_opportunity, score_stability) values
  ('KEN', 'Kenya',        'Eastern Africa',  '🇰🇪', 62, 74, 55),
  ('NGA', 'Nigeria',      'Western Africa',  '🇳🇬', 71, 68, 41),
  ('ETH', 'Ethiopia',     'Eastern Africa',  '🇪🇹', 78, 52, 38),
  ('GHA', 'Ghana',        'Western Africa',  '🇬🇭', 48, 71, 72),
  ('ZAF', 'South Africa', 'Southern Africa', '🇿🇦', 44, 66, 63),
  ('TZA', 'Tanzania',     'Eastern Africa',  '🇹🇿', 65, 61, 60),
  ('RWA', 'Rwanda',       'Eastern Africa',  '🇷🇼', 52, 70, 75),
  ('SEN', 'Senegal',      'Western Africa',  '🇸🇳', 55, 64, 67)
on conflict (iso3) do update set
  score_need = excluded.score_need,
  score_opportunity = excluded.score_opportunity,
  score_stability = excluded.score_stability,
  updated_at = now();

-- ─── SEED: BRIEFS ─────────────────────────────────────────────────────────────

insert into briefs (id, title, summary, bullets, risk_flags, citations, scope, country_iso3, confidence) values
(
  'brief-001',
  'East Africa: Sustained economic growth amid climate stress',
  'GDP growth across East Africa remains above Sub-Saharan average, driven by services and mobile-first fintech adoption. Seasonal drought pressure continues in the Horn, with 3.2M people in Ethiopia requiring acute food assistance through Q2 2026.',
  '["Kenya GDP growth forecast at 5.1% for 2026 (World Bank, Apr 2026)", "Ethiopia acute food insecurity: 3.2M affected in Tigray and Afar regions (OCHA, Mar 2026)", "Rwanda digital economy index ranks 2nd in Africa for 2025 (AfDB)", "Mobile money penetration in East Africa now exceeds 65% of adult population (GSMA 2025)"]',
  '["Drought pressure Horn of Africa", "Political transition Ethiopia"]',
  '[{"id":"c1","label":"World Bank Africa Pulse Apr 2026","source_type":"official_data"},{"id":"c2","label":"OCHA Ethiopia Situation Report Mar 2026","source_type":"report"},{"id":"c3","label":"AfDB African Economic Outlook 2025","source_type":"official_data"},{"id":"c4","label":"GSMA Mobile Economy Sub-Saharan Africa 2025","source_type":"official_data"}]',
  'continent', null, 0.88
),
(
  'brief-002',
  'Nigeria: Infrastructure gap constrains opportunity capture',
  'Nigeria holds the largest GDP and population in Africa but persistent electricity access gaps (41% of population) and currency instability constrain tech sector growth despite strong startup activity.',
  '["Electricity access: 41% national coverage, 17% rural (IEA 2025)", "Naira stabilised at ~1,580 NGN/USD after CBN policy interventions (Q1 2026)", "Lagos startup ecosystem ranked 3rd in Africa by deal volume (Partech 2025)"]',
  '["Currency volatility", "Fuel subsidy reform impact"]',
  '[{"id":"c5","label":"IEA Africa Energy Outlook 2025","source_type":"official_data"},{"id":"c6","label":"Partech Africa Report 2025","source_type":"report"}]',
  'country', 'NGA', 0.82
),
(
  'brief-003',
  'Rwanda: Governance model drives stability and investment',
  'Rwanda maintains the highest governance score in the dataset, with strong public institution performance and a digital services economy growing at 7.2% annually. SDG 16 (Peace & Justice) scores rank first in Sub-Saharan Africa.',
  '["V-Dem institutional quality score: 0.71/1.0 (highest in dataset)", "ICT sector contribution to GDP: 8.1% in 2025 (RDB)", "World Bank Doing Business rank: 38th globally, 1st in EAC region"]',
  '[]',
  '[{"id":"c7","label":"V-Dem Dataset v14 2025","source_type":"official_data"},{"id":"c8","label":"Rwanda Development Board Annual Report 2025","source_type":"report"}]',
  'country', 'RWA', 0.91
)
on conflict (id) do nothing;

-- ─── SEED: METRICS ────────────────────────────────────────────────────────────

insert into metrics (country_iso3, key, label, value_num, unit, trend, source, source_year, freshness) values
  ('KEN','gdp_growth',      'GDP Growth',       5.1,  '%',      'up',   'World Bank', 2026, 'fresh'),
  ('KEN','connectivity',    'Internet Access',  42,   '%',      'up',   'GSMA',       2025, 'fresh'),
  ('KEN','health_burden',   'Under-5 Mortality',38,   'per 1k', 'down', 'WHO GHO',    2024, 'aging'),
  ('NGA','gdp_growth',      'GDP Growth',       3.2,  '%',      'flat', 'World Bank', 2026, 'fresh'),
  ('NGA','connectivity',    'Internet Access',  35,   '%',      'up',   'GSMA',       2025, 'fresh'),
  ('NGA','health_burden',   'Under-5 Mortality',71,   'per 1k', 'down', 'WHO GHO',    2024, 'aging'),
  ('ETH','gdp_growth',      'GDP Growth',       6.5,  '%',      'up',   'World Bank', 2026, 'fresh'),
  ('ETH','connectivity',    'Internet Access',  22,   '%',      'up',   'GSMA',       2025, 'fresh'),
  ('ETH','health_burden',   'Under-5 Mortality',52,   'per 1k', 'down', 'WHO GHO',    2024, 'aging'),
  ('GHA','gdp_growth',      'GDP Growth',       4.7,  '%',      'up',   'World Bank', 2026, 'fresh'),
  ('GHA','connectivity',    'Internet Access',  58,   '%',      'up',   'GSMA',       2025, 'fresh'),
  ('GHA','health_burden',   'Under-5 Mortality',44,   'per 1k', 'down', 'WHO GHO',    2024, 'aging'),
  ('ZAF','gdp_growth',      'GDP Growth',       1.9,  '%',      'down', 'World Bank', 2026, 'fresh'),
  ('ZAF','connectivity',    'Internet Access',  72,   '%',      'up',   'GSMA',       2025, 'fresh'),
  ('ZAF','health_burden',   'Under-5 Mortality',30,   'per 1k', 'down', 'WHO GHO',    2024, 'aging')
on conflict (country_iso3, key) do nothing;

insert into metrics (country_iso3, key, label, value_text, unit, trend, source, source_year, freshness) values
  ('KEN','conflict_pressure','Conflict Pressure','Moderate', null,'flat','ACLED',2026,'fresh'),
  ('NGA','conflict_pressure','Conflict Pressure','High',     null,'up',  'ACLED',2026,'fresh'),
  ('ETH','conflict_pressure','Conflict Pressure','Very High',null,'flat','ACLED',2026,'fresh'),
  ('GHA','conflict_pressure','Conflict Pressure','Low',      null,'flat','ACLED',2026,'fresh'),
  ('ZAF','conflict_pressure','Conflict Pressure','Low-Mod',  null,'flat','ACLED',2026,'fresh')
on conflict (country_iso3, key) do nothing;

-- ─── SEED: ACTIONS ────────────────────────────────────────────────────────────

insert into actions (id, country_iso3, type, title, description, org_name, org_id, org_verification_tier, url) values
  ('a-ken-1','KEN','donate',   'Support WASH programs in Turkana County','Funding clean water access for 50,000+ people in arid regions.','WaterAid Kenya','org-wateraid','A','#'),
  ('a-ken-2','KEN','volunteer','Remote data analyst — health indicators','3-month remote engagement, flexible hours.','AfriMapper','org-afrimapper','B','#'),
  ('a-ken-3','KEN','invest',   'Agri-fintech seed opportunities — East Africa','Screened early-stage opportunities in climate-smart agriculture.','Enza Capital','org-enza','A','#'),
  ('a-nga-1','NGA','donate',   'Girls'' secondary education in Kano State',null,'Educate Girls Nigeria','org-egn','A','#'),
  ('a-nga-2','NGA','learn',    'Nigeria energy transition — policy brief',null,'Energy Policy Research Africa','org-epra','B','#')
on conflict (id) do nothing;

-- ─── SEED: SECTORS ────────────────────────────────────────────────────────────

insert into sectors (country_iso3, name, sort_order) values
  ('KEN','Fintech',1),('KEN','Agri-tech',2),('KEN','WASH',3),('KEN','Renewable Energy',4),('KEN','Health',5),
  ('NGA','Energy Access',1),('NGA','Education',2),('NGA','Fintech',3),('NGA','Climate Adaptation',4),
  ('ETH','Humanitarian Response',1),('ETH','WASH',2),('ETH','Food Security',3),('ETH','Health',4),
  ('GHA','Cocoa Value Chain',1),('GHA','Fintech',2),('GHA','Renewable Energy',3),('GHA','Education',4),
  ('ZAF','Renewable Energy',1),('ZAF','Fintech',2),('ZAF','Mining Tech',3),('ZAF','Healthcare',4),
  ('TZA','Tourism',1),('TZA','Agriculture',2),('TZA','WASH',3),('TZA','Education',4),
  ('RWA','Digital Economy',1),('RWA','Healthcare',2),('RWA','Agriculture',3),('RWA','Manufacturing',4),
  ('SEN','Fisheries',1),('SEN','Agriculture',2),('SEN','Renewable Energy',3),('SEN','Fintech',4);

-- ─── ROW LEVEL SECURITY (public read) ─────────────────────────────────────────

alter table countries enable row level security;
alter table briefs    enable row level security;
alter table metrics   enable row level security;
alter table actions   enable row level security;
alter table sectors   enable row level security;

create policy "public read countries" on countries for select using (true);
create policy "public read briefs"    on briefs    for select using (true);
create policy "public read metrics"   on metrics   for select using (true);
create policy "public read actions"   on actions   for select using (true);
create policy "public read sectors"   on sectors   for select using (true);
