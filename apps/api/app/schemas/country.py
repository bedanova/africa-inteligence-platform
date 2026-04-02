from pydantic import BaseModel
from typing import Literal
from datetime import datetime

Freshness = Literal["fresh", "aging", "stale"]
Region = Literal[
    "Northern Africa",
    "Western Africa",
    "Eastern Africa",
    "Central Africa",
    "Southern Africa",
]
ActionType = Literal["donate", "volunteer", "learn", "invest"]
VerificationTier = Literal["A", "B", "C", "unverified"]


class CountryScores(BaseModel):
    need: float
    opportunity: float
    stability: float
    updated_at: datetime


class CountrySummary(BaseModel):
    iso3: str
    name: str
    region: Region
    flag_emoji: str
    scores: CountryScores
    freshness: Freshness


class CountryMetric(BaseModel):
    key: str
    label: str
    value: str | float
    unit: str | None = None
    trend: Literal["up", "down", "flat"] | None = None
    source: str
    source_year: int
    freshness: Freshness


class AIBriefCitation(BaseModel):
    id: str
    label: str
    url: str | None = None
    source_type: Literal["official_data", "trusted_news", "report"]


class AIBrief(BaseModel):
    id: str
    title: str
    summary: str
    bullets: list[str]
    risk_flags: list[str]
    citations: list[AIBriefCitation]
    scope: Literal["continent", "country", "theme"]
    country_iso3: str | None = None
    freshness: Freshness
    generated_at: datetime
    model_name: str
    confidence: float


class ActionCard(BaseModel):
    id: str
    type: ActionType
    title: str
    org_name: str
    org_id: str
    org_verification_tier: VerificationTier
    country_iso3: str | None = None
    url: str
    description: str | None = None
    warning: str | None = None


class CountryProfile(CountrySummary):
    ai_brief: AIBrief | None
    metrics: list[CountryMetric]
    priority_sectors: list[str]
    trusted_actions: list[ActionCard]


class LeaderboardEntry(BaseModel):
    iso3: str
    name: str
    flag_emoji: str
    score: float
    delta: float | None = None


class Leaderboards(BaseModel):
    highest_need: list[LeaderboardEntry]
    fastest_opportunity: list[LeaderboardEntry]
    most_improved_stability: list[LeaderboardEntry]
    attention_gap: list[LeaderboardEntry]


class HomeOverview(BaseModel):
    snapshot_date: str
    ingest_status: Literal["ok", "partial", "stale"]
    leaderboards: Leaderboards
    top_briefs: list[AIBrief]
    countries: list[CountrySummary]
