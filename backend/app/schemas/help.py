from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Topic = Literal["delivery", "returns", "warranty", "care", "setup"]


class CategoryOut(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    article_count: int


class SectionOut(BaseModel):
    heading: str
    paragraphs: list[str] = Field(default_factory=list)
    bullets: list[str] = Field(default_factory=list)
    note: str | None = None


class ArticleSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    title: str
    excerpt: str
    topic: Topic
    category_slug: str
    category_name: str
    reading_minutes: int
    updated_at: datetime


class ArticlePage(BaseModel):
    items: list[ArticleSummary]
    total: int
    page: int
    page_size: int
    pages: int


class ArticleDetail(ArticleSummary):
    sections: list[SectionOut]
    related: list[ArticleSummary]
