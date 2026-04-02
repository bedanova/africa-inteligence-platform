"""
Mock data for Phase 0/1 development.
Replace with real DB queries in Phase 1 once ingest pipeline is running.
"""
from datetime import datetime, timezone

NOW = datetime.now(timezone.utc)
TODAY = NOW.strftime("%Y-%m-%d")

MOCK_COUNTRIES = [
    {
        "iso3": "KEN",
        "name": "Kenya",
        "region": "Eastern Africa",
        "flag_emoji": "🇰🇪",
        "scores": {"need": 62, "opportunity": 74, "stability": 55, "updated_at": NOW.isoformat()},
        "freshness": "fresh",
    },
    {
        "iso3": "NGA",
        "name": "Nigeria",
        "region": "Western Africa",
        "flag_emoji": "🇳🇬",
        "scores": {"need": 71, "opportunity": 68, "stability": 41, "updated_at": NOW.isoformat()},
        "freshness": "fresh",
    },
    {
        "iso3": "ETH",
        "name": "Ethiopia",
        "region": "Eastern Africa",
        "flag_emoji": "🇪🇹",
        "scores": {"need": 78, "opportunity": 52, "stability": 38, "updated_at": NOW.isoformat()},
        "freshness": "fresh",
    },
    {
        "iso3": "GHA",
        "name": "Ghana",
        "region": "Western Africa",
        "flag_emoji": "🇬🇭",
        "scores": {"need": 48, "opportunity": 71, "stability": 72, "updated_at": NOW.isoformat()},
        "freshness": "fresh",
    },
    {
        "iso3": "ZAF",
        "name": "South Africa",
        "region": "Southern Africa",
        "flag_emoji": "🇿🇦",
        "scores": {"need": 44, "opportunity": 66, "stability": 63, "updated_at": NOW.isoformat()},
        "freshness": "fresh",
    },
    {
        "iso3": "TZA",
        "name": "Tanzania",
        "region": "Eastern Africa",
        "flag_emoji": "🇹🇿",
        "scores": {"need": 65, "opportunity": 61, "stability": 60, "updated_at": NOW.isoformat()},
        "freshness": "fresh",
    },
    {
        "iso3": "RWA",
        "name": "Rwanda",
        "region": "Eastern Africa",
        "flag_emoji": "🇷🇼",
        "scores": {"need": 52, "opportunity": 70, "stability": 75, "updated_at": NOW.isoformat()},
        "freshness": "fresh",
    },
    {
        "iso3": "SEN",
        "name": "Senegal",
        "region": "Western Africa",
        "flag_emoji": "🇸🇳",
        "scores": {"need": 55, "opportunity": 64, "stability": 67, "updated_at": NOW.isoformat()},
        "freshness": "fresh",
    },
]

