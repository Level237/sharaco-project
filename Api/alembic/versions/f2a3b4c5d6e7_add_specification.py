"""add specification table

Revision ID: f2a3b4c5d6e7
Revises: e1b2c3d4f5a6
Create Date: 2026-11-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f2a3b4c5d6e7"
down_revision: Union[str, Sequence[str], None] = "e1b2c3d4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "specification",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("number", sa.String(length=40), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("cover_style", sa.String(length=32), nullable=False, server_default="spine"),
        sa.Column("primary_color", sa.String(length=7), nullable=False, server_default="#2563EB"),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="DRAFT"),
        sa.Column("sections", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["project_id"], ["project.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_specification_user_id"), "specification", ["user_id"], unique=False)
    op.create_index(op.f("ix_specification_project_id"), "specification", ["project_id"], unique=False)
    op.create_index(op.f("ix_specification_kind"), "specification", ["kind"], unique=False)
    op.create_index(op.f("ix_specification_number"), "specification", ["number"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_specification_number"), table_name="specification")
    op.drop_index(op.f("ix_specification_kind"), table_name="specification")
    op.drop_index(op.f("ix_specification_project_id"), table_name="specification")
    op.drop_index(op.f("ix_specification_user_id"), table_name="specification")
    op.drop_table("specification")
