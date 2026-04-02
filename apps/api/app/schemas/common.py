from pydantic import BaseModel
from typing import Generic, TypeVar, Literal
from datetime import datetime

T = TypeVar("T")


class ApiMeta(BaseModel):
    generated_at: datetime
    freshness: Literal["fresh", "aging", "stale"]
    sources: int
    cache_status: Literal["HIT", "MISS", "BYPASS"] = "MISS"
    trace_id: str | None = None


class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: ApiMeta
