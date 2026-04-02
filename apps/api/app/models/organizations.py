from sqlalchemy import Column, String, Float, Integer, Boolean, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
import uuid
import enum
from app.core.database import Base
from app.models.base import TimestampMixin


class VerificationTier(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    unverified = "unverified"


class PublicStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    pending = "pending"


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    website = Column(Text, nullable=True)
    mission = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    country_iso3_hq = Column(String(3), nullable=True)
    countries_active = Column(ARRAY(String(3)), nullable=True)
    sectors = Column(ARRAY(String), nullable=True)
    sdg_tags = Column(ARRAY(Integer), nullable=True)
    action_types = Column(ARRAY(String), nullable=True)  # donate/volunteer/learn/invest
    verification_tier = Column(Enum(VerificationTier), default=VerificationTier.unverified)
    public_status = Column(Enum(PublicStatus), default=PublicStatus.pending)
    last_reviewed_at = Column(String, nullable=True)
    logo_url = Column(Text, nullable=True)
    is_deleted = Column(Boolean, default=False)


class OrganizationVerification(Base, TimestampMixin):
    __tablename__ = "organization_verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    tier_assigned = Column(Enum(VerificationTier), nullable=False)
    reviewer = Column(String(100), nullable=True)
    evidence_uri = Column(Text, nullable=True)   # S3/R2 path to evidence document
    notes = Column(Text, nullable=True)
    verified_at = Column(String, nullable=False)
    expires_at = Column(String, nullable=True)    # periodic re-certification


class VolunteerRole(Base, TimestampMixin):
    __tablename__ = "volunteer_roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_remote = Column(Boolean, default=True)
    country_iso3 = Column(String(3), nullable=True)
    commitment_hours_week = Column(Integer, nullable=True)
    duration_weeks = Column(Integer, nullable=True)
    skills_required = Column(ARRAY(String), nullable=True)
    sdg_tags = Column(ARRAY(Integer), nullable=True)
    is_active = Column(Boolean, default=True)
    url = Column(Text, nullable=True)


class ImpactAction(Base, TimestampMixin):
    __tablename__ = "impact_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    country_iso3 = Column(String(3), nullable=False, index=True)
    sector = Column(String(100), nullable=True)
    action_type = Column(String(20), nullable=False)
    reported_output = Column(Text, nullable=True)
    verified_outcome = Column(Text, nullable=True)      # only if externally verified
    is_outcome_verified = Column(Boolean, default=False)
    period_start = Column(String(20), nullable=False)
    period_end = Column(String(20), nullable=True)
    volume_usd = Column(Float, nullable=True)
    source_url = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSONB, nullable=True)
