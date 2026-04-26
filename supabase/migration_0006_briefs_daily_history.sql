-- Migration 0006: Enable daily brief history + "Did you know" facts
-- Run in Supabase SQL Editor before deploying.

-- Add "Did you know?" daily fact column
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS did_you_know text;

-- Index for efficient date-ordered queries on briefs page
CREATE INDEX IF NOT EXISTS idx_briefs_generated_at ON briefs (generated_at DESC);

-- Index for filtering by scope + date (today's brief lookup)
CREATE INDEX IF NOT EXISTS idx_briefs_scope_date ON briefs (scope, generated_at DESC);
