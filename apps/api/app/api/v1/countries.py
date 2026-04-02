from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.country import CountrySummary, CountryProfile
from app.services.mock_data import (
    MOCK_COUNTRIES,
    MOCK_METRICS,
    MOCK_ACTIONS,
    MOCK_SECTORS,
    get_country_brief,
)

router = APIRouter()


@router.get("/countries", response_model=ApiResponse[list[CountrySummary]])
async def list_countries(region: str | None = None):
    countries = MOCK_COUNTRIES
    if region:
        countries = [c for c in countries if c["region"].lower() == region.lower()]

    return ApiResponse(
        data=countries,  # type: ignore[arg-type]
        meta=ApiMeta(
            generated_at=datetime.now(timezone.utc),
            freshness="fresh",
            sources=6,
            cache_status="MISS",
        ),
    )


@router.get("/countries/{iso3}", response_model=ApiResponse[CountryProfile])
async def get_country(iso3: str):
    iso3 = iso3.upper()
    country = next((c for c in MOCK_COUNTRIES if c["iso3"] == iso3), None)
    if not country:
        raise HTTPException(status_code=404, detail=f"Country {iso3} not found")

    profile = CountryProfile(
        **country,  # type: ignore[arg-type]
        ai_brief=get_country_brief(iso3),  # type: ignore[arg-type]
        metrics=MOCK_METRICS.get(iso3, []),  # type: ignore[arg-type]
        priority_sectors=MOCK_SECTORS.get(iso3, []),
        trusted_actions=MOCK_ACTIONS.get(iso3, []),  # type: ignore[arg-type]
    )

    return ApiResponse(
        data=profile,
        meta=ApiMeta(
            generated_at=datetime.now(timezone.utc),
            freshness="fresh",
            sources=5,
            cache_status="MISS",
        ),
    )
