from sqlalchemy import Column, String, Float, Integer, Boolean, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
import uuid
import enum
from app.core.database import Base
from app.models.base import TimestampMixin


class NewsItem(Base, TimestampMixin):
    __tablename__ = "news_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False)
    title = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    url = Column(Text, nullable=True)
    published_at = Column(String, nullable=False, index=True)
    fetched_at = Column(String, nullable=False)
    country_iso3 = Column(String(3), nullable=True, index=True)
    sdg_tags = Column(ARRAY(Integer), nullable=True)
    sector_tags = Column(ARRAY(String), nullable=True)
    trust_tier = Column(String(20), nullable=False, default="medium")
    is_indexed = Column(Boolean, default=False)   # indexed in OpenSearch


class BriefStatus(str, enum.Enum):
    draft = "draft"
    review = "review"
    published = "published"
    archived = "archived"


class AIBrief(Base, TimestampMixin):
    __tablename__ = "ai_briefs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    bullets = Column(JSONB, nullable=False)         # list[str]
    risk_flags = Column(JSONB, nullable=True)       # list[str]
    scope = Column(String(20), nullable=False)      # continent/country/theme
    country_iso3 = Column(String(3), nullable=True, index=True)
    sdg_goal = Column(Integer, nullable=True)
    freshness_level = Column(String(10), nullable=False, default="fresh")
    confidence = Column(Float, nullable=True)
    model_name = Column(String(50), nullable=False)
    prompt_version = Column(String(20), nullable=False)
    evidence_hash = Column(String(64), nullable=True)
    status = Column(Enum(BriefStatus), default=BriefStatus.draft)
    published_at = Column(String, nullable=True)
    generated_at = Column(String, nullable=False)


class AIBriefCitation(Base, TimestampMixin):
    __tablename__ = "ai_brief_citations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brief_id = Column(UUID(as_uuid=True), ForeignKey("ai_briefs.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type = Column(String(20), nullable=False)   # official_data/trusted_news/report
    label = Column(Text, nullable=False)
    url = Column(Text, nullable=True)
    news_item_id = Column(UUID(as_uuid=True), ForeignKey("news_items.id"), nullable=True)
    indicator_id = Column(UUID(as_uuid=True), ForeignKey("indicator_catalog.id"), nullable=True)
