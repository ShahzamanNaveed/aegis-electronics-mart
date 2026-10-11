from datetime import UTC, datetime
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.db.models import Article, Category
from app.db.session import build_engine, get_db
from app.main import create_app
from app.seed import seed


@pytest.fixture(scope="module")
def portal(test_database_url):
    url = test_database_url
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    config.attributes["database_url"] = url
    command.upgrade(config, "head")
    engine = build_engine(url)
    with Session(engine) as db:
        assert seed(db) == {"categories": 5, "articles": 12}
        assert seed(db) == {"categories": 0, "articles": 0}
        category = db.scalar(select(Category))
        db.add(
            Article(
                id="draft",
                slug="private-draft",
                category_id=category.id,
                title="Private draft canary",
                excerpt="Not public",
                topic="care",
                sections=[],
                search_text="private draft canary",
                reading_minutes=1,
                published=False,
                featured_order=0,
                updated_at=datetime.now(UTC),
            )
        )
        db.commit()
    app = create_app()

    def database():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = database
    with TestClient(app) as client:
        yield client, app
    engine.dispose()


def test_categories_and_pagination(portal):
    client, _ = portal
    categories = client.get("/api/v1/help/categories").json()
    assert len(categories) == 5
    assert sum(c["article_count"] for c in categories) == 12
    first = client.get("/api/v1/help/articles").json()
    second = client.get("/api/v1/help/articles?page=2").json()
    assert first["total"] == 12 and first["pages"] == 2
    assert len(first["items"]) == len(second["items"]) == 6
    assert not {a["id"] for a in first["items"]} & {a["id"] for a in second["items"]}


def test_search_filters_and_detail(portal):
    client, _ = portal
    results = client.get("/api/v1/help/articles", params={"query": "washing first"}).json()
    assert any(a["slug"] == "washing-machine-first-wash" for a in results["items"])
    filtered = client.get("/api/v1/help/articles?category=laundry&topic=setup").json()
    assert filtered["total"] == 1
    article = client.get("/api/v1/help/articles/washing-machine-first-wash").json()
    assert len(article["sections"]) == 3
    assert article["related"]
    assert "search_text" not in article


@pytest.mark.parametrize("query", ["private draft canary", "%_%%", "' OR 1=1 --", "zzznomatch"])
def test_search_does_not_leak_or_expand_wildcards(portal, query):
    client, _ = portal
    assert client.get("/api/v1/help/articles", params={"query": query}).json()["total"] == 0


@pytest.mark.parametrize(
    "path,status",
    [
        ("/api/v1/help/articles/private-draft", 404),
        ("/api/v1/help/articles/missing", 404),
        ("/api/v1/help/articles?category=missing", 404),
        ("/api/v1/help/articles?topic=secret", 422),
        ("/api/v1/help/articles?page=0", 422),
        ("/api/v1/help/articles?page_size=100", 422),
        ("/api/v1/help/articles?query=" + "a" * 121, 422),
    ],
)
def test_bounded_inputs_and_errors(portal, path, status):
    client, _ = portal
    response = client.get(path)
    assert response.status_code == status
    assert response.json()["error"]["request_id"] == response.headers["x-request-id"]
    assert response.headers["x-content-type-options"] == "nosniff"


def test_health_and_database_failure(portal):
    client, app = portal
    assert client.get("/api/v1/health").status_code == 200
    assert client.get("/api/v1/ready").status_code == 200

    def broken_database():
        raise OperationalError("sensitive SQL", {}, Exception("private database path"))

    original = app.dependency_overrides[get_db]
    app.dependency_overrides[get_db] = broken_database
    response = client.get("/api/v1/help/categories")
    app.dependency_overrides[get_db] = original
    assert response.status_code == 503
    assert "sensitive" not in response.text and "private database" not in response.text
