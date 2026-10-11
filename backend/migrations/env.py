from alembic import context

from app.core.config import settings
from app.db.models import Base
from app.db.session import build_engine

config = context.config
url = config.attributes.get("database_url") or (
    settings.migration_database_url or settings.resolved_database_url
)

if context.is_offline_mode():
    context.configure(url=url, target_metadata=Base.metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    engine = build_engine(url)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()
