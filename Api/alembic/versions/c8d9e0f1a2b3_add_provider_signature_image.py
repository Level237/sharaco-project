"""add provider signature image

Revision ID: c8d9e0f1a2b3
Revises: b4c5d6e7f8a9
Create Date: 2026-11-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c8d9e0f1a2b3"
down_revision: Union[str, Sequence[str], None] = "b4c5d6e7f8a9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "document",
        sa.Column("provider_signature_image", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("document", "provider_signature_image")
