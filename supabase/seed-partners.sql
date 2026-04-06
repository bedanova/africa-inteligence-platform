-- Africa Intelligence Platform — Partners & Actions seed
-- Supabase: Dashboard → SQL Editor → New query → paste → Run

-- ─── ORGANIZATIONS ────────────────────────────────────────────────────────────

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
 ARRAY['KEN','ETH','TZA'],
 ARRAY['Health','WASH','Food Security'],
 ARRAY[2,3,6],
 'B', '2026-01-15',
 ARRAY['volunteer','learn']),

('org-enza',
 'Enza Capital',
 'https://enzacapital.com',
 'Seed-stage venture capital investing in climate-smart agri-tech and fintech across East Africa.',
 ARRAY['KEN','TZA','RWA'],
 ARRAY['Agri-tech','Fintech'],
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
 ARRAY['Fintech','Digital Economy'],
 ARRAY[8,9,17],
 'B', '2026-03-10',
 ARRAY['invest','learn']),

('org-solarsister',
 'Solar Sister',
 'https://solarsister.org',
 'Training women entrepreneurs to bring solar energy to last-mile communities across East Africa.',
 ARRAY['TZA','NGA','ETH'],
 ARRAY['Renewable Energy'],
 ARRAY[5,7,13],
 'A', '2026-01-05',
 ARRAY['donate','invest'])

on conflict (id) do nothing;

-- ─── ACTIONS ──────────────────────────────────────────────────────────────────

insert into actions (id, country_iso3, type, title, description, org_name, org_id, org_verification_tier, url) values

-- Kenya
('a-ken-1','KEN','donate',   'Support WASH programs in Turkana County',         'Fund clean water access for 50,000+ people in arid regions.',                 'WaterAid Africa',                  'org-wateraid',   'A', 'https://www.wateraid.org/donate'),
('a-ken-2','KEN','volunteer','Remote data analyst — health indicators',          '3-month remote engagement mapping health facility data across Kenya.',         'AfriMapper',                       'org-afrimapper', 'B', 'https://afrimapper.org/volunteer'),
('a-ken-3','KEN','invest',   'Agri-fintech seed opportunities — East Africa',    'Screened early-stage opportunities in climate-smart agriculture and fintech.', 'Enza Capital',                     'org-enza',       'A', 'https://enzacapital.com'),
('a-ken-4','KEN','donate',   'Community health worker training — Nairobi',       'Train frontline health workers in urban informal settlements.',                 'Amref Health Africa',              'org-amref',      'A', 'https://amref.org/donate'),

-- Nigeria
('a-nga-1','NGA','donate',   'Girls'' secondary education in Kano State',        'Scholarship and mentorship for 500 girls at risk of dropout.',                 'Educate Girls Nigeria',            'org-egn',        'A', 'https://educategirlsnigeria.org/donate'),
('a-nga-2','NGA','learn',    'Nigeria energy transition — policy brief series',  'Monthly research briefs on Nigeria''s path to clean energy.',                  'Energy Policy Research Africa',    'org-epra',       'B', 'https://eprafrica.org'),
('a-nga-3','NGA','invest',   'Lagos tech ecosystem — impact fund opportunity',   'Early-stage African founders solving infrastructure challenges.',               'Global Startup Bridge Initiative', 'org-gsbi',       'B', 'https://gsbi.africa'),
('a-nga-4','NGA','donate',   'Solar home systems — rural Niger Delta',           'Provide solar energy to 1,000 households without grid access.',                'Solar Sister',                     'org-solarsister','A', 'https://solarsister.org/donate'),

-- Ethiopia
('a-eth-1','ETH','donate',   'Emergency WASH — Tigray & Afar regions',          'Clean water and sanitation for conflict-displaced communities.',                'WaterAid Africa',                  'org-wateraid',   'A', 'https://www.wateraid.org/donate'),
('a-eth-2','ETH','volunteer','Health facility mapping — Oromia region',          'Remote GIS volunteer role, 5–10 hrs/week, 2-month commitment.',                'AfriMapper',                       'org-afrimapper', 'B', 'https://afrimapper.org/volunteer'),
('a-eth-3','ETH','donate',   'Mobile health clinics — rural Ethiopia',           'Fund outreach clinics reaching communities 50km+ from the nearest hospital.',  'Amref Health Africa',              'org-amref',      'A', 'https://amref.org/donate'),

