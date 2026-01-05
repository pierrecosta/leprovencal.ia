"""New changes

Revision ID: f050446ac691
Revises: 96b660cb76c9
Create Date: 2025-12-18 14:42:07.323064

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'f050446ac691'
down_revision: Union[str, None] = '96b660cb76c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Pré-nettoyage (évite échec si données existantes contiennent NULL)
    conn = op.get_bind()
    conn.execute(text("UPDATE articles SET titre = 'Sans titre' WHERE titre IS NULL"))
    conn.execute(text("UPDATE dictionnaire SET mots_francais = 'Inconnu' WHERE mots_francais IS NULL"))
    conn.execute(text("UPDATE histoires SET titre = 'Sans titre' WHERE titre IS NULL"))
    conn.execute(text("UPDATE histoires SET typologie = 'Inconnue' WHERE typologie IS NULL"))
    conn.execute(text("UPDATE histoires SET periode = 'Inconnue' WHERE periode IS NULL"))

    op.alter_column(
        "articles",
        "titre",
        existing_type=sa.String(length=100),
        nullable=False,
    )

    op.alter_column(
        "dictionnaire",
        "mots_francais",
        existing_type=sa.String(length=200),
        nullable=False,
    )

    op.alter_column(
        "histoires",
        "titre",
        existing_type=sa.String(length=100),
        nullable=False,
    )
    op.alter_column(
        "histoires",
        "typologie",
        existing_type=sa.String(length=30),
        nullable=False,
    )
    op.alter_column(
        "histoires",
        "periode",
        existing_type=sa.String(length=30),
        nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "histoires",
        "periode",
        existing_type=sa.String(length=30),
        nullable=True,
    )
    op.alter_column(
        "histoires",
        "typologie",
        existing_type=sa.String(length=30),
        nullable=True,
    )
    op.alter_column(
        "histoires",
        "titre",
        existing_type=sa.String(length=100),
        nullable=True,
    )

    op.alter_column(
        "dictionnaire",
        "mots_francais",
        existing_type=sa.String(length=200),
        nullable=True,
    )

    op.alter_column(
        "articles",
        "titre",
        existing_type=sa.String(length=100),
        nullable=True,
    )
