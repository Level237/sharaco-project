# app/services/documentService.py
from sqlmodel import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.document import Document, DocumentItem, DocumentType, DocumentStatus, InvoiceType
from app.models.document_template import DocumentTemplate
from app.models.reminder import ReminderLog
from app.models.payment_schedule import PaymentSchedule
from app.models.billing_settings import BillingSettings
from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
from app.services.templateService import TemplateService
from app.services.billingSettingsService import BillingSettingsService
from uuid import uuid4
import json
from app.models.client import Client
from app.models.user import User
from app.services.pdfRenderer import pdf_renderer
from app.services.contractKinds import default_rules_for, normalize_contract_layout
import logging
from app.utils.datetime import to_naive_utc

logger = logging.getLogger(__name__)


class DocumentService:

    @staticmethod
    def encode_rules(rules: Optional[list] = None) -> Optional[str]:
        if not rules:
            return None
        cleaned = []
        for rule in rules:
            if isinstance(rule, dict):
                title = (rule.get("title") or "").strip()
                body = (rule.get("body") or "").strip()
            else:
                title = (getattr(rule, "title", None) or "").strip()
                body = (getattr(rule, "body", None) or "").strip()
            if title or body:
                cleaned.append({"title": title, "body": body})
        return json.dumps(cleaned, ensure_ascii=False) if cleaned else None

    @staticmethod
    def decode_rules(raw: Optional[str] = None) -> list[dict]:
        if not raw:
            return []
        try:
            data = json.loads(raw)
        except (TypeError, json.JSONDecodeError):
            return []
        if not isinstance(data, list):
            return []
        return [
            {"title": str(item.get("title") or ""), "body": str(item.get("body") or "")}
            for item in data
            if isinstance(item, dict)
        ]



    @staticmethod
    async def create_from_quote(
        db: AsyncSession,
        quote: Document,
        kind: InvoiceType = InvoiceType.STANDARD,
        percent: float | None = None,
        origin: str = "auto",
    ) -> Document:
        if quote.type != DocumentType.DEVIS:
            raise ValueError("create_from_quote exige un devis en entrée")

        await db.refresh(quote, ["items"])
        if not quote.items:
            raise ValueError("Le devis source n'a pas de lignes")

        number = await DocumentService._generate_number(db, DocumentType.FACTURE, quote.user_id)

        invoice = Document(
            type=DocumentType.FACTURE,
            invoice_type=kind,
            origin=origin,
            source_document_id=quote.id,
            status=DocumentStatus.DRAFT,
            number=number,
            user_id=quote.user_id,
            client_id=quote.client_id,
            layout_style=quote.layout_style,
            template_id=quote.template_id,
            project_id=quote.project_id,
            notes=quote.notes,
            primary_color=quote.primary_color,
            secondary_color=quote.secondary_color,
            accent_color=quote.accent_color,
            background_color=quote.background_color,
            text_color=quote.text_color,
            font_family=quote.font_family,
            show_bank_details=quote.show_bank_details,
            show_tax_id=quote.show_tax_id,
            created_at=to_naive_utc(datetime.now(timezone.utc)),
        )
        db.add(invoice)
        await db.flush()

        for item in quote.items:
            unit_price = item.unit_price_cents

            if kind == InvoiceType.ACOMPTE and percent is not None:
                unit_price = int(round(unit_price * percent / 100))
            elif kind == InvoiceType.SOLDE and percent is not None:
                unit_price = int(round(unit_price * (100 - percent) / 100))

            new_item = DocumentItem(
                description=item.description,
                quantity=item.quantity,
                unit_price_cents=unit_price,
                tax_rate=item.tax_rate,
                document_id=invoice.id,
            )
            db.add(new_item)

        await db.flush()
        await db.refresh(invoice, ["items"])

        logger.info(
            f"✅ Facture {invoice.number} créée depuis devis {quote.number} "
            f"(type={kind.value}, origin={origin}, {len(invoice.items)} items)"
        )
        return invoice

    @staticmethod
    async def handle_quote_acceptance(db: AsyncSession, quote: Document) -> dict:
        from app.services.paymentScheduleService import PaymentScheduleService
        from app.services.invoiceService import InvoiceService
        from app.models.payment_schedule import MilestoneStatus
        from app.services.notificationService import NotificationService
        
        quote.status = DocumentStatus.ACCEPTED
        quote.accepted_at = to_naive_utc(datetime.now(timezone.utc))
        db.add(quote)
        
        settings = await BillingSettingsService.get_or_create(db, quote.user_id)
        
        if not settings.auto_create_invoice:
            logger.info(f"⏭️ Auto-création désactivée pour user {quote.user_id}")
            await db.flush()
            return {
                "quote": quote,
                "invoice": None,
                "has_schedule": False,
                "message": "Devis accepté. Aucune facture créée (auto-création désactivée).",
            }
        
        stmt = (
            select(PaymentSchedule)
            .where(PaymentSchedule.document_id == quote.id)
            .order_by(PaymentSchedule.sequence.asc())
        )
        result = await db.execute(stmt)
        milestones = list(result.scalars().all())
        
        first_invoice = None
        
        try:
            if milestones:
                first_milestone = milestones[0]
                
                first_invoice = await InvoiceService.create_from_milestone(
                    db=db,
                    quote=quote,
                    milestone=first_milestone,
                    origin="auto",
                )
                
                first_milestone.status = MilestoneStatus.INVOICED
                first_milestone.invoice_id = first_invoice.id
                first_milestone.invoiced_at = to_naive_utc(datetime.now(timezone.utc))
                db.add(first_milestone)
                
                logger.info(
                    f"✅ Facture {first_invoice.number} créée pour milestone "
                    f"'{first_milestone.title}' ({first_milestone.percent}%)"
                )
            else:
                first_invoice = await InvoiceService.create_from_quote(
                    db=db,
                    quote=quote,
                    kind=InvoiceType.STANDARD,
                    origin="auto",
                )
                logger.info(f"✅ Facture STANDARD {first_invoice.number} créée")
            
            auto_sent = False
            if settings.auto_send_invoice and first_invoice:
                try:
                    await InvoiceService.send_invoice(db, first_invoice)
                    auto_sent = True
                except Exception as e:
                    logger.error(f"❌ Erreur envoi auto: {e}")
        
        except Exception as e:
            logger.error(f"❌ Erreur création facture: {e}", exc_info=True)
        
        try:
            await NotificationService.notify_document_accepted(quote.id, db)
        except Exception as e:
            logger.warning(f"⚠️ Erreur notification: {e}")
        
        await db.flush()
        await db.refresh(quote)
        
        return {
            "quote": quote,
            "invoice": first_invoice,
            "has_schedule": bool(milestones),
            "auto_sent": auto_sent,
            "message": (
                f"Devis accepté. Facture {first_invoice.number if first_invoice else '(aucune)'} créée."
            ),
        }

    @staticmethod
    async def handle_contract_acceptance(db: AsyncSession, contract: Document) -> dict:
        contract.status = DocumentStatus.ACCEPTED
        contract.accepted_at = to_naive_utc(datetime.now(timezone.utc))
        db.add(contract)
        pdf_renderer.invalidate_document_cache(contract.id)
        await db.flush()
        await db.refresh(contract)
        return {
            "quote": contract,
            "invoice": None,
            "has_schedule": False,
            "auto_sent": False,
            "message": "Contrat signé.",
        }

    @staticmethod
    def _parse_trigger_date(value) -> datetime | None:
        if not value:
            return None
        if isinstance(value, datetime):
            return to_naive_utc(value)
        if isinstance(value, str):
            try:
                dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
                return to_naive_utc(dt)
            except (ValueError, TypeError) as e:
                logger.warning(f"⚠️ Impossible de parser la date '{value}': {e}")
                return None
        return None

    @staticmethod
    async def render_preview(
        db: AsyncSession,
        user: User,
        type: DocumentType = DocumentType.DEVIS,
        client_name: str = "Client Exemple",
        client_email: str = "",
        client_address: str = "",
        client_phone: str = "",
        items: list[dict] = None,
        template_id: Optional[UUID] = None,
        layout_style: str = "classic",
        primary_color: str = "#2563EB",
        secondary_color: str = "#1E40AF",
        accent_color: str = "#DBEAFE",
        text_color: str = "#1F2937",
        background_color: str = "#FFFFFF",
        font_family: str = "Inter",
        header_text: Optional[str] = None,
        footer_text: Optional[str] = None,
        show_bank_details: bool = True,
        show_tax_id: bool = True,
        reference: Optional[str] = None,
        payment_schedule: Optional[list[dict]] = None,
        due_date: Optional[datetime] = None,
        rules: Optional[list] = None,
        notes: Optional[str] = None,
        signature_name: Optional[str] = None,
        accepted_at: Optional[datetime] = None,
        provider_signature_name: Optional[str] = None,
        provider_signed_at: Optional[datetime] = None,
        signature_revision: int = 1,
    ) -> str:
        # ✅ CHANGÉ : default tax_rate à 0 au lieu de 20
        if items is None:
            items = [{"description": "Exemple", "quantity": 1, "unit_price_cents": 0, "tax_rate": 0}]
        if type == DocumentType.CONTRAT:
            items = items or []

        if template_id:
            template = await TemplateService.get_by_id(db, template_id, user.id)
            if not template:
                template = DocumentService._build_fallback_template(user.id, layout_style)
        else:
            template = DocumentTemplate(
                id=uuid4(),
                name="Aperçu",
                user_id=user.id,
                layout_style=layout_style,
                primary_color=primary_color,
                secondary_color=secondary_color,
                accent_color=accent_color,
                text_color=text_color,
                background_color=background_color,
                font_family=font_family,
                header_text=header_text,
                footer_text=footer_text,
                show_bank_details=show_bank_details,
                show_tax_id=show_tax_id,
            )

        doc_id = uuid4()
        fake_doc = Document(
            id=doc_id,
            type=type,
            status=DocumentStatus.DRAFT,
            number=reference or DocumentService.preview_number(type),
            created_at=to_naive_utc(datetime.now(timezone.utc)),
            due_date=to_naive_utc(due_date),
            notes=notes,
            rules=DocumentService.encode_rules(rules),
            layout_style=layout_style,
            primary_color=primary_color,
            user_id=user.id,
            client_id=uuid4(),
            signature_name=signature_name,
            accepted_at=to_naive_utc(accepted_at) if accepted_at else None,
            provider_signature_name=provider_signature_name,
            provider_signed_at=to_naive_utc(provider_signed_at) if provider_signed_at else None,
            signature_revision=signature_revision or 1,
        )

        fake_doc.items = [
            DocumentItem(
                id=uuid4(),
                description=item.get("description", ""),
                quantity=item.get("quantity", 1),
                unit_price_cents=item.get("unit_price_cents", 0),
                tax_rate=item.get("tax_rate", 0),  # ✅ CHANGÉ : default à 0
                document_id=doc_id,
            )
            for item in items
        ]

        if payment_schedule:
            totals = DocumentService.calculate_totals(fake_doc.items)
            
            fake_doc.payment_schedule = [
                PaymentSchedule(
                    id=uuid4(),
                    document_id=doc_id,
                    sequence=ms.get("sequence", idx + 1),
                    title=ms.get("title", f"Échéance {idx + 1}"),
                    percent=ms.get("percent", 0),
                    amount_cents=int(round(totals["grand_total_cents"] * ms.get("percent", 0) / 100)),
                    description=ms.get("description"),
                    trigger_date=DocumentService._parse_trigger_date(ms.get("trigger_date")),
                    status="PENDING",
                )
                for idx, ms in enumerate(payment_schedule)
            ]
        else:
            fake_doc.payment_schedule = []

        fake_client = Client(
            id=uuid4(),
            name=client_name,
            email=client_email,
            address=client_address,
            phone=client_phone,
            user_id=user.id,
        )

        return pdf_renderer.render_html_preview(
            document=fake_doc,
            template=template,
            user=user,
            client=fake_client,
        )

    @staticmethod
    async def create_document(
        db: AsyncSession,
        type: DocumentType,
        user_id: UUID,
        client_id: UUID,
        items: list[dict],
        layout_style: str = "classic",
        template_id: Optional[UUID] = None,
        due_date: Optional[datetime] = None,
        notes: Optional[str] = None,
        document_id: Optional[UUID] = None,
        project_id: Optional[UUID] = None,
        invoice_type: Optional[InvoiceType] = None,
        source_document_id: Optional[UUID] = None,
        origin: str = "manual",
        rules: Optional[list] = None,
    ) -> Document:
        logger.info(f"🔨 create_document appelé avec document_id={document_id}, layout={layout_style}")

        if type == DocumentType.CONTRAT:
            layout_style = normalize_contract_layout(layout_style)
            if not rules:
                rules = default_rules_for(layout_style)

        if document_id:
            existing = await db.execute(
                select(Document).where(Document.id == document_id)
            )
            existing_doc = existing.scalar_one_or_none()

            if existing_doc:
                logger.info(f"📄 Document {document_id} existe déjà, mise à jour")
                existing_doc.type = type
                existing_doc.client_id = client_id
                existing_doc.layout_style = layout_style
                existing_doc.template_id = template_id
                existing_doc.due_date = to_naive_utc(due_date)
                existing_doc.notes = notes
                if rules is not None:
                    existing_doc.rules = DocumentService.encode_rules(rules)
                existing_doc.project_id = project_id
                existing_doc.invoice_type = invoice_type
                existing_doc.source_document_id = source_document_id
                existing_doc.origin = origin

                for old_item in list(existing_doc.items):
                    await db.delete(old_item)
                await db.flush()

                for item_data in items:
                    item = DocumentItem(
                        description=item_data["description"],
                        quantity=item_data.get("quantity", 1),
                        unit_price_cents=item_data["unit_price_cents"],
                        tax_rate=item_data.get("tax_rate", 0),  # ✅ CHANGÉ : default à 0
                        document_id=existing_doc.id,
                    )
                    db.add(item)

                await db.flush()
                await db.refresh(existing_doc, ['items'])
                return existing_doc

        if template_id:
            tmpl = await db.execute(
                select(DocumentTemplate).where(
                    DocumentTemplate.id == template_id,
                    DocumentTemplate.user_id == user_id,
                )
            )
            if not tmpl.scalar_one_or_none():
                raise ValueError("Template introuvable")

        number = await DocumentService._generate_number(db, type, user_id)
        now_utc = to_naive_utc(datetime.now(timezone.utc))
        due_date_utc = to_naive_utc(due_date)

        document = Document(
            id=document_id or uuid4(),
            type=type,
            status=DocumentStatus.DRAFT,
            number=number,
            user_id=user_id,
            client_id=client_id,
            layout_style=layout_style,
            template_id=template_id,
            created_at=now_utc,
            due_date=due_date_utc,
            notes=notes,
            rules=DocumentService.encode_rules(rules) if rules is not None else None,
            project_id=project_id,
            invoice_type=invoice_type,
            source_document_id=source_document_id,
            origin=origin,
        )
        db.add(document)
        await db.flush()

        for item_data in items:
            item = DocumentItem(
                description=item_data["description"],
                quantity=item_data.get("quantity", 1),
                unit_price_cents=item_data["unit_price_cents"],
                tax_rate=item_data.get("tax_rate", 0),  # ✅ CHANGÉ : default à 0
                document_id=document.id,
            )
            db.add(item)

        await db.flush()
        await db.refresh(document, ['items'])
        return document

    @staticmethod
    async def get_by_id(db: AsyncSession, document_id: UUID, user_id: UUID) -> Document | None:
        statement = (
            select(Document)
            .options(selectinload(Document.items),
            selectinload(Document.client),
            selectinload(Document.payment_schedule))
            .where(Document.id == document_id, Document.user_id == user_id)
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        db: AsyncSession,
        user_id: UUID,
        type: Optional[DocumentType] = None,
        status: Optional[DocumentStatus] = None,
        client_id: Optional[UUID] = None,
        project_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Document]:
        statement = (
            select(Document)
            .options(selectinload(Document.items), selectinload(Document.client),selectinload(Document.payment_schedule))
            .where(Document.user_id == user_id)
        )
        if type:
            statement = statement.where(Document.type == type)
        if status:
            statement = statement.where(Document.status == status)
        if client_id:
            statement = statement.where(Document.client_id == client_id)
        if project_id:
            statement = statement.where(Document.project_id == project_id)

        statement = statement.order_by(Document.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(statement)
        return list(result.scalars().all())

    @staticmethod
    async def update_status(db, document, new_status):
        valid_transitions = {
            DocumentStatus.DRAFT: [DocumentStatus.SENT],
            DocumentStatus.SENT: [DocumentStatus.VIEWED, DocumentStatus.PAID],
            DocumentStatus.VIEWED: [DocumentStatus.PAID],
            DocumentStatus.PAID: [],
        }
        if new_status not in valid_transitions.get(document.status, []):
            raise ValueError(f"Transition invalide : {document.status.value} → {new_status.value}")
        document.status = new_status
        db.add(document)
        await db.flush()
        await db.refresh(document)
        return document

    @staticmethod
    def _contract_content_snapshot(document) -> tuple:
        items = tuple(
            (
                getattr(item, "description", ""),
                getattr(item, "quantity", 1),
                getattr(item, "unit_price_cents", 0),
                getattr(item, "tax_rate", 0),
            )
            for item in (document.items or [])
        )
        due = document.due_date
        due_key = due.strftime("%Y-%m-%d") if hasattr(due, "strftime") else (str(due)[:10] if due else None)
        layout = getattr(document, "layout_style", None)
        if document.type == DocumentType.CONTRAT:
            layout = normalize_contract_layout(layout)
        return (
            document.notes,
            getattr(document, "rules", None),
            layout,
            due_key,
            str(document.client_id) if document.client_id else None,
            (getattr(document, "primary_color", None) or "").lower(),
            items,
        )

    @staticmethod
    def invalidate_contract_signatures(document) -> bool:
        if document.type != DocumentType.CONTRAT:
            return False
        had_signature = bool(
            document.signature_name
            or getattr(document, "provider_signature_name", None)
            or document.accepted_at
            or document.status in (DocumentStatus.ACCEPTED, DocumentStatus.REFUSED)
        )
        if not had_signature:
            return False
        document.signature_name = None
        document.accepted_at = None
        document.provider_signature_name = None
        document.provider_signed_at = None
        document.refused_at = None
        document.refusal_reason = None
        document.signature_revision = (getattr(document, "signature_revision", 1) or 1) + 1
        if document.status in (DocumentStatus.ACCEPTED, DocumentStatus.REFUSED):
            document.status = DocumentStatus.DRAFT
        return True

    @staticmethod
    async def update_document(db, document, client_id=None, template_id=None, layout_style=None,
                               due_date=None, items=None, notes=None,
                               primary_color=None, secondary_color=None, accent_color=None,
                               background_color=None, text_color=None, font_family=None,
                               show_bank_details=None, show_tax_id=None, project_id=None,
                               source_document_id=None, clear_source_document_id=False,
                               rules=None):
        previous_snapshot = DocumentService._contract_content_snapshot(document)
        if client_id is not None: document.client_id = client_id
        if project_id is not None: document.project_id = project_id
        if clear_source_document_id:
            document.source_document_id = None
        elif source_document_id is not None:
            document.source_document_id = source_document_id
        if template_id is not None: document.template_id = template_id
        if layout_style is not None: document.layout_style = layout_style
        if due_date is not None: document.due_date = to_naive_utc(due_date)
        if notes is not None: document.notes = notes
        if rules is not None: document.rules = DocumentService.encode_rules(rules)
        if primary_color is not None: document.primary_color = primary_color
        if secondary_color is not None: document.secondary_color = secondary_color
        if accent_color is not None: document.accent_color = accent_color
        if background_color is not None: document.background_color = background_color
        if text_color is not None: document.text_color = text_color
        if font_family is not None: document.font_family = font_family
        if show_bank_details is not None: document.show_bank_details = show_bank_details
        if show_tax_id is not None: document.show_tax_id = show_tax_id

        if items is not None:
            for old_item in list(document.items):
                await db.delete(old_item)
            await db.flush()
            document.items = []
            for item_data in items:
                item = DocumentItem(
                    description=item_data["description"],
                    quantity=item_data.get("quantity", 1),
                    unit_price_cents=item_data["unit_price_cents"],
                    tax_rate=item_data.get("tax_rate", 0),  # ✅ CHANGÉ : default à 0
                    document_id=document.id,
                )
                db.add(item)
        signatures_reset = False
        if document.type == DocumentType.CONTRAT:
            next_snapshot = DocumentService._contract_content_snapshot(document)
            if next_snapshot != previous_snapshot:
                signatures_reset = DocumentService.invalidate_contract_signatures(document)
        setattr(document, "_signatures_reset", signatures_reset)
        pdf_renderer.invalidate_document_cache(document.id)
        await db.commit()
        await db.refresh(document, ['items'])
        return document

    @staticmethod
    async def delete_document(db, document_id, user_id):
        from sqlalchemy.orm import selectinload
        result = await db.execute(
            select(Document)
            .options(selectinload(Document.items), selectinload(Document.reminder_logs), selectinload(Document.views))
            .where(Document.id == document_id, Document.user_id == user_id)
        )
        document = result.scalar_one_or_none()
        if not document:
            raise ValueError("Document introuvable")
        if document.status != DocumentStatus.DRAFT:
            raise ValueError("Seuls les brouillons peuvent être supprimés")
        await db.delete(document)
        await db.commit()
        pdf_renderer.invalidate_document_cache(document_id)

    @staticmethod
    async def duplicate_as_invoice(db, document):
        if document.type != DocumentType.DEVIS:
            raise ValueError("Seuls les devis peuvent être convertis en facture")
        await db.refresh(document, ['items'])
        items_data = [
            {"description": i.description, "quantity": i.quantity,
             "unit_price_cents": i.unit_price_cents, "tax_rate": i.tax_rate}
            for i in document.items
        ]
        return await DocumentService.create_document(
            db=db, type=DocumentType.FACTURE, user_id=document.user_id,
            client_id=document.client_id, items=items_data,
            layout_style=getattr(document, 'layout_style', 'classic'),
            template_id=document.template_id, due_date=document.due_date,
            notes=document.notes,
            invoice_type=InvoiceType.STANDARD,
            source_document_id=document.id,
            origin="manual",
        )

    @staticmethod
    def calculate_totals(items):
        subtotal_cents = 0
        tax_total_cents = 0
        for item in items or []:
            line_subtotal = item.quantity * item.unit_price_cents
            line_tax = int(line_subtotal * item.tax_rate / 100)
            subtotal_cents += line_subtotal
            tax_total_cents += line_tax
        return {
            "subtotal_cents": subtotal_cents,
            "tax_total_cents": tax_total_cents,
            "grand_total_cents": subtotal_cents + tax_total_cents,
        }

    @staticmethod
    async def _generate_number(db, type, user_id):
        prefix = DocumentService.number_prefix(type)
        now_utc = to_naive_utc(datetime.now(timezone.utc))
        year = now_utc.year
        count_stmt = (
            select(func.count(Document.id))
            .where(
                Document.user_id == user_id,
                Document.type == type,
                func.extract('year', Document.created_at) == year,
            )
        )
        result = await db.execute(count_stmt)
        count = result.scalar() or 0
        return f"{prefix}-{year}-{count + 1:03d}"

    @staticmethod
    def number_prefix(type: DocumentType) -> str:
        if type == DocumentType.DEVIS:
            return "DEV"
        if type == DocumentType.CONTRAT:
            return "CTR"
        return "FACT"

    @staticmethod
    def preview_number(type: DocumentType) -> str:
        return f"{DocumentService.number_prefix(type)}-2026-001"

    @staticmethod
    async def resolve_quote_contract_link(
        db: AsyncSession,
        user_id: UUID,
        contract_id: UUID,
        client_id: UUID,
        project_id: Optional[UUID] = None,
    ) -> Document:
        """Le devis pointe vers un contrat du même projet. Le contrat ne pointe pas vers le devis."""
        contract = await DocumentService.get_by_id(db, contract_id, user_id)
        if not contract or contract.type != DocumentType.CONTRAT:
            raise ValueError("Le contrat est introuvable")
        if contract.client_id != client_id:
            raise ValueError("Le contrat n'appartient pas à ce client")
        if project_id and contract.project_id and contract.project_id != project_id:
            raise ValueError("Le contrat n'appartient pas à ce projet")
        return contract

    @staticmethod
    def _build_fallback_template(user_id: UUID, layout_style: str = "classic") -> DocumentTemplate:
        return DocumentTemplate(
            id=uuid4(),
            name="Par défaut",
            user_id=user_id,
            layout_style=layout_style,
            primary_color="#2563EB",
            secondary_color="#1E40AF",
            accent_color="#DBEAFE",
            text_color="#1F2937",
            background_color="#FFFFFF",
            font_family="Inter",
            show_bank_details=True,
            show_tax_id=True,
        )