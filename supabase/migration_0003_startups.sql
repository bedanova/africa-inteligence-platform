-- Startup Intelligence Module
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS startups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_iso3 TEXT NOT NULL,
  sector TEXT NOT NULL,
  stage TEXT NOT NULL,
  description TEXT,
  problem TEXT,
  solution TEXT,
  founder_name TEXT,
  website TEXT,
  funding_amount_usd BIGINT,
  funding_source TEXT,
  sdg_tags INTEGER[] DEFAULT '{}',
  viability_score NUMERIC(5,2),
  verification_tier TEXT NOT NULL DEFAULT 'C',
  source_url TEXT,
  source_name TEXT,
  ai_brief TEXT,
  impact_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS startups_pending (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country_iso3 TEXT,
  sector TEXT,
  stage TEXT,
  description TEXT,
  source_url TEXT NOT NULL,
  source_name TEXT,
  article_excerpt TEXT,
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  raw_json JSONB
);

CREATE TABLE IF NOT EXISTS investment_briefs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  bullets TEXT[] NOT NULL DEFAULT '{}',
  sector_focus TEXT,
  country_iso3 TEXT,
  week_of DATE NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model_name TEXT,
  sources TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_startups_country ON startups(country_iso3);
CREATE INDEX IF NOT EXISTS idx_startups_sector ON startups(sector);
CREATE INDEX IF NOT EXISTS idx_startups_stage ON startups(stage);
CREATE INDEX IF NOT EXISTS idx_startups_pending_status ON startups_pending(status);
CREATE INDEX IF NOT EXISTS idx_investment_briefs_week ON investment_briefs(week_of DESC);
