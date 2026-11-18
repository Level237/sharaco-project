import asyncio
import logging
from app.celery_config import celery_app
from app.db.engine import async_engine
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)


async def _check_and_send_reminders():
    """Relances devis uniquement (factures = autre fil)."""
    async_session = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as db:
        from app.services.reminderService import reminder_service

        summary = await reminder_service.process_quote_reminders(db)
        logger.info(f"📬 Relances devis: {summary}")


@celery_app.task(name="app.celery_tasks.check_and_send_reminders")
def check_and_send_reminders():
    """Wrapper sync pour la tâche async Celery."""
    asyncio.run(_check_and_send_reminders())
