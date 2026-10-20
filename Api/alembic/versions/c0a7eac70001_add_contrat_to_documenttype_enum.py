"""add_contrat_to_documenttype_enum

Revision ID: c0a7eac70001
Revises: 3967c81bed2a
Create Date: 2026-10-20

"""
from typing import Sequence, Union

from alembic import op


revision: str = "c0a7eac70001"
down_revision: Union[str, Sequence[str], None] = "3967c81bed2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Ajoute CONTRAT à l'enum Postgres documenttype, hors transaction.

    ALTER TYPE ... ADD VALUE ne peut pas rester dans le bloc transactionnel
    d'Alembic (Postgres refuse, ou la valeur n'est pas utilisable tout de suite).
    """
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE documenttype ADD VALUE IF NOT EXISTS 'CONTRAT'")


def downgrade() -> None:
    """Postgres ne retire pas une valeur d'enum. CONTRAT reste inoffensif."""
    pass
