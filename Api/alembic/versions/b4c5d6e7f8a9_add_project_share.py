"""add project share token

Revision ID: b4c5d6e7f8a9
Revises: a3b4c5d6e7f8
Create Date: 2026-11-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b4c5d6e7f8a9"
down_revision: Union[str, Sequence[str], None] = "a3b4c5d6e7f8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("project", sa.Column("share_token", sa.String(length=64), nullable=True))
    op.add_column(
        "project",
        sa.Column("share_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index("ix_project_share_token", "project", ["share_token"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_project_share_token", table_name="project")
    op.drop_column("project", "share_enabled")
    op.drop_column("project", "share_token")
