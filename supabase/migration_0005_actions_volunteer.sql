-- Migration 0005: extend actions table for volunteer-specific fields
ALTER TABLE actions
  ADD COLUMN IF NOT EXISTS skills_needed  text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS remote         boolean  DEFAULT null,
  ADD COLUMN IF NOT EXISTS duration       text     DEFAULT null,
  ADD COLUMN IF NOT EXISTS sdg_tags       int[]    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sector         text     DEFAULT null,
  ADD COLUMN IF NOT EXISTS warning        text     DEFAULT null;
