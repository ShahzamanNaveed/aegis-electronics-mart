"""Insert missing catalog records without overwriting local edits."""

import json
from datetime import UTC, datetime
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Department, Product


def seed_catalog(db: Session):
    source = Path(__file__).resolve().parents[2] / "fixtures" / "catalog.json"
    data = json.loads(source.read_text(encoding="utf-8"))
    counts = {"departments": 0, "products": 0}
    for index, item in enumerate(data["departments"]):
        if not db.get(Department, item["slug"]):
            db.add(Department(**item, sort_order=index))
            counts["departments"] += 1
    db.flush()
    for item in data["products"]:
        if db.scalar(select(Product.id).where(Product.slug == item["slug"])):
            continue
        searchable = [
            item["name"],
            item["brand"],
            item["sku"],
            item["department"],
            item["summary"],
            item["description"],
            item["color"],
            *item["features"],
            *item["specifications"].keys(),
            *item["specifications"].values(),
        ]
        db.add(
            Product(
                **item,
                id=str(uuid5(NAMESPACE_URL, "aegis/product/" + item["slug"])),
                search_text=" ".join(searchable).casefold(),
                updated_at=datetime(2026, 10, 10, tzinfo=UTC),
            )
        )
        counts["products"] += 1
    db.commit()
    return counts
