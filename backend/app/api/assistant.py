import logging
import time
from collections import OrderedDict, deque
from threading import Lock, Semaphore
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.assistant import prompt, retrieve
from app.services.ollama import ProviderError, generate

router = APIRouter(prefix="/api/v1/assistant", tags=["assistant"])
logger = logging.getLogger("aegis.assistant")
slot = Semaphore(1)
lock = Lock()
visits: OrderedDict[str, deque] = OrderedDict()


def rate_limit(request: Request):
    key = request.client.host if request.client else "unknown"
    now = time.monotonic()
    with lock:
        bucket = visits.setdefault(key, deque())
        visits.move_to_end(key)
        while bucket and bucket[0] <= now - 60:
            bucket.popleft()
        if len(bucket) >= 10:
            raise HTTPException(429, "Please wait a minute before sending more questions.")
        bucket.append(now)
        while len(visits) > 1024:
            visits.popitem(last=False)


@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(rate_limit)])
def chat(payload: ChatRequest, request: Request, db: Annotated[Session, Depends(get_db)]):
    if not slot.acquire(blocking=False):
        raise HTTPException(
            429, "The assistant is answering another question. Please try again shortly."
        )
    started = time.monotonic()
    try:
        sources = retrieve(db, payload)
        db.close()  # Release the database connection before local inference.
        if not sources:
            answer = (
                "I couldn’t find that in our catalog or Help Center. "
                "Try a product name, department, or a specific setup or care question."
            )
            generated = False
        else:
            answer = generate(prompt(payload, sources))
            generated = True
        logger.info(
            "chat request_id=%s model=%s sources=%d generated=%s elapsed_ms=%d",
            request.state.request_id,
            settings.ollama_model,
            len(sources),
            generated,
            (time.monotonic() - started) * 1000,
        )
        return ChatResponse(
            answer=answer,
            sources=sources,
            model=settings.ollama_model,
            generated=generated,
            request_id=request.state.request_id,
        )
    except ProviderError as exc:
        raise HTTPException(exc.status, exc.message) from exc
    finally:
        slot.release()
