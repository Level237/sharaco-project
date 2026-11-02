from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from html import escape
from io import BytesIO
from types import SimpleNamespace
from urllib.parse import urlparse
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.projet import Project
from app.models.specification import Specification
from app.models.user import User
from app.services.pdfRenderer import pdf_renderer
from app.services.specificationPaging import build_page_map, css_content
from app.services.specificationKinds import (
    default_sections_for,
    normalize_spec_color,
    normalize_spec_cover,
    normalize_spec_kind,
    spec_title,
)
from app.utils.datetime import to_naive_utc

logger = logging.getLogger(__name__)
_BOLD = re.compile(r"\*\*(.+?)\*\*")


def dump_sections(sections: list | None) -> list[dict]:
    out: list[dict] = []
    for section in sections or []:
        if hasattr(section, "model_dump"):
            out.append(section.model_dump())
        elif isinstance(section, dict):
            out.append(section)
    return out


def encode_sections(sections: list | None) -> str:
    return json.dumps(dump_sections(sections), ensure_ascii=False)


def decode_sections(raw: str | None) -> list[dict]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return []
    return data if isinstance(data, list) else []


def inline_html(text: str) -> str:
    escaped = escape(text or "")
    return _BOLD.sub(r"<strong>\1</strong>", escaped)


def safe_href(url: str | None) -> str:
    raw = (url or "").strip()
    parsed = urlparse(raw)
    if parsed.scheme in ("http", "https") and parsed.netloc:
        return escape(raw, quote=True)
    return ""


