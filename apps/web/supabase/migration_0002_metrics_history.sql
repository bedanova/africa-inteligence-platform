-- metrics_history: time-series data for sparkline charts
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
CREATE TABLE IF NOT EXISTS metrics_history (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  country_iso3 text       NOT NULL,
  key         text        NOT NULL,
  value_num   numeric     NOT NULL,
  year        int         NOT NULL,
  created_at  timestamptz DEFAULT now(),
  CONSTRAINT metrics_history_country_key_year UNIQUE (country_iso3, key, year)
);

CREATE INDEX IF NOT EXISTS idx_metrics_history_lookup
  ON metrics_history (country_iso3, key, year DESC);
