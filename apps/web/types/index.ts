// ============================================================
// Africa Intelligence Platform — Shared TypeScript types
// Keep in sync with FastAPI Pydantic schemas (apps/api)
// ============================================================

export type Freshness = "fresh" | "aging" | "stale";
export type VerificationTier = "A" | "B" | "C" | "unverified";
export type ActionType = "donate" | "volunteer" | "learn" | "invest";
export type Region =
  | "Northern Africa"
  | "Western Africa"
  | "Eastern Africa"
  | "Central Africa"
  | "Southern Africa";

// --- Scores ---
export interface CountryScores {
  need: number;        // 0–100, higher = more need
  opportunity: number; // 0–100, higher = more opportunity
  stability: number;   // 0–100, higher = more stable
  updated_at: string;
}

// --- Country ---
export interface CountrySummary {
  iso3: string;
  name: string;
  region: Region;
  flag_emoji: string;
  scores: CountryScores;
  freshness: Freshness;
}

export interface CountryMetric {
  key: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  source: string;
  source_year: number;
  freshness: Freshness;
}

export interface CountryProfile extends CountrySummary {
  ai_brief: AIBrief | null;
  metrics: CountryMetric[];
  priority_sectors: string[];
  trusted_actions: ActionCard[];
}

// --- AI Briefs ---
export interface AIBriefCitation {
  id: string;
  label: string;
  url?: string;
  source_type: "official_data" | "trusted_news" | "report";
}

export interface AIBrief {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  risk_flags: string[];
  citations: AIBriefCitation[];
  scope: "continent" | "country" | "theme";
  country_iso3?: string;
  freshness: Freshness;
  generated_at: string;
  model_name: string;
  confidence: number; // 0–1
}

// --- Organizations ---
export interface Organization {
  id: string;
  name: string;
  website?: string;
  mission: string;
  countries: string[];   // ISO3 array
  sectors: string[];
  sdg_tags: number[];
  verification_tier: VerificationTier;
  last_reviewed_at: string;
  action_types: ActionType[];
  logo_url?: string;
}

// --- Actions ---
export interface ActionCard {
  id: string;
  type: ActionType;
  title: string;
  org_name: string;
  org_id: string;
  org_verification_tier: VerificationTier;
  country_iso3?: string;
  url: string;
  description?: string;
  warning?: string;
}

// --- Home Overview ---
export interface LeaderboardEntry {
  iso3: string;
  name: string;
  flag_emoji: string;
  score: number;
  delta?: number;
}

export interface HomeOverview {
  snapshot_date: string;
  ingest_status: "ok" | "partial" | "stale";
  leaderboards: {
    highest_need: LeaderboardEntry[];
    fastest_opportunity: LeaderboardEntry[];
    most_improved_stability: LeaderboardEntry[];
    attention_gap: LeaderboardEntry[];
  };
  top_briefs: AIBrief[];
  countries: CountrySummary[];
}

// --- Impact ---
export interface ImpactAction {
  id: string;
  org_id: string;
  org_name: string;
  country_iso3: string;
  sector: string;
  action_type: ActionType;
  reported_output?: string;
  verified_outcome?: string;
  period_start: string;
  period_end?: string;
  volume_usd?: number;
}
