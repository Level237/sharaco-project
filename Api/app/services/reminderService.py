# app/services/reminderService.py
import os
from sqlmodel import select
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone, timedelta
from jinja2 import Environment, FileSystemLoader
from typing import Optional
from uuid import UUID
import logging

from app.models.reminder import ReminderConfig, ReminderLog, ReminderStatus, DocumentView
from app.models.document import Document, DocumentStatus, DocumentType
from app.models.invoice_reminder import InvoiceReminder, InvoiceReminderType
from app.models.user import User
from app.models.client import Client
from app.services.emailService import EmailService
from app.services.pdfRenderer import pdf_renderer
from app.services.templateService import TemplateService
from app.services.documentService import DocumentService
from app.services.quoteReminders import (
    next_quote_reminder_level,
    quote_reminder_intro,
    validate_quote_reminder_config,
)
from app.services.reminderJournal import invoice_step_label, quote_step_label
from app.core.config import settings
from app.core.currency import get_currency_symbol
from app.utils.datetime import to_naive_utc

QUOTE_REMINDER_STOP_STATUSES = {
    DocumentStatus.ACCEPTED,
    DocumentStatus.REFUSED,
    DocumentStatus.PAID,
    DocumentStatus.DRAFT,
    DocumentStatus.OVERDUE,
}

logger = logging.getLogger(__name__)


