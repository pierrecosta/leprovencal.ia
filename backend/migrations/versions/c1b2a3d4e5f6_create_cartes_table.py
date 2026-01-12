"""Create cartes table

Revision ID: c1b2a3d4e5f6
Revises: f4dcfe6f4d32
Create Date: 2026-01-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1b2a3d4e5f6'
down_revision: Union[str, None] = 'f4dcfe6f4d32'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'cartes',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('titre', sa.String(length=120), nullable=False),
        sa.Column('iframe_url', sa.String(length=500), nullable=False),
        sa.Column('legende', sa.String(length=200), nullable=True),
    )
    op.create_index(op.f('ix_cartes_id'), 'cartes', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_cartes_id'), table_name='cartes')
    op.drop_table('cartes')
