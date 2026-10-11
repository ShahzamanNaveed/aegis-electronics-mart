from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="PORTAL_", env_file=PROJECT_ROOT / ".env", extra="ignore"
    )

    database_url: str | None = None
    migration_database_url: str | None = None
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "smollm2:135m"
    ollama_timeout_seconds: float = Field(default=90, ge=1, le=180)

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        raise RuntimeError("Set PORTAL_DATABASE_URL in the project .env or server environment.")


settings = Settings()
