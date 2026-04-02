from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    environment: str = "development"
    log_level: str = "info"
    api_v1_prefix: str = "/v1"

    # Database
    database_url: str = "postgresql+asyncpg://africa:africa_dev@localhost:5432/africa_platform"
    database_url_sync: str = "postgresql://africa:africa_dev@localhost:5432/africa_platform"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # OpenAI
    openai_api_key: str = ""
    openai_embedding_model: str = "text-embedding-3-large"
    openai_chat_model: str = "gpt-4o"

    # OpenSearch
    opensearch_url: str = "http://localhost:9200"
    opensearch_username: str = "admin"
    opensearch_password: str = ""

    # S3 / R2
    s3_endpoint_url: str = ""
    s3_bucket_name: str = "africa-platform"
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_region: str = "auto"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "https://africa-intel.com"]

    # Cache TTLs (seconds)
    cache_ttl_overview: int = 900       # 15 min
    cache_ttl_country: int = 3600       # 1 hour
    cache_ttl_briefs: int = 3600        # 1 hour


@lru_cache
def get_settings() -> Settings:
    return Settings()
