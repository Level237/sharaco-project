from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone
from enum import Enum


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class ReminderStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"


class ReminderConfig(SQLModel, table=True):
    """Configuration des relances automatiques par utilisateur."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    owner: "User" = Relationship(back_populates="reminder_configs")

    # Relance 1 : J+2 — reçu ?
    reminder_1_enabled: bool = Field(default=True, description="Activer la relance 1")
    reminder_1_days: int = Field(default=2, description="Jours après envoi du devis")
    reminder_1_subject: str = Field(
        default="Vous avez bien reçu le devis {number} ?",
        description="Sujet (placeholders : {number}, {company}, {expiry})",
    )

    # Relance 2 : J+5 — questions ?
    reminder_2_enabled: bool = Field(default=True, description="Activer la relance 2")
    reminder_2_days: int = Field(default=5, description="Jours après envoi du devis")
    reminder_2_subject: str = Field(
        default="Une question sur le devis {number} ?",
        description="Sujet de l'email",
    )

    # Relance 3 : J+10 — dernier rappel
    reminder_3_enabled: bool = Field(default=True, description="Activer la relance 3")
    reminder_3_days: int = Field(default=10, description="Jours après envoi du devis")
    reminder_3_subject: str = Field(
        default="Dernier rappel : le devis {number} expire bientôt",
        description="Sujet de l'email",
    )

    is_active: bool = Field(default=True, description="Activer les relances devis auto")
    stop_on_view: bool = Field(default=True, description="Arrêter si le client ouvre le devis")
    stop_on_payment: bool = Field(
        default=True,
        description="Arrêter si le devis est accepté ou refusé",
    )

    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)


class ReminderLog(SQLModel, table=True):
    """Historique des relances envoyées."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    document_id: UUID = Field(foreign_key="document.id", index=True)
    document: "Document" = Relationship(back_populates="reminder_logs")

    reminder_level: int = Field(description="Niveau de relance (1, 2 ou 3)")
    status: ReminderStatus = Field(default=ReminderStatus.PENDING)
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None


class DocumentView(SQLModel, table=True):
    """Tracking des ouvertures de documents."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    document_id: UUID = Field(foreign_key="document.id", index=True)
    document: "Document" = Relationship(back_populates="views")

    viewed_at: datetime = Field(default_factory=_utcnow)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None