"""add invoice_reminders (J-3 / J-1 logs)

Revision ID: e3a4b5c6d7e8
Revises: d0e1f2a3b4c5
Create Date: 2026-11-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e3a4b5c6d7e8"
down_revision: Union[str, Sequence[str], None] = "d0e1f2a3b4c5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "invoice_reminders",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("invoice_id", sa.Uuid(), nullable=False),
        sa.Column("reminder_type", sa.String(), nullable=False),
        sa.Column("recipient_email", sa.String(), nullable=False),
        sa.Column("sent_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["invoice_id"], ["document.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_invoice_reminders_invoice_id"),
        "invoice_reminders",
        ["invoice_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_invoice_reminders_reminder_type"),
        "invoice_reminders",
        ["reminder_type"],
        unique=False,
    )
    op.create_index(
        "ix_invoice_reminders_invoice_id_reminder_type",
        "invoice_reminders",
        ["invoice_id", "reminder_type"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_invoice_reminders_invoice_id_reminder_type",
        table_name="invoice_reminders",
    )
    op.drop_index(op.f("ix_invoice_reminders_reminder_type"), table_name="invoice_reminders")
    op.drop_index(op.f("ix_invoice_reminders_invoice_id"), table_name="invoice_reminders")
    op.drop_table("invoice_reminders")
