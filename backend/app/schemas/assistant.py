from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ChatTurn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=1200)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    message: str = Field(min_length=1, max_length=600)
    history: list[ChatTurn] = Field(default_factory=list, max_length=4)
    product_slug: str | None = Field(default=None, max_length=120, pattern=r"^[a-z0-9-]+$")


class Source(BaseModel):
    title: str
    url: str
    kind: Literal["product", "help"]
    excerpt: str
    price_paisa: int | None = None
    stock: int | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    model: str
    generated: bool
    request_id: str
