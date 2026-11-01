from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.services.specificationKinds import SPEC_KINDS, normalize_spec_color, normalize_spec_cover


class SpecBlock(BaseModel):
    type: Literal["paragraph", "table", "spacer", "list", "link", "image"]
    text: Optional[str] = None
    headers: Optional[list[str]] = None
    rows: Optional[list[list[str]]] = None
    size: Optional[Literal["sm", "md", "lg"]] = None
    style: Optional[Literal["bullet", "number"]] = None
    items: Optional[list[str]] = None
    label: Optional[str] = None
    url: Optional[str] = None
    caption: Optional[str] = None


class SpecSubsection(BaseModel):
    id: str
    title: str = ""
    blocks: list[SpecBlock] = Field(default_factory=list)


class SpecSection(BaseModel):
    id: str
    title: str = ""
    subsections: list[SpecSubsection] = Field(default_factory=list)


class SpecificationCreate(BaseModel):
    project_id: UUID
    kind: str
    cover_style: str = "spine"
    primary_color: str = "#2563EB"

    @field_validator("kind")
    @classmethod
    def kind_ok(cls, v: str) -> str:
        if v not in SPEC_KINDS:
            raise ValueError("Type de cahier des charges invalide")
        return v

    @field_validator("cover_style")
    @classmethod
    def cover_ok(cls, v: str) -> str:
        return normalize_spec_cover(v)

    @field_validator("primary_color")
    @classmethod
    def color_ok(cls, v: str) -> str:
        return normalize_spec_color(v)


class SpecificationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    cover_style: Optional[str] = None
    primary_color: Optional[str] = None
    sections: Optional[list[SpecSection]] = None
    version: Optional[int] = Field(None, ge=1)

    @field_validator("cover_style")
    @classmethod
    def cover_ok(cls, v: Optional[str]) -> Optional[str]:
        return normalize_spec_cover(v) if v else v

    @field_validator("primary_color")
    @classmethod
    def color_ok(cls, v: Optional[str]) -> Optional[str]:
        return normalize_spec_color(v) if v else v


class SpecificationRead(BaseModel):
    id: UUID
    project_id: UUID
    client_id: Optional[UUID] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    project_name: Optional[str] = None
    number: Optional[str] = None
    title: str
    kind: str
    cover_style: str
    primary_color: str
    version: int
    status: str
    sections: list[SpecSection]
    sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class SpecificationEmailRequest(BaseModel):
    custom_message: Optional[str] = Field("", max_length=1000)
    override_email: Optional[str] = None


class SpecificationPreview(BaseModel):
    project_id: UUID
    title: str = "Cahier des charges"
    kind: str = "mission"
    cover_style: str = "spine"
    primary_color: str = "#2563EB"
    version: int = 1
    number: Optional[str] = "CDC"
    sections: list[SpecSection] = Field(default_factory=list)

    @field_validator("kind")
    @classmethod
    def kind_ok(cls, v: str) -> str:
        return v if v in SPEC_KINDS else "mission"

    @field_validator("cover_style")
    @classmethod
    def cover_ok(cls, v: str) -> str:
        return normalize_spec_cover(v)

    @field_validator("primary_color")
    @classmethod
    def color_ok(cls, v: str) -> str:
        return normalize_spec_color(v)


class SpecificationTreeItem(BaseModel):
    id: UUID
    number: Optional[str] = None
    title: str
    kind: str
    cover_style: str
    primary_color: str
    status: str
    created_at: datetime
