-- Migration 0004: metrics_history table for sparklines and trendlines
-- Run this in Supabase SQL editor before triggering /api/ingest/history

CREATE TABLE IF NOT EXISTS metrics_history (
  id            bigserial    PRIMARY KEY,
  country_iso3  char(3)      NOT NULL,
  key           text         NOT NULL,
  value_num     numeric      NOT NULL,
  year          smallint     NOT NULL,
  created_at    timestamptz  NOT NULL DEFAULT now(),

  UNIQUE (country_iso3, key, year)
);

-- Indexes for the two query patterns used by the API
CREATE INDEX IF NOT EXISTS metrics_history_country_key ON metrics_history (country_iso3, key);
CREATE INDEX IF NOT EXISTS metrics_history_key         ON metrics_history (key);

-- Allow anon reads (public data)
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON metrics_history
  FOR SELECT USING (true);

-- Allow service role to write (used by ingest cron)
CREATE POLICY "Service write" ON metrics_history
  FOR ALL USING (auth.role() = 'service_role');
