"""Idempotent public-content seed. Never deletes or overwrites edited articles."""

import json
import math
from datetime import UTC, datetime
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Article, Category
from app.db.session import SessionLocal

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures" / "public-help.json"


def seed(db: Session) -> dict[str, int]:
    data = json.loads(FIXTURES.read_text(encoding="utf-8"))
    added = {"categories": 0, "articles": 0}
    categories = {}
    for position, item in enumerate(data["categories"]):
        category = db.scalar(select(Category).where(Category.slug == item["slug"]))
        if category is None:
            category = Category(
                id=str(uuid5(NAMESPACE_URL, f"aegis/category/{item['slug']}")),
                sort_order=position,
                **item,
            )
            db.add(category)
            added["categories"] += 1
        categories[category.slug] = category
    db.flush()
    for position, item in enumerate(data["articles"]):
        if db.scalar(select(Article.id).where(Article.slug == item["slug"])):
            continue
        item = dict(item)
        category = categories[item.pop("category")]
        parts = [item["title"], item["excerpt"], category.name, item["topic"]]
        for section in item["sections"]:
            parts.extend(
                [
                    section["heading"],
                    *section.get("paragraphs", []),
                    *section.get("bullets", []),
                    section.get("note", ""),
                ]
            )
        full_text = " ".join(parts)
        db.add(
            Article(
                id=str(uuid5(NAMESPACE_URL, f"aegis/article/{item['slug']}")),
                category_id=category.id,
                search_text=full_text.casefold(),
                reading_minutes=max(1, math.ceil(len(full_text.split()) / 180)),
                published=True,
                featured_order=position,
                updated_at=datetime(2026, 10, 10, tzinfo=UTC),
                **item,
            )
        )
        added["articles"] += 1
    db.commit()
    return added


if __name__ == "__main__":
    from app.catalog_seed import seed_catalog

    with SessionLocal() as session:
        print(json.dumps({**seed(session), **seed_catalog(session)}))
