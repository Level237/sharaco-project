"""add provider signature fields

Revision ID: d4e8a1b2c3f0
Revises: c0a7eac70002
Create Date: 2026-10-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e8a1b2c3f0"
down_revision: Union[str, Sequence[str], None] = "c0a7eac70002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("document", sa.Column("provider_signature_name", sa.String(length=255), nullable=True))
    op.add_column("document", sa.Column("provider_signed_at", sa.DateTime(), nullable=True))
    op.add_column(
        "document",
        sa.Column("signature_revision", sa.Integer(), nullable=False, server_default="1"),
    )


def downgrade() -> None:
    op.drop_column("document", "signature_revision")
    op.drop_column("document", "provider_signed_at")
    op.drop_column("document", "provider_signature_name")
