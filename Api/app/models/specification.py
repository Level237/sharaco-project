from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Specification(SQLModel, table=True):
    __tablename__ = "specification"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True, nullable=False)
    project_id: UUID = Field(foreign_key="project.id", index=True, nullable=False)
    number: Optional[str] = Field(default=None, index=True, max_length=40)
    title: str = Field(max_length=255)
    kind: str = Field(max_length=32, index=True)
    cover_style: str = Field(default="spine", max_length=32)
    primary_color: str = Field(default="#2563EB", max_length=7)
    version: int = Field(default=1)
    status: str = Field(default="DRAFT", max_length=20)
    sections: str = Field(default="[]")
    sent_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=_utcnow_naive)
    updated_at: datetime = Field(default_factory=_utcnow_naive)
