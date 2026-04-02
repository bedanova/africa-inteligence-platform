from fastapi import APIRouter
from datetime import datetime, timezone
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.country import HomeOverview, Leaderboards, LeaderboardEntry
from app.services.mock_data import MOCK_COUNTRIES, MOCK_BRIEFS

router = APIRouter()


@router.get("/home/overview", response_model=ApiResponse[HomeOverview])
async def get_home_overview():
    countries_sorted_need = sorted(MOCK_COUNTRIES, key=lambda c: c["scores"]["need"], reverse=True)
    countries_sorted_opp = sorted(MOCK_COUNTRIES, key=lambda c: c["scores"]["opportunity"], reverse=True)
    countries_sorted_stab = sorted(MOCK_COUNTRIES, key=lambda c: c["scores"]["stability"], reverse=True)

    def to_leader(c: dict, score_key: str) -> LeaderboardEntry:
        return LeaderboardEntry(
            iso3=c["iso3"],
            name=c["name"],
            flag_emoji=c["flag_emoji"],
            score=c["scores"][score_key],
        )

    overview = HomeOverview(
        snapshot_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        ingest_status="ok",
        leaderboards=Leaderboards(
            highest_need=[to_leader(c, "need") for c in countries_sorted_need[:4]],
            fastest_opportunity=[to_leader(c, "opportunity") for c in countries_sorted_opp[:4]],
            most_improved_stability=[to_leader(c, "stability") for c in countries_sorted_stab[:4]],
            attention_gap=[to_leader(c, "need") for c in countries_sorted_need[-4:]],
        ),
        top_briefs=MOCK_BRIEFS[:3],  # type: ignore[arg-type]
        countries=MOCK_COUNTRIES,  # type: ignore[arg-type]
    )

    return ApiResponse(
        data=overview,
        meta=ApiMeta(
            generated_at=datetime.now(timezone.utc),
            freshness="fresh",
            sources=8,
            cache_status="MISS",
        ),
    )
