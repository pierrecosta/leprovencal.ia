"""add_date_ajout_to_articles

Revision ID: 5f2231d7d1d3
Revises: b7c9d1e3f5a7
Create Date: 2026-01-15 13:23:37.270877

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '5f2231d7d1d3'
down_revision: Union[str, None] = 'b7c9d1e3f5a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add date_ajout column to articles table
    op.add_column('articles', sa.Column('date_ajout', sa.Date(), nullable=True))
    
    # Set default value for existing articles to 2026-01-01
    conn = op.get_bind()
    conn.execute(text("UPDATE articles SET date_ajout = '2026-01-01' WHERE date_ajout IS NULL"))
    
    # Make the column not nullable after backfilling
    op.alter_column('articles', 'date_ajout', nullable=False)


def downgrade() -> None:
    op.drop_column('articles', 'date_ajout')
