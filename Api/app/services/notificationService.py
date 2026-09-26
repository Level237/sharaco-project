from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.core.currency import get_currency_symbol, format_amount
from sqlmodel import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.document import Document
from app.services.emailService import EmailService
from app.services.documentService import DocumentService
import logging


logger = logging.getLogger(__name__)


class NotificationService:

    @staticmethod
    async def notify_document_accepted(document_id: UUID, db: AsyncSession):
        """Notifie l'utilisateur que son devis a été accepté."""
        try:
            result = await db.execute(
                select(Document)
                .options(
                    selectinload(Document.owner),
                    selectinload(Document.client),
                    selectinload(Document.items),
                )
                .where(Document.id == document_id)
            )
            document = result.scalar_one_or_none()

            if not document:
                logger.warning(f"⚠️ Document {document_id} introuvable pour notification")
                return

            if not document.owner:
                logger.warning(f"⚠️ Document {document_id} sans owner")
                return

            logger.info(
                f"🔔 Notification acceptation : Devis {document.number} accepté"
            )

            # ✅ Calcul du montant avec la devise de l'utilisateur propriétaire
            totals = DocumentService.calculate_totals(document.items)
            user_currency = getattr(document.owner, "currency", None) or "XOF"
            amount = format_amount(totals["grand_total_cents"], user_currency)

            # ✅ Nom de l'utilisateur
            user_name = (
                getattr(document.owner, "full_name", None)
                or getattr(document.owner, "first_name", None)
                or document.owner.email.split("@")[0]
            )

            # Envoyer l'email
            result = await EmailService.send_notification(
                to_email=document.owner.email,
                subject=f"✅ Devis {document.number} accepté !",
                template="document_accepted.html",
                context={
                    "user_name": user_name,
                    "document_number": document.number or str(document_id),
                    "client_name": document.client.name if document.client else "Client",
                    "signature_name": document.signature_name or "Non précisé",
                    "amount": amount,
                    "accepted_at": (
                        document.accepted_at.strftime("%d/%m/%Y à %H:%M")
                        if document.accepted_at
                        else ""
                    ),
                },
            )

            logger.info(f"✅ Email d'acceptation envoyé: {result}")

        except Exception as e:
            logger.error(f"❌ Erreur notification acceptation: {e}", exc_info=True)

    @staticmethod
    async def notify_document_refused(document_id: UUID, db: AsyncSession):
        """Notifie l'utilisateur que son devis a été refusé."""
        try:
            result = await db.execute(
                select(Document)
                .options(
                    selectinload(Document.owner),
                    selectinload(Document.client),
                    selectinload(Document.items),
                )
                .where(Document.id == document_id)
            )
            document = result.scalar_one_or_none()

            if not document:
                logger.warning(f"⚠️ Document {document_id} introuvable")
                return

            if not document.owner:
                logger.warning(f"⚠️ Document {document_id} sans owner")
                return

            logger.info(
                f"🔔 Notification refus : Devis {document.number} refusé"
            )

            # ✅ Calcul du montant avec la devise de l'utilisateur propriétaire
            totals = DocumentService.calculate_totals(document.items)
            user_currency = getattr(document.owner, "currency", None) or "XOF"
            amount = format_amount(totals["grand_total_cents"], user_currency)

            # ✅ Nom de l'utilisateur
            user_name = (
                getattr(document.owner, "full_name", None)
                or getattr(document.owner, "first_name", None)
                or document.owner.email.split("@")[0]
            )

            # Envoyer l'email
            result = await EmailService.send_notification(
                to_email=document.owner.email,
                subject=f"❌ Devis {document.number} refusé",
                template="document_refused.html",
                context={
                    "user_name": user_name,
                    "document_number": document.number or str(document_id),
                    "client_name": document.client.name if document.client else "Client",
                    "amount": amount,
                    "refusal_reason": document.refusal_reason or "Aucun motif précisé",
                    "refused_at": (
                        document.refused_at.strftime("%d/%m/%Y à %H:%M")
                        if document.refused_at
                        else ""
                    ),
                },
            )

            logger.info(f"✅ Email de refus envoyé: {result}")

        except Exception as e:
            logger.error(f"❌ Erreur notification refus: {e}", exc_info=True)

    # ═══════════════════════════════════════════════════════════
    # ✅ NOUVEAU : Notification quand une facture est payée
    # ═══════════════════════════════════════════════════════════
    @staticmethod
    async def notify_invoice_paid(document_id: UUID, db: AsyncSession):
        """Notifie l'utilisateur qu'une facture a été payée."""
        try:
            result = await db.execute(
                select(Document)
                .options(
                    selectinload(Document.owner),
                    selectinload(Document.client),
                    selectinload(Document.items),
                )
                .where(Document.id == document_id)
            )
            document = result.scalar_one_or_none()

            if not document or not document.owner:
                return

            totals = DocumentService.calculate_totals(document.items)
            user_currency = getattr(document.owner, "currency", None) or "XOF"
            amount = format_amount(totals["grand_total_cents"], user_currency)

            user_name = (
                getattr(document.owner, "full_name", None)
                or getattr(document.owner, "first_name", None)
                or document.owner.email.split("@")[0]
            )

            result = await EmailService.send_notification(
                to_email=document.owner.email,
                subject=f"💰 Facture {document.number} payée !",
                template="invoice_paid.html",
                context={
                    "user_name": user_name,
                    "document_number": document.number or str(document_id),
                    "client_name": document.client.name if document.client else "Client",
                    "amount": amount,
                    "paid_at": (
                        document.paid_at.strftime("%d/%m/%Y à %H:%M")
                        if document.paid_at
                        else ""
                    ),
                },
            )

            logger.info(f"✅ Email de paiement envoyé: {result}")

        except Exception as e:
            logger.error(f"❌ Erreur notification paiement: {e}", exc_info=True)