"""add password reset token table

Revision ID: e1b2c3d4f5a6
Revises: d4e8a1b2c3f0
Create Date: 2026-10-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e1b2c3d4f5a6"
down_revision: Union[str, Sequence[str], None] = "d4e8a1b2c3f0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "password_reset_token",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_password_reset_token_user_id"), "password_reset_token", ["user_id"], unique=False)
    op.create_index(op.f("ix_password_reset_token_token_hash"), "password_reset_token", ["token_hash"], unique=True)
    op.create_index(op.f("ix_password_reset_token_expires_at"), "password_reset_token", ["expires_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_password_reset_token_expires_at"), table_name="password_reset_token")
    op.drop_index(op.f("ix_password_reset_token_token_hash"), table_name="password_reset_token")
    op.drop_index(op.f("ix_password_reset_token_user_id"), table_name="password_reset_token")
    op.drop_table("password_reset_token")
