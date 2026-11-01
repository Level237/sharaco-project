from datetime import datetime, timezone
import re
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse, Response, StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user
from app.db.engine import get_db
from app.models.projet import Project
from app.models.user import User
from app.schemas.specification import (
    SpecificationCreate,
    SpecificationEmailRequest,
    SpecificationPreview,
    SpecificationRead,
    SpecificationUpdate,
)
from app.services.emailService import EmailService
from app.services.specificationService import SpecificationService
from app.utils.datetime import to_naive_utc
import logging

router = APIRouter(tags=["specifications"])
logger = logging.getLogger(__name__)


def _pdf_filename(spec) -> str:
    raw = (getattr(spec, "title", None) or "").strip()
    cleaned = re.sub(r'[\\/*?:"<>|\r\n]+', "", raw)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" .")
    base = cleaned or getattr(spec, "number", None) or "Cahier des charges"
    return f"{base}.pdf"


@router.post("/preview", response_class=HTMLResponse)
async def preview_specification(
    payload: SpecificationPreview,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        html = await SpecificationService.render_preview_html(
            db, current_user, payload.model_dump()
        )
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return HTMLResponse(content=html)


@router.post("/", response_model=SpecificationRead, status_code=status.HTTP_201_CREATED)
async def create_specification(
    payload: SpecificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        spec = await SpecificationService.create(
            db,
            current_user.id,
            payload.project_id,
            payload.kind,
            payload.cover_style,
            payload.primary_color,
        )
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    project_result = await db.execute(
        select(Project).options(selectinload(Project.client)).where(Project.id == spec.project_id)
    )
    return SpecificationService.to_read(spec, project_result.scalar_one_or_none())


@router.get("/{spec_id}", response_model=SpecificationRead)
async def get_specification(
    spec_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    spec = await SpecificationService.get_by_id(db, spec_id, current_user.id)
    if not spec:
        raise HTTPException(status_code=404, detail="Cahier des charges introuvable")
    project_result = await db.execute(
        select(Project).options(selectinload(Project.client)).where(Project.id == spec.project_id)
    )
    project = project_result.scalar_one_or_none()
    return SpecificationService.to_read(spec, project)


@router.put("/{spec_id}", response_model=SpecificationRead)
async def update_specification(
    spec_id: UUID,
    payload: SpecificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    spec = await SpecificationService.get_by_id(db, spec_id, current_user.id)
    if not spec:
        raise HTTPException(status_code=404, detail="Cahier des charges introuvable")
    spec = await SpecificationService.update(db, spec, payload.model_dump(exclude_unset=True))
    return SpecificationService.to_read(spec)


@router.post("/{spec_id}/send-email")
async def send_specification_email(
    spec_id: UUID,
    email_data: SpecificationEmailRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    spec = await SpecificationService.get_by_id(db, spec_id, current_user.id)
    if not spec:
        raise HTTPException(status_code=404, detail="Cahier des charges introuvable")
    if spec.status not in ("DRAFT", "SENT"):
        raise HTTPException(
            status_code=400,
            detail=f"Ce cahier des charges ne peut pas être envoyé (statut actuel: {spec.status})",
        )

    project_result = await db.execute(
        select(Project).options(selectinload(Project.client)).where(Project.id == spec.project_id)
    )
    project = project_result.scalar_one_or_none()
    client = project.client if project else None
    to_email = email_data.override_email or (client.email if client else None)
    if not to_email:
        raise HTTPException(status_code=400, detail="Email du client requis")

    user_name = (
        getattr(current_user, "full_name", None)
        or getattr(current_user, "first_name", None)
        or current_user.email.split("@")[0]
    )
    user_company = getattr(current_user, "company_name", None) or "Sharaco"

    pdf_bytes = None
    try:
        pdf_buffer = await SpecificationService.render_pdf(db, spec)
        pdf_bytes = pdf_buffer.read()
    except Exception as e:
        logger.warning(f"⚠️ Impossible de générer le PDF CDC: {e}")

    try:
        result = await EmailService.send_cdc(
            to_email=to_email,
            client_name=getattr(client, "name", None) or "client",
            document_number=spec.number or str(spec.id)[:8],
            title=spec.title,
            user_name=user_name,
            user_company=user_company,
            custom_message=email_data.custom_message or "",
            pdf_bytes=pdf_bytes,
            pdf_filename=_pdf_filename(spec),
        )
    except Exception as e:
        logger.error(f"❌ Erreur envoi email CDC: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur d'envoi: {str(e)}")

    if not result.get("success"):
        err_msg = result.get("error", "Erreur inconnue")
        status_code = 503 if result.get("is_connection_error") else 500
        raise HTTPException(status_code=status_code, detail=f"Erreur d'envoi: {err_msg}")

    if spec.status == "DRAFT" or not spec.sent_at:
        spec.status = "SENT"
        spec.sent_at = to_naive_utc(datetime.now(timezone.utc))
        spec.updated_at = spec.sent_at
        db.add(spec)
        await db.commit()
        await db.refresh(spec)

    return {
        "message": "Email envoyé avec succès",
        "to_email": to_email,
        "document_number": spec.number,
        "pdf_attached": pdf_bytes is not None,
    }


@router.delete("/{spec_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_specification(
    spec_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    spec = await SpecificationService.get_by_id(db, spec_id, current_user.id)
    if not spec:
        raise HTTPException(status_code=404, detail="Cahier des charges introuvable")
    await SpecificationService.delete(db, spec)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{spec_id}/preview", response_class=HTMLResponse)
async def get_specification_preview(
    spec_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    spec = await SpecificationService.get_by_id(db, spec_id, current_user.id)
    if not spec:
        raise HTTPException(status_code=404, detail="Cahier des charges introuvable")
    html = await SpecificationService.render_html(db, spec)
    return HTMLResponse(content=html)


@router.get("/{spec_id}/pdf")
async def get_specification_pdf(
    spec_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    spec = await SpecificationService.get_by_id(db, spec_id, current_user.id)
    if not spec:
        raise HTTPException(status_code=404, detail="Cahier des charges introuvable")
    pdf_buffer = await SpecificationService.render_pdf(db, spec)
    filename = _pdf_filename(spec)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"},
    )


@router.get("/{spec_id}/preview.png")
async def get_specification_preview_png(
    spec_id: UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    spec = await SpecificationService.get_by_id(db, spec_id, current_user.id)
    if not spec:
        raise HTTPException(status_code=404, detail="Cahier des charges introuvable")
    etag = f'"{spec.id}-{spec.updated_at.isoformat()}"'
    if_none_match = request.headers.get("if-none-match")
    if if_none_match and (if_none_match == etag or if_none_match == f"W/{etag}"):
        return Response(status_code=status.HTTP_304_NOT_MODIFIED, headers={"ETag": etag})
    png_bytes = await SpecificationService.render_png(db, spec)
    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={
            "ETag": etag,
            "Cache-Control": "private, max-age=300",
            "Content-Disposition": f'inline; filename="preview-{spec_id}.png"',
        },
    )
