from sqlalchemy import Column, String, Float, Integer, Date, Boolean, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
import enum
from app.core.database import Base
from app.models.base import TimestampMixin


class QualityFlag(str, enum.Enum):
    ok = "ok"
    estimated = "estimated"
    provisional = "provisional"
    stale = "stale"
    missing = "missing"


class FreshnessLevel(str, enum.Enum):
    fresh = "fresh"
    aging = "aging"
    stale = "stale"


class Source(Base, TimestampMixin):
    __tablename__ = "sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    url = Column(Text, nullable=True)
    trust_tier = Column(String(20), nullable=False, default="medium")  # high/medium/low
    refresh_cadence = Column(String(50), nullable=True)  # daily/annual/ad_hoc
    license_type = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)


class RawSnapshot(Base, TimestampMixin):
    __tablename__ = "raw_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False)
    fetched_at = Column(String, nullable=False)  # ISO datetime string
    checksum = Column(String(64), nullable=True)  # SHA-256
    payload_uri = Column(Text, nullable=True)     # S3/R2 object path
    status = Column(String(20), default="ok")     # ok/error/partial
    error_message = Column(Text, nullable=True)


class IndicatorCatalog(Base, TimestampMixin):
    __tablename__ = "indicator_catalog"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(100), unique=True, nullable=False)
    label = Column(String(200), nullable=False)
    unit = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    sdg_goal = Column(Integer, nullable=True)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=True)
    aggregation_method = Column(String(50), nullable=True)  # sum/mean/latest
    is_core = Column(Boolean, default=False)


class CountryIndicatorDaily(Base, TimestampMixin):
    """
    Main fact table for daily/periodic indicator values.
    TimescaleDB hypertable partitioned by date.
    """
    __tablename__ = "country_indicator_daily"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country_id = Column(UUID(as_uuid=True), ForeignKey("countries.id"), nullable=False, index=True)
    indicator_id = Column(UUID(as_uuid=True), ForeignKey("indicator_catalog.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    value = Column(Float, nullable=True)
    original_period = Column(String(20), nullable=True)   # e.g. "2024", "2024-Q3"
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False)
    fetched_at = Column(String, nullable=False)
    quality_flag = Column(Enum(QualityFlag), default=QualityFlag.ok)
    freshness_level = Column(Enum(FreshnessLevel), default=FreshnessLevel.fresh)
    version = Column(Integer, default=1)
    notes = Column(Text, nullable=True)


class CountryScoresDaily(Base, TimestampMixin):
    """
    Derived composite scores (Need / Opportunity / Stability).
    TimescaleDB hypertable or daily snapshot table.
    """
    __tablename__ = "country_scores_daily"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country_id = Column(UUID(as_uuid=True), ForeignKey("countries.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    need_score = Column(Float, nullable=False)
    opportunity_score = Column(Float, nullable=False)
    stability_score = Column(Float, nullable=False)
    scoring_version = Column(String(20), nullable=False, default="v1")
    quality_flag = Column(Enum(QualityFlag), default=QualityFlag.ok)
    freshness_level = Column(Enum(FreshnessLevel), default=FreshnessLevel.fresh)
    indicator_count = Column(Integer, nullable=True)
    metadata_ = Column("metadata", JSONB, nullable=True)