class ReminderService:
    TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates", "emails")

    # ✅ Déplacé dans la classe pour cohérence
    CHECKS = [
        (3, InvoiceReminderType.DUE_3_DAYS),
        (1, InvoiceReminderType.DUE_1_DAY),
    ]

    def __init__(self):
        self.env = Environment(
            loader=FileSystemLoader(self.TEMPLATES_DIR),
            autoescape=True,
        )

    # ═══════════════════════════════════════════════════════════════
    # ✅ V1 : Alertes de prévention avant échéance (J-3, J-1)
    # ═══════════════════════════════════════════════════════════════
    @staticmethod
    async def check_due_invoices(db: AsyncSession) -> dict:
        """
        Vérifie les factures envoyées dont l'échéance arrive (J-3, J-1)
        et envoie un email de prévention (une seule fois par type).
        """
        now = to_naive_utc(datetime.now(timezone.utc))
        today = now.date()

        min_date = datetime.combine(today, datetime.min.time())
        max_date = datetime.combine(today + timedelta(days=3), datetime.max.time())

        # Factures envoyées, non payées, échéance dans les 3 prochains jours
        stmt = (
            select(Document)
            .options(
                selectinload(Document.client),
                selectinload(Document.items),
                selectinload(Document.owner),  # ✅ Pour user_company
            )
            .where(
                Document.type == DocumentType.FACTURE,
                Document.status.in_([DocumentStatus.SENT, DocumentStatus.VIEWED]),
                Document.due_date != None,
                Document.due_date >= min_date,
                Document.due_date <= max_date,
            )
        )
        result = await db.execute(stmt)
        invoices = list(result.scalars().all())

        sent_count = 0
        skipped_count = 0
        details = []

        for invoice in invoices:
            days_left = (invoice.due_date.date() - today).days

            # Déterminer le type de rappel correspondant
            reminder_type = next(
                (rtype for days, rtype in ReminderService.CHECKS if days == days_left),
                None,
            )
            if not reminder_type:
                continue

            # Déjà alerté pour ce type ? → skip
            already = await db.execute(
                select(InvoiceReminder.id).where(
                    InvoiceReminder.invoice_id == invoice.id,
                    InvoiceReminder.reminder_type == reminder_type.value,
                )
            )
            if already.scalar_one_or_none():
                skipped_count += 1
                continue

            email = invoice.client.email if invoice.client else None
            if not email:
                logger.warning(f"⚠️ Facture {invoice.number} : client sans email")
                skipped_count += 1
                continue

            # ✅ Générer le lien privé client (optionnel, pour accès direct)
            client_url = None
            try:
                if not invoice.client_token:
                    invoice.client_token = Document.generate_share_token()
                    invoice.client_token_email = email
                    invoice.share_enabled = True
                    db.add(invoice)
                base_url = settings.FRONTEND_URL or "http://localhost:3000"
                client_url = f"{base_url}/client/{invoice.client_token}"
            except Exception as e:
                logger.warning(f"⚠️ Impossible de générer client_url: {e}")

            totals = DocumentService.calculate_totals(invoice.items)
            total_amount = f"{totals['grand_total_cents'] / 100:,.2f}"
            
            user_company = (
                invoice.owner.company_name 
                if invoice.owner and invoice.owner.company_name 
                else "Sharaco"
            )

            # Envoyer l'email de prévention
            try:
                send_result = await EmailService.send_invoice_reminder(
                    to_email=email,
                    client_name=invoice.client.name or "Client",
                    document_number=invoice.number or str(invoice.id),
                    total_amount=total_amount,
                    due_date=invoice.due_date.strftime("%d/%m/%Y"),
                    days_left=days_left,
                    client_url=client_url,
                    user_company=user_company,
                )

                if send_result.get("success"):
                    # Logger le rappel (anti-doublon)
                    db.add(InvoiceReminder(
                        invoice_id=invoice.id,
                        reminder_type=reminder_type.value,
                        recipient_email=email,
                    ))
                    sent_count += 1
                    details.append({
                        "invoice": invoice.number,
                        "type": reminder_type.value,
                        "days_left": days_left,
                        "email": email,
                    })
                    logger.info(
                        f"⏰ Rappel {reminder_type.value} envoyé pour {invoice.number} (J-{days_left})"
                    )
                else:
                    logger.error(f"❌ Échec envoi rappel {invoice.number}: {send_result.get('error')}")
                    skipped_count += 1

            except Exception as e:
                logger.error(f"❌ Erreur rappel {invoice.number}: {e}", exc_info=True)
                skipped_count += 1

        await db.commit()

        return {
            "checked": len(invoices),
            "sent": sent_count,
            "skipped": skipped_count,
            "details": details,
        }

    # ═══════════════════════════════════════════════════════════════
    # === CONFIG === (V2 - relances automatiques après retard)
    # ═══════════════════════════════════════════════════════════════
    @staticmethod
    async def get_or_create_config(db: AsyncSession, user_id: UUID) -> ReminderConfig:
        """Récupère ou crée la config de relances pour un utilisateur."""
        statement = select(ReminderConfig).where(ReminderConfig.user_id == user_id)
        result = await db.execute(statement)
        config = result.scalar_one_or_none()

        if not config:
            config = ReminderConfig(user_id=user_id)
            db.add(config)
            await db.commit()
            await db.refresh(config)

        return config

    @staticmethod
    async def update_config(db: AsyncSession, config: ReminderConfig, **kwargs) -> ReminderConfig:
        """Met à jour la config de relances devis."""
        for key, value in kwargs.items():
            if value is not None and hasattr(config, key):
                setattr(config, key, value)
        validate_quote_reminder_config(config)
        config.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.add(config)
        await db.commit()
        await db.refresh(config)
        return config

    # ═══════════════════════════════════════════════════════════════
    # === SEND DOCUMENT === (utilisé par l'envoi manuel)
    # ═══════════════════════════════════════════════════════════════
    async def send_document(
        self,
        db: AsyncSession,
        document: Document,
        user: User,
        client: Client,
    ) -> dict:
        """Envoie un document par email au client et change le statut en SENT."""
        template = await self._get_template(db, document, user)

        # ✅ Sécurisation des accès : génération des tokens cryptographiques
        if not document.client_token:
            document.client_token = Document.generate_share_token()
            document.client_token_email = client.email
            db.add(document)
        if not document.share_token:
            document.share_token = Document.generate_share_token()
            document.share_enabled = True
            document.share_expires_at = to_naive_utc(
                datetime.now(timezone.utc) + timedelta(days=30)
            )
            db.add(document)
        await db.flush()

        base_url = settings.FRONTEND_URL or "http://localhost:3000"
        document_link = f"{base_url}/client/{document.client_token}"

        totals = self._calculate_totals_simple(document)
        html_content = self._render_email(
            document=document,
            user=user,
            client=client,
            totals=totals,
            document_link=document_link,
            is_reminder=False,
        )

        subject = f"{document.type.value} {document.number} - {user.company_name or 'Sharaco'}"

        # ✅ Utilise la bonne méthode EmailService selon le type
        email_payload = dict(
            to_email=client.email,
            client_name=client.name,
            document_number=document.number or "",
            total_amount=totals["grand_total"],
            client_url=document_link,
            due_date=document.due_date.strftime("%d/%m/%Y") if document.due_date else None,
            user_name=getattr(user, 'full_name', '') or user.email,
            user_company=user.company_name or "Sharaco",
        )
        if document.type == DocumentType.DEVIS:
            result = await EmailService.send_devis(**email_payload)
        elif document.type == DocumentType.CONTRAT:
            result = await EmailService.send_contrat(**email_payload)
        else:
            result = await EmailService.send_facture(**email_payload)

        # Mettre à jour le document
        if result.get("success"):
            document.status = DocumentStatus.SENT
            document.sent_at = datetime.now(timezone.utc).replace(tzinfo=None)
            db.add(document)
            await db.commit()

        return result

    # ═══════════════════════════════════════════════════════════════
    # === SEND REMINDER (V2 - relances automatiques après retard)
    # ═══════════════════════════════════════════════════════════════
    async def send_reminder(
        self,
        db: AsyncSession,
        document: Document,
        user: User,
        client: Client,
        reminder_level: int,
        force: bool = False,
    ) -> ReminderLog:
        """Envoie une relance devis (auto ou manuelle). Max 3 niveaux, jamais un 4e."""
        if document.type != DocumentType.DEVIS:
            raise ValueError("Les relances configurables concernent uniquement les devis")

        if document.status in QUOTE_REMINDER_STOP_STATUSES:
            raise ValueError("Ce devis n'est plus en attente de décision")

        config = await self.get_or_create_config(db, user.id)

        if not force and not config.is_active:
            raise ValueError("Les relances automatiques sont désactivées")

        if config.stop_on_view and (
            document.status == DocumentStatus.VIEWED or document.viewed_at is not None
        ):
            raise ValueError("Le devis a déjà été ouvert : relance coupée")

        level_enabled = getattr(config, f"reminder_{reminder_level}_enabled", False)
        if not level_enabled:
            raise ValueError(f"Relance niveau {reminder_level} désactivée")

        existing = await self._get_reminder_log(db, document.id, reminder_level)
        if existing and existing.status in (ReminderStatus.SENT, ReminderStatus.PENDING):
            raise ValueError(f"Relance niveau {reminder_level} déjà envoyée")

        if existing:
            log = existing
            log.status = ReminderStatus.PENDING
            log.error_message = None
        else:
            log = ReminderLog(
                document_id=document.id,
                reminder_level=reminder_level,
                status=ReminderStatus.PENDING,
            )
        db.add(log)
        await db.flush()

        try:
            # ✅ Sécurisation des accès : génération des tokens cryptographiques
            if not document.client_token:
                document.client_token = Document.generate_share_token()
                document.client_token_email = client.email
                db.add(document)
            if not document.share_token:
                document.share_token = Document.generate_share_token()
                document.share_enabled = True
                document.share_expires_at = to_naive_utc(
                    datetime.now(timezone.utc) + timedelta(days=30)
                )
                db.add(document)
            await db.flush()

            base_url = settings.FRONTEND_URL or "http://localhost:3000"
            document_link = f"{base_url}/client/{document.client_token}"
            totals = self._calculate_totals_simple(document)

            expiry = document.due_date.strftime("%d/%m/%Y") if document.due_date else ""
            subject_template = getattr(config, f"reminder_{reminder_level}_subject", "")
            try:
                subject = subject_template.format(
                    number=document.number or "",
                    company=user.company_name or "Sharaco",
                    expiry=expiry,
                )
            except (KeyError, IndexError, ValueError):
                subject = subject_template

            intro = quote_reminder_intro(reminder_level, expiry)
            context = self._email_context(
                document=document,
                user=user,
                client=client,
                totals=totals,
                document_link=document_link,
                is_reminder=True,
                reminder_intro=intro,
            )

            result = await EmailService.send_notification(
                to_email=client.email,
                subject=subject,
                template="document_email.html",
                context=context,
            )

            if result.get("success"):
                log.status = ReminderStatus.SENT
                log.sent_at = datetime.now(timezone.utc).replace(tzinfo=None)
            else:
                log.status = ReminderStatus.FAILED
                log.error_message = result.get("error", "Unknown error")
            
            await db.commit()
            logger.info(f"Relance niveau {reminder_level} envoyée pour {document.number}")
            return log

        except Exception as e:
            log.status = ReminderStatus.FAILED
            log.error_message = str(e)
            await db.commit()
            logger.error(f"Erreur relance {document.number}: {str(e)}")
            raise

    async def process_quote_reminders(self, db: AsyncSession) -> dict:
        """Envoie au plus une relance devis par document et par passage."""
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        stmt = (
            select(Document)
            .options(
                selectinload(Document.items),
                selectinload(Document.client),
                selectinload(Document.owner),
            )
            .where(
                Document.type == DocumentType.DEVIS,
                Document.status.in_([DocumentStatus.SENT, DocumentStatus.VIEWED]),
                Document.sent_at != None,  # noqa: E711
            )
        )
        result = await db.execute(stmt)
        quotes = list(result.scalars().all())

        sent_count = 0
        skipped_count = 0
        details: list[dict] = []
        config_by_user: dict[UUID, Optional[ReminderConfig]] = {}

        for quote in quotes:
            user_id = quote.user_id
            if user_id not in config_by_user:
                cfg_result = await db.execute(
                    select(ReminderConfig).where(ReminderConfig.user_id == user_id)
                )
                config_by_user[user_id] = cfg_result.scalar_one_or_none()
            config = config_by_user[user_id]
            if not config or not config.is_active:
                skipped_count += 1
                continue
            if config.stop_on_view and (
                quote.status == DocumentStatus.VIEWED or quote.viewed_at is not None
            ):
                skipped_count += 1
                continue

            sent_at = quote.sent_at
            if sent_at.tzinfo is not None:
                sent_at = sent_at.replace(tzinfo=None)
            days_since_sent = (now - sent_at).days

            logs = await self.get_reminder_history(db, quote.id)
            already_sent = {
                log.reminder_level
                for log in logs
                if log.status in (ReminderStatus.SENT, ReminderStatus.PENDING)
            }
            level = next_quote_reminder_level(days_since_sent, config, already_sent)
            if not level:
                skipped_count += 1
                continue

            user = quote.owner
            client = quote.client
            if not user or not client or not client.email:
                skipped_count += 1
                continue

            try:
                await self.send_reminder(
                    db=db,
                    document=quote,
                    user=user,
                    client=client,
                    reminder_level=level,
                    force=False,
                )
                sent_count += 1
                details.append({
                    "quote": quote.number,
                    "level": level,
                    "days_since_sent": days_since_sent,
                    "email": client.email,
                })
            except Exception as e:
                skipped_count += 1
                logger.error(f"❌ Relance devis {quote.number}: {e}")

        return {
            "checked": len(quotes),
            "sent": sent_count,
            "skipped": skipped_count,
            "details": details,
        }

    # ═══════════════════════════════════════════════════════════════
    # === TRACKING ===
    # ═══════════════════════════════════════════════════════════════
    @staticmethod
    async def track_view(
        db: AsyncSession,
        document_id: UUID,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Optional[Document]:
        """Enregistre une visualisation du document par le client."""
        statement = select(Document).where(Document.id == document_id)
        result = await db.execute(statement)
        document = result.scalar_one_or_none()

        if not document:
            return None

        view = DocumentView(
            document_id=document_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(view)

        if document.viewed_at is None:
            document.viewed_at = datetime.now(timezone.utc).replace(tzinfo=None)
            if document.status == DocumentStatus.SENT:
                document.status = DocumentStatus.VIEWED

        db.add(document)
        await db.commit()
        return document

    # ═══════════════════════════════════════════════════════════════
    # === HISTORY ===
    # ═══════════════════════════════════════════════════════════════
    @staticmethod
    async def get_reminder_history(db: AsyncSession, document_id: UUID) -> list[ReminderLog]:
        """Récupère l'historique des relances d'un document."""
        statement = (
            select(ReminderLog)
            .where(ReminderLog.document_id == document_id)
            .order_by(ReminderLog.reminder_level)
        )
        result = await db.execute(statement)
        return list(result.scalars().all())

    @classmethod
    async def list_journal(
        cls,
        db: AsyncSession,
        user_id: UUID,
        kind: Optional[str] = None,
        limit: int = 80,
    ) -> list[dict]:
        """Journal unifié devis + factures, limité au compte courant."""
        cap = max(1, min(limit, 200))
        rows: list[dict] = []

        if kind in (None, "", "devis"):
            quote_stmt = (
                select(ReminderLog, Document, Client)
                .join(Document, Document.id == ReminderLog.document_id)
                .join(Client, Client.id == Document.client_id)
                .where(
                    Document.user_id == user_id,
                    Client.user_id == user_id,
                    Document.type == DocumentType.DEVIS,
                )
                .order_by(desc(ReminderLog.sent_at), desc(ReminderLog.id))
                .limit(cap)
            )
            for log, document, client in await cls._journal_rows(db, quote_stmt):
                rows.append(
                    {
                        "id": log.id,
                        "kind": "devis",
                        "document_id": document.id,
                        "document_number": document.number,
                        "client_name": client.name,
                        "client_email": client.email,
                        "step_label": quote_step_label(log.reminder_level),
                        "reminder_level": log.reminder_level,
                        "status": log.status.value if hasattr(log.status, "value") else str(log.status),
                        "sent_at": log.sent_at,
                        "error_message": log.error_message,
                    }
                )

        if kind in (None, "", "facture"):
            invoice_stmt = (
                select(InvoiceReminder, Document, Client)
                .join(Document, Document.id == InvoiceReminder.invoice_id)
                .join(Client, Client.id == Document.client_id)
                .where(
                    Document.user_id == user_id,
                    Client.user_id == user_id,
                    Document.type == DocumentType.FACTURE,
                )
                .order_by(desc(InvoiceReminder.sent_at), desc(InvoiceReminder.id))
                .limit(cap)
            )
            for log, document, client in await cls._journal_rows(db, invoice_stmt):
                rows.append(
                    {
                        "id": log.id,
                        "kind": "facture",
                        "document_id": document.id,
                        "document_number": document.number,
                        "client_name": client.name,
                        "client_email": log.recipient_email or client.email,
                        "step_label": invoice_step_label(log.reminder_type),
                        "reminder_level": None,
                        "status": ReminderStatus.SENT.value,
                        "sent_at": log.sent_at,
                        "error_message": None,
                    }
                )

        rows.sort(key=lambda item: cls._journal_sort_at(item.get("sent_at")), reverse=True)
        return rows[:cap]

    @staticmethod
    async def _journal_rows(db: AsyncSession, statement) -> list:
        try:
            return list((await db.execute(statement)).all())
        except SQLAlchemyError as exc:
            logger.warning("Journal relances: requête ignorée (%s)", exc)
            try:
                await db.rollback()
            except SQLAlchemyError:
                pass
            return []

    @staticmethod
    def _journal_sort_at(value: Optional[datetime]) -> datetime:
        if value is None:
            return datetime.min
        if getattr(value, "tzinfo", None) is not None:
            return value.replace(tzinfo=None)
        return value

    # ═══════════════════════════════════════════════════════════════
    # === HELPERS ===
    # ═══════════════════════════════════════════════════════════════
    @staticmethod
    async def _get_template(db, document, user):
        """Récupère le template de design du document."""
        if document.template_id:
            tmpl = await TemplateService.get_by_id(db, document.template_id, user.id)
            if tmpl:
                return tmpl
        default = await TemplateService.get_default(db, user.id)
        if default:
            return default
        from app.models.document_template import DocumentTemplate
        return DocumentTemplate(
            name="Par défaut", user_id=user.id, primary_color="#2563EB",
            secondary_color="#1E40AF", accent_color="#DBEAFE",
            text_color="#1F2937", background_color="#FFFFFF",
            font_family="Inter", layout_style="classic",
            show_bank_details=True, show_tax_id=True, is_default=True,
        )

    @staticmethod
    async def _get_reminder_log(db: AsyncSession, document_id: UUID, level: int) -> Optional[ReminderLog]:
        statement = select(ReminderLog).where(
            ReminderLog.document_id == document_id,
            ReminderLog.reminder_level == level,
        )
        result = await db.execute(statement)
        logs = list(result.scalars().all())
        for log in logs:
            if log.status in (ReminderStatus.SENT, ReminderStatus.PENDING):
                return log
        return logs[0] if logs else None

    def _calculate_totals_simple(self, document: Document) -> dict:
        subtotal = sum(i.quantity * i.unit_price_cents for i in document.items)
        tax = sum(int(i.quantity * i.unit_price_cents * i.tax_rate / 100) for i in document.items)
        owner = getattr(document, "owner", None)
        symbol = get_currency_symbol(
            getattr(owner, "currency", None) if owner else None,
            getattr(owner, "country", None) if owner else None,
        )
        return {
            "subtotal": f"{subtotal / 100:.2f}",
            "tax": f"{tax / 100:.2f}",
            "grand_total": f"{(subtotal + tax) / 100:,.2f} {symbol}",
        }

    def _email_context(
        self,
        document,
        user,
        client,
        totals,
        document_link,
        is_reminder,
        reminder_intro: str = "",
    ) -> dict:
        return {
            "company_name": user.company_name or "Sharaco",
            "company_address": user.address or "",
            "primary_color": "#2563EB",
            "client_name": client.name,
            "doc_type": document.type.value if hasattr(document.type, "value") else document.type,
            "doc_number": document.number or "",
            "grand_total": totals["grand_total"],
            "due_date": document.due_date.strftime("%d/%m/%Y") if document.due_date else "",
            "sent_date": document.sent_at.strftime("%d/%m/%Y") if document.sent_at else "",
            "document_link": document_link,
            "is_reminder": is_reminder,
            "reminder_intro": reminder_intro,
        }

    def _render_email(self, document, user, client, totals, document_link, is_reminder):
        context = self._email_context(
            document, user, client, totals, document_link, is_reminder
        )
        try:
            tmpl = self.env.get_template("document_email.html")
            return tmpl.render(**context)
        except Exception as e:
            logger.warning(f"⚠️ Template document_email.html introuvable: {e}")
            return f"""
            <html><body>
            <h2>{document.type.value} {document.number}</h2>
            <p>Bonjour {client.name},</p>
            <p>Montant : {totals['grand_total']}</p>
            <p><a href="{document_link}">Voir le document</a></p>
            </body></html>
            """


reminder_service = ReminderService()