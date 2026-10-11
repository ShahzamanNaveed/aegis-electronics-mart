import math
import re
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Department, Product
from app.db.session import get_db
from app.schemas.catalog import (
    BasketQuote,
    BasketRequest,
    DepartmentOut,
    ProductDetail,
    ProductPage,
    ProductSummary,
    QuoteLine,
)

router = APIRouter(prefix="/api/v1/catalog", tags=["catalog"])
DB = Annotated[Session, Depends(get_db)]


@router.get("/departments", response_model=list[DepartmentOut])
def departments(db: DB):
    counts = (
        select(Product.department, func.count().label("count"))
        .where(Product.published.is_(True))
        .group_by(Product.department)
        .subquery()
    )
    rows = db.execute(
        select(Department, func.coalesce(counts.c.count, 0))
        .outerjoin(counts, Department.slug == counts.c.department)
        .order_by(Department.sort_order)
    ).all()
    return [
        DepartmentOut(slug=d.slug, name=d.name, description=d.description, product_count=count)
        for d, count in rows
    ]


@router.get("/products", response_model=ProductPage)
def products(
    db: DB,
    query: Annotated[str, Query(max_length=120)] = "",
    department: Annotated[str | None, Query(max_length=64)] = None,
    brand: Annotated[str | None, Query(max_length=80)] = None,
    min_price: Annotated[int | None, Query(ge=0, le=100000000)] = None,
    max_price: Annotated[int | None, Query(ge=0, le=100000000)] = None,
    in_stock: bool = False,
    sort: Literal["featured", "price-asc", "price-desc", "name"] = "featured",
    page: Annotated[int, Query(ge=1, le=10000)] = 1,
    page_size: Annotated[int, Query(ge=1, le=24)] = 12,
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(422, "Minimum price cannot exceed maximum price.")
    statement = select(Product).where(Product.published.is_(True))
    if department:
        if not db.get(Department, department):
            raise HTTPException(404, "Department not found.")
        statement = statement.where(Product.department == department)
    if brand:
        statement = statement.where(Product.brand == brand)
    if in_stock:
        statement = statement.where(Product.stock > 0)
    if min_price is not None:
        statement = statement.where(Product.price_paisa >= min_price)
    if max_price is not None:
        statement = statement.where(Product.price_paisa <= max_price)
    words = re.findall(r"\w+", query.casefold(), re.UNICODE)
    if query.strip() and not words:
        statement = statement.where(False)
    for word in words:
        statement = statement.where(Product.search_text.contains(word, autoescape=True))
    total = db.scalar(select(func.count()).select_from(statement.subquery())) or 0
    order = {
        "featured": Product.featured_order,
        "price-asc": Product.price_paisa,
        "price-desc": Product.price_paisa.desc(),
        "name": Product.name,
    }[sort]
    items = db.scalars(
        statement.order_by(order, Product.id).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return ProductPage(
        items=[ProductSummary.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size),
    )


@router.get("/brands", response_model=list[str])
def brands(db: DB):
    return db.scalars(
        select(Product.brand).where(Product.published.is_(True)).distinct().order_by(Product.brand)
    ).all()


@router.get("/selection", response_model=list[ProductDetail])
def selection(db: DB, slug: Annotated[list[str], Query(max_length=20)]):
    if any(len(s) > 120 for s in slug):
        raise HTTPException(422, "Invalid product identifier.")
    found = db.scalars(
        select(Product).where(Product.published.is_(True), Product.slug.in_(slug))
    ).all()
    lookup = {p.slug: p for p in found}
    if any(s not in lookup for s in slug):
        raise HTTPException(404, "One or more products are unavailable.")
    return [ProductDetail.model_validate(lookup[s]) for s in dict.fromkeys(slug)]


@router.get("/products/{slug}", response_model=ProductDetail)
def product(slug: str, db: DB):
    found = db.scalar(select(Product).where(Product.slug == slug, Product.published.is_(True)))
    if found is None:
        raise HTTPException(404, "Product not found.")
    return ProductDetail.model_validate(found)


@router.post("/basket/quote", response_model=BasketQuote)
def quote(body: BasketRequest, db: DB):
    slugs = [item.slug for item in body.items]
    if len(slugs) != len(set(slugs)):
        raise HTTPException(422, "Combine duplicate basket items.")
    products = db.scalars(
        select(Product).where(Product.slug.in_(slugs), Product.published.is_(True))
    ).all()
    lookup = {p.slug: p for p in products}
    if any(s not in lookup for s in slugs):
        raise HTTPException(409, "A product is no longer available. Remove it from your basket.")
    lines = [
        QuoteLine(
            product=ProductSummary.model_validate(lookup[item.slug]),
            quantity=item.quantity,
            line_total_paisa=lookup[item.slug].price_paisa * item.quantity,
            available=lookup[item.slug].stock >= item.quantity,
        )
        for item in body.items
    ]
    return BasketQuote(
        lines=lines,
        subtotal_paisa=sum(line.line_total_paisa for line in lines),
        purchasable=bool(lines) and all(line.available for line in lines),
    )
