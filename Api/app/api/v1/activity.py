# app/api/v1/activity.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, union_all, literal_column, func
from datetime import datetime, timezone, timedelta
from uuid import UUID
from app.services.documentService import DocumentService
from app.models.document import DocumentType
from typing import Optional, List
from app.db.engine import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.models.projet import Project
from app.models.client import Client
from app.models.specification import Specification
from app.services.specificationKinds import spec_title
from sqlalchemy.orm import selectinload
import logging

router = APIRouter(tags=["activity"])
logger = logging.getLogger(__name__)


class ActivityItem:
    """Représente un élément d'activité."""
    def __init__(
        self,
        id: UUID,
        type: str,  # "PROJECT", "DOCUMENT"
        action: str,  # "CREATED", "UPDATED", "SENT", "ACCEPTED", "REFUSED"
        title: str,
        subtitle: Optional[str] = None,
        icon: str = "file",
        color: str = "slate",
        link: Optional[str] = None,
        timestamp: datetime = None,
        metadata: dict = None,
    ):
        self.id = id
        self.type = type
        self.action = action
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
        self.color = color
        self.link = link
        self.timestamp = timestamp
        self.metadata = metadata or {}


# app/api/v1/activity.py

@router.get("/", response_model=List[dict])
async def get_activity_feed(
    limit: int = Query(50, ge=1, le=100),
    type_filter: Optional[str] = Query(None, description="Filtrer par type: PROJECT, DOCUMENT"),
    action_filter: Optional[str] = Query(None, description="Filtrer par action"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Récupère l'historique d'activité récent."""
    logger.info(f"📊 GET /activity (limit={limit})")
    
    activities = []
    
    # ═══════════════════════════════════════════════
    # 1. Projets (inchangé)
    # ═══════════════════════════════════════════════
    if not type_filter or type_filter == "PROJECT":
        projects_query = await db.execute(
            select(Project)
            .where(Project.user_id == current_user.id)
            .order_by(Project.updated_at.desc())
            .limit(limit)
        )
        projects = projects_query.scalars().all()
        
        for project in projects:
            action = "CREATED" if project.created_at == project.updated_at else "UPDATED"
            if action_filter and action != action_filter:
                continue
            
            activities.append({
                "id": str(project.id),
                "type": "PROJECT",
                "action": action,
                "title": project.name,
                "subtitle": f"Projet {action.lower()}",
                "icon": "folder",
                "color": "blue",
                "link": f"/dashboard/projects/{project.id}",
                "timestamp": project.updated_at.isoformat(),
                "metadata": {
                    "status": project.status,
                    "client_id": str(project.client_id),
                }
            })
    
    # ═══════════════════════════════════════════════
    # 2. Documents avec gestion du PAID
    # ═══════════════════════════════════════════════
    if not type_filter or type_filter == "DOCUMENT":
        latest_event = func.greatest(
            Document.created_at,
            func.coalesce(Document.accepted_at, Document.created_at),
            func.coalesce(Document.refused_at, Document.created_at),
            func.coalesce(Document.sent_at, Document.created_at),
            func.coalesce(Document.viewed_at, Document.created_at),
            func.coalesce(Document.paid_at, Document.created_at),
            func.coalesce(Document.provider_signed_at, Document.created_at),
        )
        documents_query = await db.execute(
            select(Document)
            .options(selectinload(Document.client),selectinload(Document.items),)
            .where(Document.user_id == current_user.id)
            .order_by(latest_event.desc())
            .limit(limit * 2)
        )
        documents = documents_query.scalars().all()
        
        for doc in documents:
            client_name = doc.client.name if doc.client else "client"
            doc_type = doc.type.value if hasattr(doc.type, "value") else doc.type
            is_contract = doc.type == DocumentType.CONTRAT
            is_invoice = doc.type == DocumentType.FACTURE
            doc_link = (
                f"/dashboard/contracts/{doc.id}" if is_contract
                else f"/dashboard/quotes/{doc.id}" if doc.type == DocumentType.DEVIS
                else f"/dashboard/invoices/{doc.id}"
            )
            amount_cents = (
                DocumentService.calculate_totals(doc.items)["grand_total_cents"]
                if doc.items else 0
            )
            layout_style = getattr(doc, "layout_style", None) or ("classic" if is_contract else "modern")

            def append_activity(action, icon, color, subtitle, timestamp, event_status=None):
                if action_filter and action != action_filter:
                    return
                if timestamp is None:
                    timestamp = doc.created_at
                activities.append({
                    "id": str(doc.id),
                    "type": "DOCUMENT",
                    "action": action,
                    "title": doc.number or f"{doc_type} {str(doc.id)[:8]}",
                    "subtitle": subtitle,
                    "icon": icon,
                    "color": color,
                    "link": doc_link,
                    "timestamp": timestamp.isoformat(),
                    "metadata": {
                        "status": event_status or (doc.status.value if hasattr(doc.status, "value") else doc.status),
                        "document_type": doc_type,
                        "client_name": client_name,
                        "amount_cents": amount_cents,
                        "layout_style": layout_style,
                        "client_id": str(doc.client_id) if doc.client_id else None,
                        "project_id": str(doc.project_id) if getattr(doc, "project_id", None) else None,
                        "signature_name": getattr(doc, "signature_name", None),
                    },
                })

            if is_contract:
                append_activity(
                    "CREATED",
                    "scroll-text",
                    "blue",
                    f"Contrat créé pour {client_name}",
                    doc.created_at,
                    event_status="DRAFT",
                )
                if doc.status == DocumentStatus.DRAFT:
                    continue

            if doc.status == DocumentStatus.PAID and is_invoice:
                append_activity(
                    "PAID",
                    "banknote",
                    "emerald",
                    f"Facture payée par {client_name}",
                    doc.paid_at or doc.created_at,
                )
            elif doc.status == DocumentStatus.ACCEPTED:
                signer = doc.signature_name or client_name
                append_activity(
                    "ACCEPTED",
                    "check-circle",
                    "emerald",
                    f"Contrat signé par {signer}" if is_contract else f"Devis accepté par {signer}",
                    doc.accepted_at or doc.created_at,
                )
            elif doc.status == DocumentStatus.REFUSED:
                append_activity(
                    "REFUSED",
                    "x-circle",
                    "rose",
                    f"Contrat refusé par {client_name}" if is_contract else f"Devis refusé par {client_name}",
                    doc.refused_at or doc.created_at,
                )
            elif doc.status == DocumentStatus.SENT:
                append_activity(
                    "SENT",
                    "send",
                    "amber",
                    f"Contrat envoyé à {client_name}" if is_contract else f"Envoyé à {client_name}",
                    doc.sent_at or doc.created_at,
                )
            elif doc.status == DocumentStatus.VIEWED:
                append_activity(
                    "VIEWED",
                    "eye",
                    "sky",
                    f"Contrat consulté par {client_name}" if is_contract else f"Consulté par {client_name}",
                    doc.viewed_at or doc.created_at,
                )
            elif not is_contract:
                append_activity(
                    "CREATED",
                    "file",
                    "slate",
                    f"{'Facture créée' if is_invoice else 'Devis créé'} pour {client_name}",
                    doc.created_at,
                )

        latest_spec_event = func.greatest(
            Specification.created_at,
            func.coalesce(Specification.sent_at, Specification.created_at),
        )
        specs_query = await db.execute(
            select(Specification, Project, Client)
            .join(Project, Project.id == Specification.project_id)
            .outerjoin(Client, Client.id == Project.client_id)
            .where(Specification.user_id == current_user.id)
            .order_by(latest_spec_event.desc())
            .limit(limit)
        )
        for spec, project, client in specs_query.all():
            client_name = client.name if client else "client"
            spec_link = f"/dashboard/specifications/edit/{spec.id}"
            kind_label = spec_title(spec.kind)

            def append_spec(action, icon, color, subtitle, timestamp, event_status=None):
                if action_filter and action != action_filter:
                    return
                if timestamp is None:
                    timestamp = spec.created_at
                activities.append({
                    "id": str(spec.id),
                    "type": "DOCUMENT",
                    "action": action,
                    "title": spec.number or spec.title or "Cahier des charges",
                    "subtitle": subtitle,
                    "icon": icon,
                    "color": color,
                    "link": spec_link,
                    "timestamp": timestamp.isoformat(),
                    "metadata": {
                        "status": event_status or spec.status,
                        "document_type": "CDC",
                        "client_name": client_name,
                        "client_id": str(project.client_id) if project and project.client_id else None,
                        "project_id": str(spec.project_id),
                        "kind": spec.kind,
                        "kind_title": kind_label,
                        "cover_style": spec.cover_style,
                        "primary_color": spec.primary_color,
                    },
                })

            append_spec(
                "CREATED",
                "book-open",
                "blue",
                f"Cahier des charges créé pour {client_name}",
                spec.created_at,
                event_status="DRAFT",
            )
            if spec.status == "SENT" or spec.sent_at:
                append_spec(
                    "SENT",
                    "send",
                    "amber",
                    f"Cahier des charges envoyé à {client_name}",
                    spec.sent_at or spec.updated_at or spec.created_at,
                    event_status="SENT",
                )
    
    # ═══════════════════════════════════════════════
    # 3. Trier par timestamp (plus récent en premier)
    # ═══════════════════════════════════════════════
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # ═══════════════════════════════════════════════
    # 4. Limiter le résultat
    # ═══════════════════════════════════════════════
    return activities[:limit]