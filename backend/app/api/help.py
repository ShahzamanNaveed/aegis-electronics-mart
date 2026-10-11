from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.help import ArticleDetail, ArticlePage, CategoryOut, Topic
from app.services import help as service

router = APIRouter(prefix="/api/v1")
DB = Annotated[Session, Depends(get_db)]


@router.get("/health", tags=["operations"])
def health():
    return {"status": "ok", "service": "aegis-support", "version": "0.1.0"}


@router.get("/ready", tags=["operations"])
def ready(db: DB):
    # A connection alone is insufficient: require the migrated content tables as well.
    db.execute(text("SELECT id FROM articles LIMIT 1"))
    db.execute(text("SELECT id FROM help_categories LIMIT 1"))
    db.execute(text("SELECT id FROM products LIMIT 1"))
    db.execute(text("SELECT slug FROM departments LIMIT 1"))
    return {"status": "ready"}


@router.get("/help/categories", response_model=list[CategoryOut], tags=["help"])
def categories(db: DB):
    return service.get_categories(db)


@router.get("/help/articles", response_model=ArticlePage, tags=["help"])
def articles(
    db: DB,
    query: Annotated[str, Query(max_length=120)] = "",
    category: Annotated[str | None, Query(max_length=64, pattern=r"^[a-z0-9-]+$")] = None,
    topic: Topic | None = None,
    page: Annotated[int, Query(ge=1, le=10000)] = 1,
    page_size: Annotated[int, Query(ge=1, le=24)] = 6,
):
    return service.list_articles(db, query.strip(), category, topic, page, page_size)


@router.get("/help/articles/{slug}", response_model=ArticleDetail, tags=["help"])
def article(slug: str, db: DB):
    return service.get_article(db, slug)
