"""Server-only Ollama adapter. No model-selected tools, URLs or database access."""

import json

import httpx

from app.core.config import settings


class ProviderError(Exception):
    def __init__(self, message: str, status: int = 503):
        self.message = message
        self.status = status


def generate(messages: list[dict[str, str]]) -> str:
    try:
        with httpx.Client(
            base_url=settings.ollama_base_url.rstrip("/"),
            timeout=httpx.Timeout(settings.ollama_timeout_seconds, connect=5),
            trust_env=False,
        ) as client:
            with client.stream(
                "POST",
                "/api/chat",
                json={
                    "model": settings.ollama_model,
                    "messages": messages,
                    "stream": False,
                    "keep_alive": "5m",
                    "options": {
                        "temperature": 0,
                        "num_predict": 120,
                        "num_ctx": 4096,
                        "repeat_penalty": 1.2,
                        "repeat_last_n": 128,
                    },
                },
            ) as response:
                if response.status_code == 404:
                    raise ProviderError("The assistant model is not installed on the server.")
                if response.status_code != 200:
                    raise ProviderError("The local assistant could not respond. Please try again.")
                raw = bytearray()
                for chunk in response.iter_bytes():
                    raw.extend(chunk)
                    if len(raw) > 65536:
                        raise ProviderError("The assistant returned an invalid response.", 502)
        data = json.loads(raw)
        answer = data["message"]["content"]
        if not isinstance(answer, str) or not answer.strip() or data.get("done") is not True:
            raise ValueError("Incomplete response")
        return answer.strip()[:1200]
    except httpx.TimeoutException as exc:
        raise ProviderError(
            "The assistant took too long. Please try a shorter question.", 504
        ) from exc
    except httpx.RequestError as exc:
        raise ProviderError("The local assistant is offline. Please try again later.") from exc
    except (ValueError, KeyError, TypeError) as exc:
        raise ProviderError(
            "The assistant returned an invalid response. Please try again.", 502
        ) from exc
