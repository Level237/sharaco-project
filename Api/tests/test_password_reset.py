import asyncio
import unittest
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.services.passwordResetService import (
    GENERIC_REQUEST_MESSAGE,
    INVALID_LINK_MESSAGE,
    PasswordResetService,
    hash_reset_token,
)
from app.utils.datetime import to_naive_utc


def _run(coro):
    return asyncio.run(coro)


class TestPasswordResetService(unittest.TestCase):
    def test_unknown_email_does_not_enumerate(self):
        db = AsyncMock()

        async def run():
            with patch(
                "app.services.passwordResetService.UserService.get_by_email",
                new=AsyncMock(return_value=None),
            ):
                message = await PasswordResetService.request_reset(db, "nobody@example.com")
            self.assertEqual(message, GENERIC_REQUEST_MESSAGE)
            db.add.assert_not_called()
            db.commit.assert_not_called()

        _run(run())

    def test_reset_rejects_unknown_token(self):
        db = AsyncMock()
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        db.execute.return_value = result

        async def run():
            with self.assertRaises(ValueError) as cm:
                await PasswordResetService.reset_password(db, "not-a-real-token-value-xx", "NouveauPass1")
            self.assertEqual(str(cm.exception), INVALID_LINK_MESSAGE)

        _run(run())

    def test_reset_rejects_expired_token(self):
        db = AsyncMock()
        now = to_naive_utc(datetime.now(timezone.utc))
        row = SimpleNamespace(
            id=uuid4(),
            user_id=uuid4(),
            used_at=None,
            expires_at=now - timedelta(minutes=1),
        )
        result = MagicMock()
        result.scalar_one_or_none.return_value = row
        db.execute.return_value = result

        async def run():
            with self.assertRaises(ValueError) as cm:
                await PasswordResetService.reset_password(db, "expired-token-value-xxxx", "NouveauPass1")
            self.assertEqual(str(cm.exception), INVALID_LINK_MESSAGE)
            db.commit.assert_not_called()

        _run(run())

    def test_hash_is_not_the_raw_token(self):
        raw = "super-secret-reset-token-value"
        digest = hash_reset_token(raw)
        self.assertNotEqual(raw, digest)
        self.assertEqual(len(digest), 64)
        self.assertEqual(digest, hash_reset_token(raw))
