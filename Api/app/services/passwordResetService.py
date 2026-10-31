from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, update

from app.core.config import settings
from app.core.security import hash_password
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.services.emailService import EmailService
from app.services.userService import UserService
from app.utils.datetime import to_naive_utc
from app.utils.emails import normalize_email

logger = logging.getLogger(__name__)

TOKEN_TTL = timedelta(hours=1)
MAX_EMAILS_PER_DAY = 3
MIN_SECONDS_BETWEEN_EMAILS = 60
GENERIC_REQUEST_MESSAGE = (
    "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé."
)
INVALID_LINK_MESSAGE = "Ce lien est invalide ou a expiré. Demandez-en un nouveau."


def _utcnow() -> datetime:
    return to_naive_utc(datetime.now(timezone.utc))


def hash_reset_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


class PasswordResetService:
    @staticmethod
    async def request_reset(db: AsyncSession, email: str) -> str:
        """Crée un jeton et envoie l'email. Ne révèle jamais si le compte existe."""
        try:
            normalized = normalize_email(email)
        except ValueError:
            return GENERIC_REQUEST_MESSAGE

        user = await UserService.get_by_email(db, normalized)
        if not user:
            return GENERIC_REQUEST_MESSAGE

        now = _utcnow()
        recent = await db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.created_at >= now - timedelta(hours=24),
            )
        )
        recent_tokens = list(recent.scalars().all())
        if len(recent_tokens) >= MAX_EMAILS_PER_DAY:
            logger.warning("Reset password: plafond journalier atteint pour user_id=%s", user.id)
            return GENERIC_REQUEST_MESSAGE

        last = max((t.created_at for t in recent_tokens), default=None)
        if last and (now - last).total_seconds() < MIN_SECONDS_BETWEEN_EMAILS:
            return GENERIC_REQUEST_MESSAGE

        await db.execute(
            update(PasswordResetToken)
            .where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at.is_(None),
            )
            .values(used_at=now)
        )

        raw_token = secrets.token_urlsafe(32)
        row = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_reset_token(raw_token),
            expires_at=now + TOKEN_TTL,
            created_at=now,
        )
        db.add(row)
        await db.commit()

        reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={raw_token}"
        result = await EmailService.send_password_reset(
            to_email=user.email,
            reset_url=reset_url,
            user_name=user.full_name or "",
        )
        if not result.get("success"):
            logger.error("Reset password: envoi email échoué pour user_id=%s", user.id)

        return GENERIC_REQUEST_MESSAGE

    @staticmethod
    async def reset_password(db: AsyncSession, raw_token: str, new_password: str) -> None:
        token_hash = hash_reset_token((raw_token or "").strip())
        now = _utcnow()
        result = await db.execute(
            select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
        )
        row = result.scalar_one_or_none()
        if not row or row.used_at is not None or row.expires_at <= now:
            raise ValueError(INVALID_LINK_MESSAGE)

        user_result = await db.execute(select(User).where(User.id == row.user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            raise ValueError(INVALID_LINK_MESSAGE)

        user.hashed_password = hash_password(new_password)
        row.used_at = now
        db.add(user)
        db.add(row)
        await db.execute(
            update(PasswordResetToken)
            .where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.id != row.id,
                PasswordResetToken.used_at.is_(None),
            )
            .values(used_at=now)
        )
        await db.commit()
        logger.info("Mot de passe réinitialisé pour user_id=%s", user.id)
