"""make carte iframe_url nullable

Revision ID: b7c9d1e3f5a7
Revises: 2975f1ba6d4f
Create Date: 2026-01-12

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "b7c9d1e3f5a7"
down_revision = "2975f1ba6d4f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "cartes",
        "iframe_url",
        existing_type=sa.String(),
        nullable=True,
    )


def downgrade() -> None:
    # Best-effort: if NULLs exist, this will fail. Caller should fix data first.
    op.alter_column(
        "cartes",
        "iframe_url",
        existing_type=sa.String(),
        nullable=False,
    )
