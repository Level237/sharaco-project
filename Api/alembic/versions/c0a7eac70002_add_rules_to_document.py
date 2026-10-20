"""add_rules_to_document

Revision ID: c0a7eac70002
Revises: c0a7eac70001
Create Date: 2026-10-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c0a7eac70002"
down_revision: Union[str, Sequence[str], None] = "c0a7eac70001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("document", sa.Column("rules", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("document", "rules")
