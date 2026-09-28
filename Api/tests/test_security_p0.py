# Api/tests/test_security_p0.py
import unittest
import asyncio
from datetime import datetime, timezone, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
from fastapi import HTTPException
from app.api.v1.reminder import public_document_view, track_pixel
from app.utils.datetime import to_naive_utc


class TestSecurityVULN001(unittest.TestCase):
    """Vérifie la remédiation de la faille critique VULN-001 (IDOR sur les relances publiques)."""

    def setUp(self):
        self.doc_id = uuid4()
        self.user_id = uuid4()
        self.client_id = uuid4()
        self.valid_share_token = "sec_share_tok_1234567890abcdefghijklmnopqrstuvwxyz"
        self.valid_client_token = "sec_client_tok_0987654321zyxwvutsrqponmlkjihgfedcba"

    def test_idor_attempt_with_raw_uuid_fails(self):
        """Un attaquant fournissant un UUID brut sans token valide reçoit 404."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        async def run():
            with self.assertRaises(HTTPException) as cm:
                await public_document_view(
                    token=str(self.doc_id),
                    db=mock_db,
                    request=None,
                )
            self.assertEqual(cm.exception.status_code, 404)
            self.assertIn("Document introuvable", cm.exception.detail)

        asyncio.run(run())

    def test_public_view_with_share_disabled_returns_403(self):
        """Un document dont le partage est désactivé renvoie 403."""
        mock_doc = SimpleNamespace(
            id=self.doc_id,
            user_id=self.user_id,
            client_id=self.client_id,
            share_token=self.valid_share_token,
            client_token=None,
            share_enabled=False,
            share_expires_at=None,
            template_id=None,
        )
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_doc
        mock_db.execute.return_value = mock_result

        async def run():
            with self.assertRaises(HTTPException) as cm:
                await public_document_view(
                    token=self.valid_share_token,
                    db=mock_db,
                    request=None,
                )
            self.assertEqual(cm.exception.status_code, 403)
            self.assertIn("désactivé", cm.exception.detail)

        asyncio.run(run())

    def test_public_view_with_expired_token_returns_410(self):
        """Un lien de document expiré renvoie 410 Gone."""
        expired_date = to_naive_utc(datetime.now(timezone.utc) - timedelta(days=2))
        mock_doc = SimpleNamespace(
            id=self.doc_id,
            user_id=self.user_id,
            client_id=self.client_id,
            share_token=self.valid_share_token,
            client_token=None,
            share_enabled=True,
            share_expires_at=expired_date,
            template_id=None,
        )
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_doc
        mock_db.execute.return_value = mock_result

        async def run():
            with self.assertRaises(HTTPException) as cm:
                await public_document_view(
                    token=self.valid_share_token,
                    db=mock_db,
                    request=None,
                )
            self.assertEqual(cm.exception.status_code, 410)
            self.assertIn("expiré", cm.exception.detail)

        asyncio.run(run())

    def test_public_view_with_valid_token_success(self):
        """Un token valide et actif permet d'afficher le document et injecte le pixel sécurisé."""
        future_date = to_naive_utc(datetime.now(timezone.utc) + timedelta(days=10))
        mock_doc = SimpleNamespace(
            id=self.doc_id,
            user_id=self.user_id,
            client_id=self.client_id,
            share_token=self.valid_share_token,
            client_token=None,
            share_enabled=True,
            share_expires_at=future_date,
            template_id=None,
        )
        mock_user = SimpleNamespace(id=self.user_id, email="pro@sharaco.com")
        mock_client = SimpleNamespace(id=self.client_id, name="Client Test")
        mock_template = SimpleNamespace(id=uuid4(), name="Default")

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_doc
        mock_db.execute.return_value = mock_result

        async def run():
            with patch("app.services.reminderService.reminder_service.track_view", new_callable=AsyncMock) as mock_track, \
                 patch("app.services.userService.UserService.get_by_id", new_callable=AsyncMock) as mock_get_user, \
                 patch("app.services.clientService.ClientService.get_by_id", new_callable=AsyncMock) as mock_get_client, \
                 patch("app.api.v1.reminder._get_doc_template", new_callable=AsyncMock) as mock_get_tmpl, \
                 patch("app.services.pdfRenderer.pdf_renderer.render_html", new_callable=AsyncMock) as mock_render:
                
                mock_get_user.return_value = mock_user
                mock_get_client.return_value = mock_client
                mock_get_tmpl.return_value = mock_template
                mock_render.return_value = "<html><body><h1>Facture</h1></body></html>"

                response = await public_document_view(
                    token=self.valid_share_token,
                    db=mock_db,
                    request=None,
                )

                self.assertEqual(response.status_code, 200)
                # Vérifier que le pixel de tracking contient le token et PAS l'UUID brut
                self.assertIn(f"/api/v1/reminders/track/{self.valid_share_token}.png", response.body.decode())
                self.assertNotIn(str(self.doc_id), response.body.decode())
                mock_track.assert_awaited_once_with(mock_db, self.doc_id, None, None)

        asyncio.run(run())

    def test_track_pixel_with_invalid_token(self):
        """Un pixel appelé avec un token inconnu ne déclenche pas d'erreur mais ne trace rien."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        async def run():
            with patch("app.services.reminderService.reminder_service.track_view", new_callable=AsyncMock) as mock_track:
                response = await track_pixel(
                    token="invalid_token",
                    db=mock_db,
                    request=None,
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.media_type, "image/png")
                mock_track.assert_not_called()

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
