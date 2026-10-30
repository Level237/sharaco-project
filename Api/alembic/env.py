from logging.config import fileConfig
import os

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from app.models import SQLModel
from alembic import context
from app.core.config import settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config


def _sync_database_url() -> str:
    """URL sync : ALEMBIC_DATABASE_URL / DATABASE_URL (prod) sinon .env local."""
    raw = os.environ.get("ALEMBIC_DATABASE_URL") or os.environ.get("DATABASE_URL")
    if raw:
        if raw.startswith("postgresql+asyncpg://"):
            raw = "postgresql://" + raw[len("postgresql+asyncpg://"):]
        elif raw.startswith("postgres://"):
            raw = "postgresql://" + raw[len("postgres://"):]
        return raw
    return settings.SYNC_DATABASE_URL


# ConfigParser interprète %. Doubler pour les mots de passe.
config.set_main_option("sqlalchemy.url", _sync_database_url().replace("%", "%%"))

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()