import math
import re

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Article, Category
from app.schemas.help import ArticleDetail, ArticlePage, ArticleSummary, CategoryOut


def summary(article: Article, category: Category) -> ArticleSummary:
    return ArticleSummary(
        id=article.id,
        slug=article.slug,
        title=article.title,
        excerpt=article.excerpt,
        topic=article.topic,
        category_slug=category.slug,
        category_name=category.name,
        reading_minutes=article.reading_minutes,
        updated_at=article.updated_at,
    )


def get_categories(db: Session) -> list[CategoryOut]:
    counts = (
        select(Article.category_id, func.count(Article.id).label("count"))
        .where(Article.published.is_(True))
        .group_by(Article.category_id)
        .subquery()
    )
    rows = db.execute(
        select(Category, func.coalesce(counts.c.count, 0))
        .outerjoin(counts, Category.id == counts.c.category_id)
        .order_by(Category.sort_order, Category.slug)
    )
    return [
        CategoryOut(
            id=c.id, slug=c.slug, name=c.name, description=c.description, article_count=count
        )
        for c, count in rows
    ]


def list_articles(
    db: Session, query: str, category: str | None, topic: str | None, page: int, page_size: int
) -> ArticlePage:
    statement = select(Article, Category).join(Category).where(Article.published.is_(True))
    if category:
        if not db.scalar(select(Category.id).where(Category.slug == category)):
            raise HTTPException(404, "Help category not found.")
        statement = statement.where(Category.slug == category)
    if topic:
        statement = statement.where(Article.topic == topic)
    # AND across words; punctuation is a literal separator, never executable query syntax.
    for word in re.findall(r"\w+", query.casefold(), flags=re.UNICODE):
        statement = statement.where(func.lower(Article.search_text).contains(word, autoescape=True))
    if query.strip() and not re.search(r"\w", query, re.UNICODE):
        return ArticlePage(items=[], total=0, page=page, page_size=page_size, pages=0)
    total = db.scalar(select(func.count()).select_from(statement.subquery())) or 0
    rows = db.execute(
        statement.order_by(Article.featured_order, Article.title, Article.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return ArticlePage(
        items=[summary(a, c) for a, c in rows],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size),
    )


def get_article(db: Session, slug: str) -> ArticleDetail:
    row = db.execute(
        select(Article, Category)
        .join(Category)
        .where(Article.slug == slug, Article.published.is_(True))
    ).first()
    if row is None:
        raise HTTPException(404, "This guide could not be found.")
    article, category = row
    related = db.execute(
        select(Article, Category)
        .join(Category)
        .where(Article.published.is_(True), Article.id != article.id)
        .order_by(
            (Article.category_id == article.category_id).desc(),
            (Article.topic == article.topic).desc(),
            Article.featured_order,
            Article.id,
        )
        .limit(3)
    )
    return ArticleDetail(
        **summary(article, category).model_dump(),
        sections=article.sections,
        related=[summary(a, c) for a, c in related],
    )
