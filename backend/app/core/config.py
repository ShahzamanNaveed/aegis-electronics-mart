from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="PORTAL_", env_file=PROJECT_ROOT / ".env", extra="ignore"
    )

    database_url: str | None = None
    migration_database_url: str | None = None

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        raise RuntimeError("Set PORTAL_DATABASE_URL in the project .env or server environment.")


settings = Settings()
