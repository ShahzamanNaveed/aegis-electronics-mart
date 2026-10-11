import certifi
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


def build_engine(url: str):
    parsed = make_url(url)
    if parsed.drivername not in {"postgres", "postgresql", "postgresql+psycopg"}:
        raise ValueError("Aegis requires PostgreSQL with the psycopg driver.")
    parsed = parsed.set(drivername="postgresql+psycopg")
    if parsed.host and parsed.host.endswith(".neon.tech"):
        parsed = parsed.update_query_dict(
            {"sslmode": "verify-full", "sslrootcert": certifi.where()}
        )
    return create_engine(
        parsed,
        hide_parameters=True,
        pool_pre_ping=True,
        pool_size=3,
        max_overflow=2,
        pool_timeout=15,
        pool_recycle=300,
        connect_args={"connect_timeout": 15, "prepare_threshold": None},
    )


engine = build_engine(settings.resolved_database_url)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db():
    with SessionLocal() as session:
        yield session
