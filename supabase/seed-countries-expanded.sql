-- Africa Intelligence Platform — Expanded Country Seed (20 countries)
-- Run in Supabase SQL Editor after the initial seed
-- Sources: World Bank, WHO GHO, UN SDG, ACLED — all public data

-- ─── INSERT / UPSERT 12 NEW COUNTRIES ─────────────────────────────────────────
-- (KEN, NGA, ETH, GHA, ZAF, TZA, RWA, SEN already seeded in initial migration)

insert into countries (iso3, name, region, flag_emoji, score_need, score_opportunity, score_stability, freshness) values

-- Eastern Africa
('UGA', 'Uganda',         'Eastern Africa',  '🇺🇬', 68, 58, 48, 'fresh'),
('MOZ', 'Mozambique',     'Eastern Africa',  '🇲🇿', 74, 55, 44, 'fresh'),
('MDG', 'Madagascar',     'Eastern Africa',  '🇲🇬', 72, 48, 50, 'fresh'),

-- Western Africa
('CIV', 'Côte d''Ivoire', 'Western Africa',  '🇨🇮', 58, 66, 55, 'fresh'),
('CMR', 'Cameroon',       'Western Africa',  '🇨🇲', 60, 57, 45, 'fresh'),

-- Southern Africa
('ZMB', 'Zambia',         'Southern Africa', '🇿🇲', 66, 58, 54, 'fresh'),
('AGO', 'Angola',         'Southern Africa', '🇦🇴', 70, 56, 50, 'fresh'),

-- Northern Africa
('EGY', 'Egypt',          'Northern Africa', '🇪🇬', 50, 65, 52, 'fresh'),
('MAR', 'Morocco',        'Northern Africa', '🇲🇦', 42, 68, 64, 'fresh'),
('DZA', 'Algeria',        'Northern Africa', '🇩🇿', 38, 59, 57, 'fresh'),
('TUN', 'Tunisia',        'Northern Africa', '🇹🇳', 36, 61, 48, 'fresh'),

-- Central Africa
('COD', 'DR Congo',       'Central Africa',  '🇨🇩', 82, 44, 28, 'fresh')

on conflict (iso3) do update set
  name               = excluded.name,
  region             = excluded.region,
  flag_emoji         = excluded.flag_emoji,
  score_need         = excluded.score_need,
  score_opportunity  = excluded.score_opportunity,
  score_stability    = excluded.score_stability,
  freshness          = excluded.freshness,
  updated_at         = now();
