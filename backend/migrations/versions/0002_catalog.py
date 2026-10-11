"""Independent retail catalog; preserves all existing help content."""

import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "departments",
        sa.Column("slug", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.String(300), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
    )
    op.create_table(
        "products",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("slug", sa.String(120), unique=True, nullable=False),
        sa.Column("sku", sa.String(32), unique=True, nullable=False),
        sa.Column("department", sa.String(64), sa.ForeignKey("departments.slug"), nullable=False),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("brand", sa.String(80), nullable=False),
        sa.Column("summary", sa.String(350), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price_paisa", sa.Integer(), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False),
        sa.Column("color", sa.String(40), nullable=False),
        *[
            sa.Column(name, sa.JSON(), nullable=False)
            for name in ["features", "specifications", "in_box", "care", "faqs", "help_slugs"]
        ],
        *[
            sa.Column(name, sa.Text(), nullable=False)
            for name in ["compatibility", "warranty", "delivery", "returns", "search_text"]
        ],
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("featured_order", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("price_paisa >= 0", name="product_price_nonnegative"),
        sa.CheckConstraint("stock >= 0", name="product_stock_nonnegative"),
    )
    for column in ("department", "brand", "published"):
        op.create_index(f"ix_products_{column}", "products", [column])


def downgrade():
    op.drop_table("products")
    op.drop_table("departments")
