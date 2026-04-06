-- Africa Intelligence Platform — Organizations schema + seed
-- Spusť v Supabase: Dashboard → SQL Editor → New query → paste → Run

create table if not exists organizations (
  id                    text primary key,
  name                  text not null,
  website               text,
  mission               text not null,
  countries             text[] not null default '{}',
  sectors               text[] not null default '{}',
  sdg_tags              integer[] not null default '{}',
  verification_tier     text not null default 'B' check (verification_tier in ('A','B','C','unverified')),
  last_reviewed_at      date not null default current_date,
  action_types          text[] not null default '{}',
  logo_url              text
);

alter table organizations enable row level security;
create policy "public read organizations" on organizations for select using (true);

-- ─── SEED ─────────────────────────────────────────────────────────────────────

insert into organizations (id, name, website, mission, countries, sectors, sdg_tags, verification_tier, last_reviewed_at, action_types) values

('org-wateraid',
 'WaterAid Africa',
 'https://www.wateraid.org',
 'Universal access to clean water, decent toilets and good hygiene across Africa.',
 ARRAY['KEN','ETH','TZA','GHA','SEN'],
 ARRAY['WASH','Health'],
 ARRAY[3,6],
 'A', '2026-02-01',
 ARRAY['donate','volunteer']),

('org-afrimapper',
 'AfriMapper',
 'https://afrimapper.org',
 'Open geospatial data for development — mapping health, water and food security across East Africa.',
 ARRAY['KEN','ETH','TZA','UGA'],
 ARRAY['Health','WASH','Food Security'],
 ARRAY[2,3,6],
 'B', '2026-01-15',
 ARRAY['volunteer','learn']),

('org-enza',
 'Enza Capital',
 'https://enzacapital.com',
 'Seed-stage venture capital investing in climate-smart agri-tech and fintech across East Africa.',
 ARRAY['KEN','TZA','RWA','UGA'],
 ARRAY['Agri-tech','Fintech','Renewable Energy'],
 ARRAY[1,2,13],
 'A', '2026-03-01',
 ARRAY['invest']),

('org-egn',
 'Educate Girls Nigeria',
 'https://educategirlsnigeria.org',
 'Keeping girls in secondary school across Northern Nigeria through scholarships and community engagement.',
 ARRAY['NGA'],
 ARRAY['Education'],
 ARRAY[4,5],
 'A', '2026-01-20',
 ARRAY['donate']),

('org-epra',
 'Energy Policy Research Africa',
 'https://eprafrica.org',
 'Independent research and advocacy on energy access, transition and policy across Sub-Saharan Africa.',
 ARRAY['NGA','GHA','ZAF','SEN','ETH'],
 ARRAY['Energy Access','Renewable Energy'],
 ARRAY[7,13],
 'B', '2025-12-10',
 ARRAY['learn','donate']),

('org-amref',
 'Amref Health Africa',
 'https://amref.org',
 'Strengthening health systems and enabling communities to access quality, affordable healthcare.',
 ARRAY['KEN','ETH','TZA','ZAF','SEN'],
 ARRAY['Health'],
 ARRAY[3],
 'A', '2026-02-15',
 ARRAY['donate','volunteer']),

('org-gsbi',
 'Global Startup Bridge Initiative',
 'https://gsbi.africa',
 'Connecting African founders with global investors and mentors to scale impact-first startups.',
 ARRAY['KEN','NGA','GHA','RWA','SEN'],
 ARRAY['Fintech','Agri-tech','Digital Economy'],
 ARRAY[8,9,17],
 'B', '2026-03-10',
 ARRAY['invest','learn']),

('org-solarsister',
 'Solar Sister',
 'https://solarsister.org',
 'Training women entrepreneurs to bring solar energy to last-mile communities across East Africa.',
 ARRAY['TZA','NGA','ETH'],
 ARRAY['Renewable Energy','Women Empowerment'],
 ARRAY[5,7,13],
 'A', '2026-01-05',
 ARRAY['donate','invest'])

on conflict (id) do nothing;
