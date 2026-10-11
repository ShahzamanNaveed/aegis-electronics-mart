"""Public help categories and versioned article content."""

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "help_categories",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("slug", sa.String(64), nullable=False, unique=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.String(300), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
    )
    op.create_table(
        "articles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column(
            "category_id", sa.String(36), sa.ForeignKey("help_categories.id"), nullable=False
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("excerpt", sa.String(350), nullable=False),
        sa.Column("topic", sa.String(40), nullable=False),
        sa.Column("sections", sa.JSON(), nullable=False),
        sa.Column("search_text", sa.Text(), nullable=False),
        sa.Column("reading_minutes", sa.Integer(), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("featured_order", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    for column in ("category_id", "topic", "published"):
        op.create_index(f"ix_articles_{column}", "articles", [column])


def downgrade():
    op.drop_table("articles")
    op.drop_table("help_categories")
