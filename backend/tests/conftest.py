import os
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.engine import make_url

# Never use the shared application database for automated tests.
os.environ["PORTAL_DATABASE_URL"] = "postgresql://unused:unused@127.0.0.1:1/unused"
os.environ.pop("PORTAL_MIGRATION_DATABASE_URL", None)


@pytest.fixture(scope="module")
def test_database_url():
    # Each module owns only its random, disposable PostgreSQL schema.
    url = os.environ.get("PORTAL_TEST_POSTGRES_URL")
    if not url:
        raise pytest.UsageError(
            "Set PORTAL_TEST_POSTGRES_URL to a direct PostgreSQL test connection."
        )
    from app.db.session import build_engine

    admin = build_engine(url)
    schema = "aegis_test_" + uuid4().hex
    try:
        with admin.begin() as connection:
            connection.execute(text(f'CREATE SCHEMA "{schema}"'))
        isolated = make_url(url).update_query_dict({"options": f"-csearch_path={schema}"})
        yield isolated.render_as_string(hide_password=False)
    finally:
        with admin.begin() as connection:
            connection.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
        admin.dispose()