-- Ghana
('a-gha-1','GHA','learn',    'Ghana renewable energy policy — briefing series',  'Quarterly analysis of Ghana''s energy transition and policy landscape.',        'Energy Policy Research Africa',    'org-epra',       'B', 'https://eprafrica.org'),
('a-gha-2','GHA','invest',   'Accra fintech seed pipeline',                      'Curated pipeline of early-stage Ghanaian fintech and agri-tech startups.',     'Global Startup Bridge Initiative', 'org-gsbi',       'B', 'https://gsbi.africa'),
('a-gha-3','GHA','donate',   'Clean water access — Northern Ghana',              'Borehole drilling and maintenance in water-scarce northern communities.',       'WaterAid Africa',                  'org-wateraid',   'A', 'https://www.wateraid.org/donate'),

-- South Africa
('a-zaf-1','ZAF','learn',    'South Africa just energy transition — analysis',   'Research on coal phase-out, renewables scale-up, and job creation.',           'Energy Policy Research Africa',    'org-epra',       'B', 'https://eprafrica.org'),
('a-zaf-2','ZAF','donate',   'Township health equity programme — Cape Town',     'Primary healthcare and mental health support in underserved townships.',        'Amref Health Africa',              'org-amref',      'A', 'https://amref.org/donate'),
('a-zaf-3','ZAF','invest',   'South African impact tech fund',                   'Backing founders solving healthcare access and financial inclusion.',           'Global Startup Bridge Initiative', 'org-gsbi',       'B', 'https://gsbi.africa'),

-- Tanzania
('a-tza-1','TZA','donate',   'Clean water — rural Tanzania',                     'Safe water access for 30,000 people in Dodoma and Singida regions.',           'WaterAid Africa',                  'org-wateraid',   'A', 'https://www.wateraid.org/donate'),
('a-tza-2','TZA','invest',   'East Africa agri-tech co-investment',              'Series A co-investment opportunities in Tanzanian agri-tech ventures.',        'Enza Capital',                     'org-enza',       'A', 'https://enzacapital.com'),
('a-tza-3','TZA','donate',   'Solar for schools — Mwanza region',               'Solar panels and batteries for 20 rural schools off the national grid.',       'Solar Sister',                     'org-solarsister','A', 'https://solarsister.org/donate'),

-- Rwanda
('a-rwa-1','RWA','invest',   'Rwanda digital health startups — seed round',      'Backing founders in Rwanda''s fast-growing digital health sector.',             'Enza Capital',                     'org-enza',       'A', 'https://enzacapital.com'),
('a-rwa-2','RWA','learn',    'Rwanda governance model — case study series',      'In-depth research on Rwanda''s institutional reforms and outcomes.',            'Global Startup Bridge Initiative', 'org-gsbi',       'B', 'https://gsbi.africa'),
('a-rwa-3','RWA','volunteer','Community health data — Kigali district',          'Part-time remote role supporting health outcomes data collection.',             'Amref Health Africa',              'org-amref',      'A', 'https://amref.org'),

-- Senegal
('a-sen-1','SEN','donate',   'WASH access — Casamance region',                  'Clean water and sanitation in Senegal''s most water-stressed region.',          'WaterAid Africa',                  'org-wateraid',   'A', 'https://www.wateraid.org/donate'),
('a-sen-2','SEN','learn',    'Senegal energy access — off-grid solutions brief', 'Research on decentralised solar and mini-grid deployment in rural Senegal.',   'Energy Policy Research Africa',    'org-epra',       'B', 'https://eprafrica.org'),
('a-sen-3','SEN','invest',   'Dakar startup ecosystem — impact opportunities',   'Early-stage investment pipeline from Senegal''s growing tech ecosystem.',       'Global Startup Bridge Initiative', 'org-gsbi',       'B', 'https://gsbi.africa')

on conflict (id) do nothing;
