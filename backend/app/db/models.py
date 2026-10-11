from datetime import datetime

from sqlalchemy import JSON, Boolean, CheckConstraint, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Category(Base):
    __tablename__ = "help_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(300))
    sort_order: Mapped[int] = mapped_column(Integer)


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("help_categories.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    excerpt: Mapped[str] = mapped_column(String(350))
    topic: Mapped[str] = mapped_column(String(40), index=True)
    sections: Mapped[list[dict]] = mapped_column(JSON)
    search_text: Mapped[str] = mapped_column(Text)
    reading_minutes: Mapped[int] = mapped_column(Integer)
    published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    featured_order: Mapped[int] = mapped_column(Integer, default=100)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class Department(Base):
    __tablename__ = "departments"
    slug: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(300))
    sort_order: Mapped[int] = mapped_column(Integer)


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price_paisa >= 0", name="product_price_nonnegative"),
        CheckConstraint("stock >= 0", name="product_stock_nonnegative"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    sku: Mapped[str] = mapped_column(String(32), unique=True)
    department: Mapped[str] = mapped_column(ForeignKey("departments.slug"), index=True)
    name: Mapped[str] = mapped_column(String(180))
    brand: Mapped[str] = mapped_column(String(80), index=True)
    summary: Mapped[str] = mapped_column(String(350))
    description: Mapped[str] = mapped_column(Text)
    price_paisa: Mapped[int] = mapped_column(Integer)
    stock: Mapped[int] = mapped_column(Integer)
    color: Mapped[str] = mapped_column(String(40))
    features: Mapped[list[str]] = mapped_column(JSON)
    specifications: Mapped[dict[str, str]] = mapped_column(JSON)
    in_box: Mapped[list[str]] = mapped_column(JSON)
    compatibility: Mapped[str] = mapped_column(Text)
    care: Mapped[list[str]] = mapped_column(JSON)
    faqs: Mapped[list[dict[str, str]]] = mapped_column(JSON)
    warranty: Mapped[str] = mapped_column(Text)
    delivery: Mapped[str] = mapped_column(Text)
    returns: Mapped[str] = mapped_column(Text)
    help_slugs: Mapped[list[str]] = mapped_column(JSON)
    published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    featured_order: Mapped[int] = mapped_column(Integer)
    search_text: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
