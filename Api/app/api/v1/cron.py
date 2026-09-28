# app/api/v1/cron.py
import hmac
import logging
from fastapi import APIRouter, Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.engine import async_session
from app.core.config import settings
from app.services.reminderService import ReminderService
from app.services.overdueService import OverdueService

router = APIRouter(tags=["cron"])
logger = logging.getLogger(__name__)


async def verify_cron_secret(x_cron_secret: str = Header(default=None, alias="x-cron-secret")):
    """
    Vérifie l'en-tête secret x-cron-secret pour sécuriser les exécutions batch.
    - Échoue immédiatement en 500 (Fail Closed) si CRON_SECRET n'est pas configuré sur le serveur.
    - Rejette avec 401 si l'en-tête x-cron-secret est absent.
    - Rejette avec 403 via comparaison à temps constant (hmac.compare_digest) si le secret est invalide.
    """
    configured_secret = getattr(settings, "CRON_SECRET", "")
    if not configured_secret or not configured_secret.strip():
        logger.error("❌ CRON_SECRET n'est pas configuré dans l'environnement serveur.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Le service cron n'est pas configuré sur ce serveur"
        )

    if not x_cron_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="En-tête x-cron-secret manquant"
        )

    if not hmac.compare_digest(x_cron_secret, configured_secret):
        logger.warning("⚠️ Tentative d'exécution de cron non autorisée avec un secret invalide.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Secret cron invalide"
        )


@router.post("/check-overdue", dependencies=[Depends(verify_cron_secret)])
async def trigger_check_overdue():
    """Marque en OVERDUE toutes les factures en retard."""
    async with async_session() as db:
        summary = await OverdueService.check_overdue_invoices(db)
    
    logger.info(f"🔴 Cron OVERDUE terminé: {summary}")
    return summary


@router.post("/check-due-invoices", dependencies=[Depends(verify_cron_secret)])
async def trigger_check_due_invoices():
    """
    Déclenche la vérification des factures arrivant à échéance.
    Protégé par un secret pour être appelé par un cron système ou en test.
    """
    async with async_session() as db:
        summary = await ReminderService.check_due_invoices(db)

    logger.info(f"⏰ Cron factures terminé: {summary}")
    return summary