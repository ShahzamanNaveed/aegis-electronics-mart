from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.catalog_seed import seed_catalog
from app.db.models import Product
from app.db.session import build_engine, get_db
from app.export_corpus import documents
from app.main import create_app
from app.seed import seed


@pytest.fixture(scope="module")
def catalog(test_database_url):
    url = test_database_url
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    config.attributes["database_url"] = url
    command.upgrade(config, "head")
    engine = build_engine(url)
    with Session(engine) as db:
        seed(db)
        assert seed_catalog(db) == {"departments": 12, "products": 60}
        assert seed_catalog(db) == {"departments": 0, "products": 0}
    app = create_app()

    def database():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = database
    with TestClient(app) as client:
        yield client, engine
    engine.dispose()


def test_search_filters_and_pagination(catalog):
    client, _ = catalog
    ds = client.get("/api/v1/catalog/departments").json()
    assert len(ds) == 12 and sum(d["product_count"] for d in ds) == 60
    assert client.get("/api/v1/catalog/products").json()["total"] == 60
    result = client.get("/api/v1/catalog/products?department=laptops&sort=price-asc").json()
    prices = [p["price_paisa"] for p in result["items"]]
    assert result["total"] == 5 and prices == sorted(prices)
    result = client.get("/api/v1/catalog/products?query=work+14").json()
    assert any(p["sku"] == "AE-10-003" for p in result["items"])
    result = client.get("/api/v1/catalog/products?max_price=1000000&in_stock=true").json()
    assert all(p["price_paisa"] <= 1000000 and p["stock"] > 0 for p in result["items"])
    a = client.get("/api/v1/catalog/products?page=1").json()["items"]
    b = client.get("/api/v1/catalog/products?page=2").json()["items"]
    assert not {p["id"] for p in a} & {p["id"] for p in b}


def test_detail_selection_and_quote(catalog):
    client, _ = catalog
    slug = "laptops-work-14"
    p = client.get("/api/v1/catalog/products/" + slug).json()
    assert p["specifications"]["Memory"] == "16 GB"
    assert all(p[k] for k in ["care", "faqs", "in_box", "compatibility", "warranty", "returns"])
    assert client.get("/api/v1/catalog/selection?slug=" + slug).json()[0]["sku"] == p["sku"]
    q = client.post(
        "/api/v1/catalog/basket/quote",
        json={"items": [{"slug": slug, "quantity": 2, "price_paisa": 1}]},
    ).json()
    assert q["subtotal_paisa"] == p["price_paisa"] * 2 and q["simulation"] is True
    assert client.get("/api/v1/catalog/products/" + slug).json()["stock"] == p["stock"]


@pytest.mark.parametrize(
    "path",
    [
        "/products?page=0",
        "/products?page_size=25",
        "/products?sort=sql",
        "/products?min_price=200&max_price=100",
        "/products?query=" + "a" * 121,
        "/selection?" + "&".join("slug=x" for _ in range(21)),
    ],
)
def test_bounds(catalog, path):
    client, _ = catalog
    assert client.get("/api/v1/catalog" + path).status_code == 422


def test_basket_validation_and_stock(catalog):
    client, _ = catalog
    for items in [
        [{"slug": "x", "quantity": 6}],
        [{"slug": "x", "quantity": 1.5}],
        [{"slug": "x", "quantity": 1}, {"slug": "x", "quantity": 1}],
    ]:
        assert client.post("/api/v1/catalog/basket/quote", json={"items": items}).status_code == 422
    assert (
        client.post(
            "/api/v1/catalog/basket/quote", json={"items": [{"slug": "missing", "quantity": 1}]}
        ).status_code
        == 409
    )
    q = client.post(
        "/api/v1/catalog/basket/quote",
        json={"items": [{"slug": "refrigerators-compact-180", "quantity": 1}]},
    ).json()
    assert q["purchasable"] is False and q["lines"][0]["available"] is False


def test_public_boundaries_and_export(catalog):
    client, engine = catalog
    with Session(engine) as db:
        rows = list(documents(db))
        assert len(rows) == 396 and len({r["document_id"] for r in rows}) == 396
        p = db.scalar(select(Product).where(Product.slug == "laptops-work-14"))
        p.published = False
        db.commit()
        assert not any(r["source_url"] == "/products/laptops-work-14" for r in documents(db))
    assert client.get("/api/v1/catalog/products/laptops-work-14").status_code == 404
    assert client.get("/api/v1/catalog/selection?slug=laptops-work-14").status_code == 404
    results = client.get("/api/v1/catalog/products?query=work+14").json()["items"]
    assert all(p["slug"] != "laptops-work-14" for p in results)
    assert client.get("/api/v1/catalog/products?query=%25_%25").json()["total"] == 0
    with Session(engine) as db:
        p = db.scalar(select(Product).where(Product.slug == "laptops-work-14"))
        p.published = True
        db.commit()
