"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE")
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Enums
    op.execute("CREATE TYPE qualityflag AS ENUM ('ok','estimated','provisional','stale','missing')")
    op.execute("CREATE TYPE freshnesslevel AS ENUM ('fresh','aging','stale')")
    op.execute("CREATE TYPE briefstatus AS ENUM ('draft','review','published','archived')")
    op.execute("CREATE TYPE verificationtier AS ENUM ('A','B','C','unverified')")
    op.execute("CREATE TYPE publicstatus AS ENUM ('active','inactive','suspended','pending')")

    # --- countries ---
    op.create_table(
        "countries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("iso3", sa.String(3), unique=True, nullable=False),
        sa.Column("iso2", sa.String(2), nullable=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("name_local", sa.String(100), nullable=True),
        sa.Column("region", sa.String(50), nullable=False),
        sa.Column("subregion", sa.String(50), nullable=True),
        sa.Column("flag_emoji", sa.String(10), nullable=True),
        sa.Column("capital", sa.String(100), nullable=True),
        sa.Column("population", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )
    op.execute("SELECT AddGeometryColumn('countries', 'geom', 4326, 'MULTIPOLYGON', 2)")
    op.create_index("idx_countries_iso3", "countries", ["iso3"])

    # --- sources ---
    op.create_table(
        "sources",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("code", sa.String(50), unique=True, nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("url", sa.Text, nullable=True),
        sa.Column("trust_tier", sa.String(20), nullable=False, server_default="medium"),
        sa.Column("refresh_cadence", sa.String(50), nullable=True),
        sa.Column("license_type", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )

    # --- raw_snapshots ---
    op.create_table(
        "raw_snapshots",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("source_id", UUID(as_uuid=True), sa.ForeignKey("sources.id"), nullable=False),
        sa.Column("fetched_at", sa.String, nullable=False),
        sa.Column("checksum", sa.String(64), nullable=True),
        sa.Column("payload_uri", sa.Text, nullable=True),
        sa.Column("status", sa.String(20), server_default="ok"),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )

    # --- indicator_catalog ---
    op.create_table(
        "indicator_catalog",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("code", sa.String(100), unique=True, nullable=False),
        sa.Column("label", sa.String(200), nullable=False),
        sa.Column("unit", sa.String(50), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("sdg_goal", sa.Integer, nullable=True),
        sa.Column("source_id", UUID(as_uuid=True), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("aggregation_method", sa.String(50), nullable=True),
        sa.Column("is_core", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )

    # --- country_indicator_daily (TimescaleDB hypertable) ---
    op.create_table(
        "country_indicator_daily",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("country_id", UUID(as_uuid=True), sa.ForeignKey("countries.id"), nullable=False),
        sa.Column("indicator_id", UUID(as_uuid=True), sa.ForeignKey("indicator_catalog.id"), nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("value", sa.Float, nullable=True),
        sa.Column("original_period", sa.String(20), nullable=True),
        sa.Column("source_id", UUID(as_uuid=True), sa.ForeignKey("sources.id"), nullable=False),
        sa.Column("fetched_at", sa.String, nullable=False),
        sa.Column("quality_flag", sa.Text, server_default="ok"),
        sa.Column("freshness_level", sa.Text, server_default="fresh"),
        sa.Column("version", sa.Integer, server_default="1"),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )
    op.create_index("idx_cid_country_indicator_date", "country_indicator_daily", ["country_id", "indicator_id", sa.text("date DESC")])
    op.execute("SELECT create_hypertable('country_indicator_daily', 'date', if_not_exists => TRUE)")

    # --- country_scores_daily (TimescaleDB hypertable) ---
    op.create_table(
        "country_scores_daily",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("country_id", UUID(as_uuid=True), sa.ForeignKey("countries.id"), nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("need_score", sa.Float, nullable=False),
        sa.Column("opportunity_score", sa.Float, nullable=False),
        sa.Column("stability_score", sa.Float, nullable=False),
        sa.Column("scoring_version", sa.String(20), server_default="v1"),
        sa.Column("quality_flag", sa.Text, server_default="ok"),
        sa.Column("freshness_level", sa.Text, server_default="fresh"),
        sa.Column("indicator_count", sa.Integer, nullable=True),
        sa.Column("metadata", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )
    op.create_index("idx_csd_country_date", "country_scores_daily", ["country_id", sa.text("date DESC")])
    op.execute("SELECT create_hypertable('country_scores_daily', 'date', if_not_exists => TRUE)")

    # --- news_items ---
    op.create_table(
        "news_items",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("source_id", UUID(as_uuid=True), sa.ForeignKey("sources.id"), nullable=False),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("summary", sa.Text, nullable=True),
        sa.Column("url", sa.Text, nullable=True),
        sa.Column("published_at", sa.String, nullable=False),
        sa.Column("fetched_at", sa.String, nullable=False),
        sa.Column("country_iso3", sa.String(3), nullable=True),
        sa.Column("sdg_tags", ARRAY(sa.Integer), nullable=True),
        sa.Column("sector_tags", ARRAY(sa.String), nullable=True),
        sa.Column("trust_tier", sa.String(20), server_default="medium"),
        sa.Column("is_indexed", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )
    op.create_index("idx_news_country_published", "news_items", ["country_iso3", "published_at"])

    # --- ai_briefs ---
    op.create_table(
        "ai_briefs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("summary", sa.Text, nullable=False),
        sa.Column("bullets", JSONB, nullable=False),
        sa.Column("risk_flags", JSONB, nullable=True),
        sa.Column("scope", sa.String(20), nullable=False),
        sa.Column("country_iso3", sa.String(3), nullable=True),
        sa.Column("sdg_goal", sa.Integer, nullable=True),
        sa.Column("freshness_level", sa.String(10), server_default="fresh"),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("model_name", sa.String(50), nullable=False),
        sa.Column("prompt_version", sa.String(20), nullable=False),
        sa.Column("evidence_hash", sa.String(64), nullable=True),
        sa.Column("status", sa.Text, server_default="draft"),
        sa.Column("published_at", sa.String, nullable=True),
        sa.Column("generated_at", sa.String, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )
    op.create_index("idx_briefs_country_generated", "ai_briefs", ["country_iso3", "generated_at"])

    # --- ai_brief_citations ---
    op.create_table(
        "ai_brief_citations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("brief_id", UUID(as_uuid=True), sa.ForeignKey("ai_briefs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source_type", sa.String(20), nullable=False),
        sa.Column("label", sa.Text, nullable=False),
        sa.Column("url", sa.Text, nullable=True),
        sa.Column("news_item_id", UUID(as_uuid=True), sa.ForeignKey("news_items.id"), nullable=True),
        sa.Column("indicator_id", UUID(as_uuid=True), sa.ForeignKey("indicator_catalog.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )
    op.create_index("idx_citations_brief", "ai_brief_citations", ["brief_id"])

    # --- organizations ---
    op.create_table(
        "organizations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("website", sa.Text, nullable=True),
        sa.Column("mission", sa.Text, nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("country_iso3_hq", sa.String(3), nullable=True),
        sa.Column("countries_active", ARRAY(sa.String(3)), nullable=True),
        sa.Column("sectors", ARRAY(sa.String), nullable=True),
        sa.Column("sdg_tags", ARRAY(sa.Integer), nullable=True),
        sa.Column("action_types", ARRAY(sa.String), nullable=True),
        sa.Column("verification_tier", sa.Text, server_default="unverified"),
        sa.Column("public_status", sa.Text, server_default="pending"),
        sa.Column("last_reviewed_at", sa.String, nullable=True),
        sa.Column("logo_url", sa.Text, nullable=True),
        sa.Column("is_deleted", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )

    # --- organization_verifications ---
    op.create_table(
        "organization_verifications",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("org_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tier_assigned", sa.Text, nullable=False),
        sa.Column("reviewer", sa.String(100), nullable=True),
        sa.Column("evidence_uri", sa.Text, nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("verified_at", sa.String, nullable=False),
        sa.Column("expires_at", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )
    op.create_index("idx_verifications_org", "organization_verifications", ["org_id"])

    # --- volunteer_roles ---
    op.create_table(
        "volunteer_roles",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("org_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("is_remote", sa.Boolean, server_default="true"),
        sa.Column("country_iso3", sa.String(3), nullable=True),
        sa.Column("commitment_hours_week", sa.Integer, nullable=True),
        sa.Column("duration_weeks", sa.Integer, nullable=True),
        sa.Column("skills_required", ARRAY(sa.String), nullable=True),
        sa.Column("sdg_tags", ARRAY(sa.Integer), nullable=True),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("url", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )

    # --- impact_actions ---
    op.create_table(
        "impact_actions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("org_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("country_iso3", sa.String(3), nullable=False),
        sa.Column("sector", sa.String(100), nullable=True),
        sa.Column("action_type", sa.String(20), nullable=False),
        sa.Column("reported_output", sa.Text, nullable=True),
        sa.Column("verified_outcome", sa.Text, nullable=True),
        sa.Column("is_outcome_verified", sa.Boolean, server_default="false"),
        sa.Column("period_start", sa.String(20), nullable=False),
        sa.Column("period_end", sa.String(20), nullable=True),
        sa.Column("volume_usd", sa.Float, nullable=True),
        sa.Column("source_url", sa.Text, nullable=True),
        sa.Column("metadata", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )
    op.create_index("idx_impact_country_org", "impact_actions", ["country_iso3", "org_id"])

    # Seed sources
    op.execute("""
        INSERT INTO sources (id, code, name, url, trust_tier, refresh_cadence) VALUES
        (uuid_generate_v4(), 'world_bank', 'World Bank Indicators', 'https://data.worldbank.org/indicator', 'high', 'daily'),
        (uuid_generate_v4(), 'un_sdg', 'UN SDG API', 'https://unstats.un.org/sdgapi', 'high', 'daily'),
        (uuid_generate_v4(), 'who_gho', 'WHO Global Health Observatory', 'https://www.who.int/data/gho', 'high', 'per_indicator'),
        (uuid_generate_v4(), 'acled', 'ACLED Conflict Data', 'https://acleddata.com', 'high', 'daily'),
        (uuid_generate_v4(), 'gsma', 'GSMA Mobile Economy', 'https://www.gsma.com/mobileeconomy', 'high', 'annual'),
        (uuid_generate_v4(), 'vdem', 'V-Dem Dataset', 'https://www.v-dem.net', 'high', 'annual'),
        (uuid_generate_v4(), 'freedom_house', 'Freedom House', 'https://freedomhouse.org', 'high', 'annual'),
        (uuid_generate_v4(), 'reliefweb', 'ReliefWeb', 'https://reliefweb.int', 'high', 'hourly'),
        (uuid_generate_v4(), 'afdb', 'African Development Bank', 'https://www.afdb.org', 'high', 'annual')
    """)


def downgrade() -> None:
    op.drop_table("impact_actions")
    op.drop_table("volunteer_roles")
    op.drop_table("organization_verifications")
    op.drop_table("organizations")
    op.drop_table("ai_brief_citations")
    op.drop_table("ai_briefs")
    op.drop_table("news_items")
    op.drop_table("country_scores_daily")
    op.drop_table("country_indicator_daily")
    op.drop_table("indicator_catalog")
    op.drop_table("raw_snapshots")
    op.drop_table("sources")
    op.drop_table("countries")
    op.execute("DROP TYPE IF EXISTS publicstatus")
    op.execute("DROP TYPE IF EXISTS verificationtier")
    op.execute("DROP TYPE IF EXISTS briefstatus")
    op.execute("DROP TYPE IF EXISTS freshnesslevel")
    op.execute("DROP TYPE IF EXISTS qualityflag")
