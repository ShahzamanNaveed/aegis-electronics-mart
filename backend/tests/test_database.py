import certifi
import pytest

from app.core.config import Settings
from app.db.session import build_engine


def test_neon_uses_psycopg_and_verified_tls():
    engine = build_engine("postgresql://user:password@example.neon.tech/neondb?sslmode=disable")
    assert engine.dialect.driver == "psycopg"
    assert engine.url.query["sslmode"] == "verify-full"
    assert engine.url.query["sslrootcert"] == certifi.where()
    engine.dispose()


def test_missing_connection_requires_configuration():
    with pytest.raises(RuntimeError, match="PORTAL_DATABASE_URL"):
        _ = Settings(database_url=None, _env_file=None).resolved_database_url


@pytest.mark.parametrize("url", ["mysql://user:password@localhost/test", "oracle://localhost/test"])
def test_other_database_backends_are_rejected(url):
    with pytest.raises(ValueError, match="requires PostgreSQL"):
        build_engine(url)