MOCK_BRIEFS = [
    {
        "id": "brief-001",
        "title": "East Africa: Sustained economic growth amid climate stress",
        "summary": (
            "GDP growth across East Africa remains above Sub-Saharan average, "
            "driven by services and mobile-first fintech adoption. Seasonal drought "
            "pressure continues in the Horn, with 3.2M people in Ethiopia requiring "
            "acute food assistance through Q2 2026."
        ),
        "bullets": [
            "Kenya GDP growth forecast at 5.1% for 2026 (World Bank, Apr 2026)",
            "Ethiopia acute food insecurity: 3.2M affected in Tigray and Afar regions (OCHA, Mar 2026)",
            "Rwanda digital economy index ranks 2nd in Africa for 2025 (AfDB)",
            "Mobile money penetration in East Africa now exceeds 65% of adult population (GSMA 2025)",
        ],
        "risk_flags": ["Drought pressure Horn of Africa", "Political transition Ethiopia"],
        "citations": [
            {"id": "c1", "label": "World Bank Africa Pulse Apr 2026", "source_type": "official_data"},
            {"id": "c2", "label": "OCHA Ethiopia Situation Report Mar 2026", "source_type": "report"},
            {"id": "c3", "label": "AfDB African Economic Outlook 2025", "source_type": "official_data"},
            {"id": "c4", "label": "GSMA Mobile Economy Sub-Saharan Africa 2025", "source_type": "official_data"},
        ],
        "scope": "continent",
        "country_iso3": None,
        "freshness": "fresh",
        "generated_at": NOW.isoformat(),
        "model_name": "mock-v0",
        "confidence": 0.88,
    },
    {
        "id": "brief-002",
        "title": "Nigeria: Infrastructure gap constrains opportunity capture",
        "summary": (
            "Nigeria holds the largest GDP and population in Africa but persistent "
            "electricity access gaps (41% of population) and currency instability "
            "constrain tech sector growth despite strong startup activity."
        ),
        "bullets": [
            "Electricity access: 41% national coverage, 17% rural (IEA 2025)",
            "Naira stabilised at ~1,580 NGN/USD after CBN policy interventions (Q1 2026)",
            "Lagos startup ecosystem ranked 3rd in Africa by deal volume (Partech 2025)",
        ],
        "risk_flags": ["Currency volatility", "Fuel subsidy reform impact"],
        "citations": [
            {"id": "c5", "label": "IEA Africa Energy Outlook 2025", "source_type": "official_data"},
            {"id": "c6", "label": "Partech Africa Report 2025", "source_type": "report"},
        ],
        "scope": "country",
        "country_iso3": "NGA",
        "freshness": "fresh",
        "generated_at": NOW.isoformat(),
        "model_name": "mock-v0",
        "confidence": 0.82,
    },
    {
        "id": "brief-003",
        "title": "Rwanda: Governance model drives stability and investment",
        "summary": (
            "Rwanda maintains the highest governance score in the dataset, with strong "
            "public institution performance and a digital services economy growing at 7.2% "
            "annually. SDG 16 (Peace & Justice) scores rank first in Sub-Saharan Africa."
        ),
        "bullets": [
            "V-Dem institutional quality score: 0.71/1.0 (highest in dataset)",
            "ICT sector contribution to GDP: 8.1% in 2025 (RDB)",
            "World Bank Doing Business rank: 38th globally, 1st in EAC region",
        ],
        "risk_flags": [],
        "citations": [
            {"id": "c7", "label": "V-Dem Dataset v14 2025", "source_type": "official_data"},
            {"id": "c8", "label": "Rwanda Development Board Annual Report 2025", "source_type": "report"},
        ],
        "scope": "country",
        "country_iso3": "RWA",
        "freshness": "fresh",
        "generated_at": NOW.isoformat(),
        "model_name": "mock-v0",
        "confidence": 0.91,
    },
]

MOCK_METRICS: dict[str, list[dict]] = {
    "KEN": [
        {"key": "gdp_growth", "label": "GDP Growth", "value": 5.1, "unit": "%", "trend": "up", "source": "World Bank", "source_year": 2026, "freshness": "fresh"},
        {"key": "connectivity", "label": "Internet Access", "value": 42, "unit": "%", "trend": "up", "source": "GSMA", "source_year": 2025, "freshness": "fresh"},
        {"key": "conflict_pressure", "label": "Conflict Pressure", "value": "Moderate", "unit": None, "trend": "flat", "source": "ACLED", "source_year": 2026, "freshness": "fresh"},
        {"key": "health_burden", "label": "Under-5 Mortality", "value": 38, "unit": "per 1k", "trend": "down", "source": "WHO GHO", "source_year": 2024, "freshness": "aging"},
    ],
    "NGA": [
        {"key": "gdp_growth", "label": "GDP Growth", "value": 3.2, "unit": "%", "trend": "flat", "source": "World Bank", "source_year": 2026, "freshness": "fresh"},
        {"key": "connectivity", "label": "Internet Access", "value": 35, "unit": "%", "trend": "up", "source": "GSMA", "source_year": 2025, "freshness": "fresh"},
        {"key": "conflict_pressure", "label": "Conflict Pressure", "value": "High", "unit": None, "trend": "up", "source": "ACLED", "source_year": 2026, "freshness": "fresh"},
        {"key": "health_burden", "label": "Under-5 Mortality", "value": 71, "unit": "per 1k", "trend": "down", "source": "WHO GHO", "source_year": 2024, "freshness": "aging"},
    ],
    "ETH": [
        {"key": "gdp_growth", "label": "GDP Growth", "value": 6.5, "unit": "%", "trend": "up", "source": "World Bank", "source_year": 2026, "freshness": "fresh"},
        {"key": "connectivity", "label": "Internet Access", "value": 22, "unit": "%", "trend": "up", "source": "GSMA", "source_year": 2025, "freshness": "fresh"},
        {"key": "conflict_pressure", "label": "Conflict Pressure", "value": "Very High", "unit": None, "trend": "flat", "source": "ACLED", "source_year": 2026, "freshness": "fresh"},
        {"key": "health_burden", "label": "Under-5 Mortality", "value": 52, "unit": "per 1k", "trend": "down", "source": "WHO GHO", "source_year": 2024, "freshness": "aging"},
    ],
    "GHA": [
        {"key": "gdp_growth", "label": "GDP Growth", "value": 4.7, "unit": "%", "trend": "up", "source": "World Bank", "source_year": 2026, "freshness": "fresh"},
        {"key": "connectivity", "label": "Internet Access", "value": 58, "unit": "%", "trend": "up", "source": "GSMA", "source_year": 2025, "freshness": "fresh"},
        {"key": "conflict_pressure", "label": "Conflict Pressure", "value": "Low", "unit": None, "trend": "flat", "source": "ACLED", "source_year": 2026, "freshness": "fresh"},
        {"key": "health_burden", "label": "Under-5 Mortality", "value": 44, "unit": "per 1k", "trend": "down", "source": "WHO GHO", "source_year": 2024, "freshness": "aging"},
    ],
    "ZAF": [
        {"key": "gdp_growth", "label": "GDP Growth", "value": 1.9, "unit": "%", "trend": "down", "source": "World Bank", "source_year": 2026, "freshness": "fresh"},
        {"key": "connectivity", "label": "Internet Access", "value": 72, "unit": "%", "trend": "up", "source": "GSMA", "source_year": 2025, "freshness": "fresh"},
        {"key": "conflict_pressure", "label": "Conflict Pressure", "value": "Low-Mod", "unit": None, "trend": "flat", "source": "ACLED", "source_year": 2026, "freshness": "fresh"},
        {"key": "health_burden", "label": "Under-5 Mortality", "value": 30, "unit": "per 1k", "trend": "down", "source": "WHO GHO", "source_year": 2024, "freshness": "aging"},
    ],
}

