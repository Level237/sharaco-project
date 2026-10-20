#!/usr/bin/env python3
"""Applique les migrations Alembic.

En ligne (connexion à la base, défaut) :
  cd Api && ./venv/bin/python scripts/migrate.py
  ALEMBIC_DATABASE_URL='postgresql://user:pass@host:5432/db' ./venv/bin/python scripts/migrate.py

Hors ligne (SQL à relire, sans toucher la base) :
  ./venv/bin/python scripts/migrate.py --sql
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

API_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_ROOT))
os.chdir(API_ROOT)

from alembic import command
from alembic.config import Config


def _alembic_cfg() -> Config:
    return Config(str(API_ROOT / "alembic.ini"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Migrations Alembic Sharaco")
    parser.add_argument(
        "--sql",
        action="store_true",
        help="Mode hors ligne : imprime le SQL sans l'exécuter",
    )
    parser.add_argument(
        "revision",
        nargs="?",
        default="head",
        help="Révision cible (défaut: head)",
    )
    args = parser.parse_args()
    cfg = _alembic_cfg()

    if args.sql:
        command.upgrade(cfg, args.revision, sql=True)
    else:
        command.upgrade(cfg, args.revision)
        print(f"Migration en ligne OK → {args.revision}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
