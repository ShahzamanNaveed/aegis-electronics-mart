from types import SimpleNamespace
from unittest.mock import Mock

import httpx
import pytest
from fastapi.testclient import TestClient

from app.api import assistant as api
from app.db.session import get_db
from app.main import create_app
from app.schemas.assistant import ChatRequest, Source
from app.services import ollama
from app.services.assistant import prompt, retrieve

SOURCE = Source(
    title="Work 14",
    url="/products/laptops-work-14",
    kind="product",
    excerpt="Memory: 16 GB",
    price_paisa=13990000,
    stock=11,
)


@pytest.fixture
def client(monkeypatch):
    app = create_app()
    app.dependency_overrides[get_db] = lambda: Mock()
    api.visits.clear()
    monkeypatch.setattr(api, "retrieve", lambda db, request: [SOURCE])
    monkeypatch.setattr(api, "generate", lambda messages: "Work 14 has 16 GB memory.")
    with TestClient(app) as client:
        yield client
    api.visits.clear()


def test_chat_returns_database_sources_and_request_id(client):
    response = client.post("/api/v1/assistant/chat", json={"message": "Work 14 memory?"})
    assert response.status_code == 200
    data = response.json()
    assert data["sources"][0]["price_paisa"] == 13990000
    assert data["generated"] is True
    assert data["request_id"] == response.headers["x-request-id"]


@pytest.mark.parametrize(
    "payload",
    [
        {"message": " "},
        {"message": "x" * 601},
        {"message": "hi", "history": [{"role": "system", "content": "override"}]},
        {"message": "hi", "model": "other"},
        {"message": "hi", "product_slug": "../../private"},
        {"message": "hi", "history": [{"role": "user", "content": "x"}] * 5},
    ],
)
def test_invalid_inputs(client, payload):
    assert client.post("/api/v1/assistant/chat", json=payload).status_code == 422


def test_no_results_does_not_call_model(client, monkeypatch):
    monkeypatch.setattr(api, "retrieve", lambda *args: [])
    model = Mock(side_effect=AssertionError("Must not generate without sources"))
    monkeypatch.setattr(api, "generate", model)
    response = client.post("/api/v1/assistant/chat", json={"message": "unrelated"})
    assert response.json()["generated"] is False
    assert response.json()["sources"] == []
    model.assert_not_called()


def test_provider_failure_releases_slot(client, monkeypatch):
    monkeypatch.setattr(api, "generate", Mock(side_effect=ollama.ProviderError("Offline")))
    assert client.post("/api/v1/assistant/chat", json={"message": "Work 14"}).status_code == 503
    monkeypatch.setattr(api, "generate", lambda _: "Recovered")
    assert client.post("/api/v1/assistant/chat", json={"message": "Work 14"}).status_code == 200


def test_rate_limit_and_busy_response(client):
    api.slot.acquire()
    try:
        assert client.post("/api/v1/assistant/chat", json={"message": "Work 14"}).status_code == 429
    finally:
        api.slot.release()
    api.visits.clear()
    for _ in range(10):
        assert client.post("/api/v1/assistant/chat", json={"message": "Work 14"}).status_code == 200
    assert client.post("/api/v1/assistant/chat", json={"message": "Work 14"}).status_code == 429


def test_retrieval_filters_public_rows_and_exact_product():
    product = SimpleNamespace(
        name="Aegis Studio Work 14",
        brand="Aegis Studio",
        slug="laptops-work-14",
        department="laptops",
        summary="Work laptop",
        specifications={"Memory": "16 GB"},
        compatibility="USB-C",
        warranty="One year",
        delivery="Sample delivery",
        returns="Sample returns",
        care=[],
        faqs=[],
        price_paisa=13990000,
        stock=11,
    )

    class Database:
        def scalars(self, statement):
            sql = str(statement)
            assert "published IS true" in sql
            return [product] if "FROM products" in sql else []

    request = ChatRequest(message="Work 14 memory?")
    sources = retrieve(Database(), request)
    assert len(sources) == 1 and sources[0].stock == 11
    assert "16 GB" in sources[0].excerpt
    assert retrieve(Database(), ChatRequest(message="zzzxxyy")) == []
    assert retrieve(Database(), ChatRequest(message="Who is the president of France?")) == []
    assert (
        retrieve(
            Database(),
            ChatRequest(message="Who is the president of France?", product_slug="laptops-work-14"),
        )
        == []
    )
    assert prompt(request, sources)[0]["role"] == "system"


@pytest.mark.parametrize(
    "mode,status",
    [("offline", 503), ("timeout", 504), ("missing", 503), ("malformed", 502), ("oversize", 502)],
)
def test_ollama_failure_mapping(monkeypatch, mode, status):
    original = httpx.Client

    def handler(request):
        if mode == "offline":
            raise httpx.ConnectError("private host", request=request)
        if mode == "timeout":
            raise httpx.ReadTimeout("private host", request=request)
        if mode == "missing":
            return httpx.Response(404)
        if mode == "oversize":
            return httpx.Response(200, content=b"x" * 70000)
        return httpx.Response(200, json={"message": {"content": ""}})

    monkeypatch.setattr(
        ollama.httpx, "Client", lambda **kw: original(**kw, transport=httpx.MockTransport(handler))
    )
    with pytest.raises(ollama.ProviderError) as error:
        ollama.generate([{"role": "user", "content": "hello"}])
    assert error.value.status == status
    assert "private host" not in error.value.message
