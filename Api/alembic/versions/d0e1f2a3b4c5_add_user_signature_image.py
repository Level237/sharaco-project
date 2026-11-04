"""add user signature image

Revision ID: d0e1f2a3b4c5
Revises: c8d9e0f1a2b3
Create Date: 2026-11-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d0e1f2a3b4c5"
down_revision: Union[str, Sequence[str], None] = "c8d9e0f1a2b3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user",
        sa.Column("signature_image", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("user", "signature_image")
