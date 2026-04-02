from sqlalchemy import Column, String, Float
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from app.models.base import TimestampMixin


class Country(Base, TimestampMixin):
    __tablename__ = "countries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    iso3 = Column(String(3), unique=True, nullable=False, index=True)
    iso2 = Column(String(2), nullable=True)
    name = Column(String(100), nullable=False)
    name_local = Column(String(100), nullable=True)
    region = Column(String(50), nullable=False)
    subregion = Column(String(50), nullable=True)
    flag_emoji = Column(String(10), nullable=True)
    capital = Column(String(100), nullable=True)
    population = Column(Float, nullable=True)
    # geom: PostGIS geometry added via Alembic migration directly
