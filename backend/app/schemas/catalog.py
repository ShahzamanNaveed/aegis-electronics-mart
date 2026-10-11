from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DepartmentOut(BaseModel):
    slug: str
    name: str
    description: str
    product_count: int


class ProductSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    slug: str
    sku: str
    department: str
    name: str
    brand: str
    summary: str
    price_paisa: int
    stock: int
    color: str
    features: list[str]


class ProductDetail(ProductSummary):
    description: str
    specifications: dict[str, str]
    in_box: list[str]
    compatibility: str
    care: list[str]
    faqs: list[dict[str, str]]
    warranty: str
    delivery: str
    returns: str
    help_slugs: list[str]
    updated_at: datetime


class ProductPage(BaseModel):
    items: list[ProductSummary]
    total: int
    page: int
    pages: int
    page_size: int


class BasketItem(BaseModel):
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9-]+$")
    quantity: int = Field(ge=1, le=5, strict=True)


class BasketRequest(BaseModel):
    items: list[BasketItem] = Field(max_length=20)


class QuoteLine(BaseModel):
    product: ProductSummary
    quantity: int
    line_total_paisa: int
    available: bool


class BasketQuote(BaseModel):
    lines: list[QuoteLine]
    subtotal_paisa: int
    currency: str = "PKR"
    purchasable: bool
    simulation: bool = True