MOCK_ACTIONS: dict[str, list[dict]] = {
    "KEN": [
        {"id": "a-ken-1", "type": "donate", "title": "Support WASH programs in Turkana County", "org_name": "WaterAid Kenya", "org_id": "org-wateraid", "org_verification_tier": "A", "country_iso3": "KEN", "url": "#", "description": "Funding clean water access for 50,000+ people in arid regions."},
        {"id": "a-ken-2", "type": "volunteer", "title": "Remote data analyst — health indicators", "org_name": "AfriMapper", "org_id": "org-afrimapper", "org_verification_tier": "B", "country_iso3": "KEN", "url": "#", "description": "3-month remote engagement, flexible hours."},
        {"id": "a-ken-3", "type": "invest", "title": "Agri-fintech seed opportunities — East Africa", "org_name": "Enza Capital", "org_id": "org-enza", "org_verification_tier": "A", "country_iso3": "KEN", "url": "#", "description": "Screened early-stage opportunities in climate-smart agriculture."},
    ],
    "NGA": [
        {"id": "a-nga-1", "type": "donate", "title": "Girls' secondary education in Kano State", "org_name": "Educate Girls Nigeria", "org_id": "org-egn", "org_verification_tier": "A", "country_iso3": "NGA", "url": "#"},
        {"id": "a-nga-2", "type": "learn", "title": "Nigeria energy transition — policy brief", "org_name": "Energy Policy Research Africa", "org_id": "org-epra", "org_verification_tier": "B", "country_iso3": "NGA", "url": "#"},
    ],
}

MOCK_SECTORS: dict[str, list[str]] = {
    "KEN": ["Fintech", "Agri-tech", "WASH", "Renewable Energy", "Health"],
    "NGA": ["Energy Access", "Education", "Fintech", "Climate Adaptation"],
    "ETH": ["Humanitarian Response", "WASH", "Food Security", "Health"],
    "GHA": ["Cocoa Value Chain", "Fintech", "Renewable Energy", "Education"],
    "ZAF": ["Renewable Energy", "Fintech", "Mining Tech", "Healthcare"],
    "TZA": ["Tourism", "Agriculture", "WASH", "Education"],
    "RWA": ["Digital Economy", "Healthcare", "Agriculture", "Manufacturing"],
    "SEN": ["Fisheries", "Agriculture", "Renewable Energy", "Fintech"],
}


def get_country_brief(iso3: str) -> dict | None:
    return next((b for b in MOCK_BRIEFS if b.get("country_iso3") == iso3), None)
