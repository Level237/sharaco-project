from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class PasswordResetToken(SQLModel, table=True):
    __tablename__ = "password_reset_token"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True, nullable=False)
    token_hash: str = Field(max_length=64, unique=True, index=True, nullable=False)
    expires_at: datetime = Field(nullable=False, index=True)
    used_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=_utcnow_naive, nullable=False)
