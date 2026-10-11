"""Export only explicitly published content for future retrieval experiments."""

import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Article, Product
from app.db.session import SessionLocal


def documents(db: Session):
    for p in db.scalars(select(Product).where(Product.published.is_(True)).order_by(Product.slug)):
        sections = {
            "overview": p.description,
            "specifications": "\n".join(f"{k}: {v}" for k, v in p.specifications.items()),
            "pricing-and-availability": f"Synthetic price: PKR {p.price_paisa / 100:.2f}. "
            f"Sample inventory: {p.stock}. Color: {p.color}. "
            "Export-time snapshot, not a reservation.",
            "compatibility-and-box": p.compatibility + "\nIn the box: " + "; ".join(p.in_box),
            "policies": "\n".join([p.delivery, p.warranty, p.returns]),
            "care-and-faq": "\n".join(
                p.care + [f"Q: {f['question']} A: {f['answer']}" for f in p.faqs]
            ),
        }
        for section, body in sections.items():
            yield {
                "document_id": f"product:{p.sku}:{section}",
                "source_type": "public_product",
                "visibility": "public",
                "synthetic": True,
                "dataset_version": "mart-1.0",
                "title": p.name,
                "source_url": "/products/" + p.slug,
                "section": section,
                "updated_at": p.updated_at.isoformat(),
                "text": body,
            }
    for a in db.scalars(select(Article).where(Article.published.is_(True)).order_by(Article.slug)):
        for index, s in enumerate(a.sections):
            yield {
                "document_id": f"help:{a.slug}:{index}",
                "source_type": "public_help",
                "visibility": "public",
                "synthetic": True,
                "dataset_version": "mart-1.0",
                "title": a.title,
                "source_url": "/help/articles/" + a.slug,
                "section": s["heading"],
                "updated_at": a.updated_at.isoformat(),
                "text": "\n".join(
                    [*s.get("paragraphs", []), *s.get("bullets", []), s.get("note", "")]
                ),
            }


if __name__ == "__main__":
    target = Path(__file__).resolve().parents[2] / "fixtures" / "public-corpus.jsonl"
    with SessionLocal() as db:
        rows = list(documents(db))
    target.write_text(
        "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows), encoding="utf-8"
    )
    print(f"Exported {len(rows)} public sections to {target.name}.")