class SpecificationService:
    @staticmethod
    async def _generate_number(db: AsyncSession, user_id: UUID) -> str:
        now = to_naive_utc(datetime.now(timezone.utc))
        count_stmt = (
            select(func.count(Specification.id)).where(
                Specification.user_id == user_id,
                func.extract("year", Specification.created_at) == now.year,
            )
        )
        count = (await db.execute(count_stmt)).scalar() or 0
        return f"CDC-{now.year}-{count + 1:03d}"

    @staticmethod
    async def create(
        db: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        kind: str,
        cover_style: str,
        primary_color: str,
    ) -> Specification:
        project = await db.execute(
            select(Project).where(Project.id == project_id, Project.user_id == user_id)
        )
        if not project.scalar_one_or_none():
            raise LookupError("Projet introuvable")
        kind = normalize_spec_kind(kind)
        spec = Specification(
            user_id=user_id,
            project_id=project_id,
            number=await SpecificationService._generate_number(db, user_id),
            title=spec_title(kind),
            kind=kind,
            cover_style=normalize_spec_cover(cover_style),
            primary_color=normalize_spec_color(primary_color),
            sections=encode_sections(default_sections_for(kind)),
        )
        db.add(spec)
        await db.commit()
        await db.refresh(spec)
        return spec

    @staticmethod
    async def get_by_id(db: AsyncSession, spec_id: UUID, user_id: UUID) -> Specification | None:
        result = await db.execute(
            select(Specification).where(Specification.id == spec_id, Specification.user_id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_for_project(db: AsyncSession, project_id: UUID, user_id: UUID) -> list[Specification]:
        result = await db.execute(
            select(Specification)
            .where(Specification.project_id == project_id, Specification.user_id == user_id)
            .order_by(Specification.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def update(db: AsyncSession, spec: Specification, data: dict) -> Specification:
        if "title" in data and data["title"]:
            spec.title = data["title"].strip()
        if "cover_style" in data and data["cover_style"]:
            spec.cover_style = normalize_spec_cover(data["cover_style"])
        if "primary_color" in data and data["primary_color"]:
            spec.primary_color = normalize_spec_color(data["primary_color"])
        if "sections" in data and data["sections"] is not None:
            spec.sections = encode_sections(dump_sections(data["sections"]))
        if "version" in data and data["version"]:
            spec.version = data["version"]
        spec.updated_at = to_naive_utc(datetime.now(timezone.utc))
        db.add(spec)
        await db.commit()
        await db.refresh(spec)
        return spec

    @staticmethod
    async def delete(db: AsyncSession, spec: Specification) -> None:
        await db.delete(spec)
        await db.commit()

    @staticmethod
    async def load_context(db: AsyncSession, spec: Specification) -> dict:
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.client))
            .where(Project.id == spec.project_id)
        )
        project = result.scalar_one_or_none()
        user = await db.get(User, spec.user_id)
        client = project.client if project else None
        sections = decode_sections(spec.sections)
        page_map = build_page_map(sections)
        return {
            "spec": spec,
            "project": project,
            "user": user,
            "client": client,
            "kind_title": spec_title(spec.kind),
            "accent": spec.primary_color or "#2563EB",
            "cover_style": spec.cover_style,
            "sections": sections,
            "created_label": spec.created_at.strftime("%d/%m/%Y") if spec.created_at else "",
            "page_map": page_map,
            "footer_title": css_content(spec.title or spec.number or "Cahier des charges"),
        }

    @staticmethod
    def to_read(spec: Specification, project: Project | None = None) -> dict:
        client = getattr(project, "client", None) if project else None
        return {
            "id": spec.id,
            "project_id": spec.project_id,
            "client_id": getattr(project, "client_id", None),
            "client_name": getattr(client, "name", None),
            "client_email": getattr(client, "email", None),
            "project_name": getattr(project, "name", None),
            "number": spec.number,
            "title": spec.title,
            "kind": spec.kind,
            "cover_style": spec.cover_style,
            "primary_color": spec.primary_color,
            "version": spec.version,
            "status": spec.status,
            "sections": decode_sections(spec.sections),
            "sent_at": spec.sent_at,
            "created_at": spec.created_at,
            "updated_at": spec.updated_at,
        }

    @staticmethod
    async def render_html(db: AsyncSession, spec: Specification) -> str:
        ctx = await SpecificationService.load_context(db, spec)
        tmpl = pdf_renderer.env.get_template("cdc.html")
        return tmpl.render(**ctx, inline_html=inline_html, safe_href=safe_href)

    @staticmethod
    async def render_preview_html(db: AsyncSession, user: User, payload: dict) -> str:
        project_id = payload["project_id"]
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.client))
            .where(Project.id == project_id, Project.user_id == user.id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise LookupError("Projet introuvable")
        kind = normalize_spec_kind(payload.get("kind"))
        spec = SimpleNamespace(
            title=payload.get("title") or spec_title(kind),
            number=payload.get("number") or "CDC",
            version=payload.get("version") or 1,
            kind=kind,
            cover_style=normalize_spec_cover(payload.get("cover_style")),
            primary_color=normalize_spec_color(payload.get("primary_color")),
            created_at=datetime.now(timezone.utc),
        )
        sections = dump_sections(payload.get("sections"))
        tmpl = pdf_renderer.env.get_template("cdc.html")
        return tmpl.render(
            spec=spec,
            project=project,
            user=user,
            client=project.client,
            kind_title=spec_title(kind),
            accent=spec.primary_color,
            cover_style=spec.cover_style,
            sections=sections,
            created_label=spec.created_at.strftime("%d/%m/%Y"),
            page_map=build_page_map(sections),
            footer_title=css_content(spec.title or spec.number or "Cahier des charges"),
            inline_html=inline_html,
            safe_href=safe_href,
        )

    @staticmethod
    async def render_pdf(db: AsyncSession, spec: Specification) -> BytesIO:
        html = await SpecificationService.render_html(db, spec)
        return await pdf_renderer.render_pdf_from_html(
            html,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
        )

    @staticmethod
    async def render_png(db: AsyncSession, spec: Specification) -> bytes:
        html = await SpecificationService.render_html(db, spec)
        return await pdf_renderer.render_png_from_html(html, full_page=False)
