# Api/tests/test_security_oauth_token.py
import unittest
import asyncio
import time
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from jose import jwt
from app.services.authService import AuthService
from app.core.deps import get_current_user
from app.core.config import settings


class TestSecurityOAuthAndTokenProtection(unittest.TestCase):
    """
    Tests de validation de la sécurité de l'authentification :
    - VULN-002 : Échange de code OAuth à usage unique éphémère (anti-leak dans l'URL).
    - VULN-004 : Interdiction du passage du JWT en paramètre de requête (?token=...) et support du cookie sécurisé.
    """

    def setUp(self):
        self.mock_jwt = "mock.jwt.token_example_value_12345"
        self.user_id = "123e4567-e89b-12d3-a456-426614174000"
        self.valid_jwt = jwt.encode({"sub": self.user_id}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        self.mock_user = SimpleNamespace(id=self.user_id, email="pro@sharaco.com")

    # ═══════════════════════════════════════════════════════════════
    # VULN-002 : Échange de code OAuth à usage unique
    # ═══════════════════════════════════════════════════════════════

    def test_oauth_code_creation_and_one_time_consumption(self):
        """Un code d'échange OAuth est à usage unique et retourne le token d'accès."""
        code = AuthService.create_oauth_exchange_code(self.mock_jwt)
        self.assertIsInstance(code, str)
        self.assertGreaterEqual(len(code), 32)

        # Première consommation -> Succès
        token = AuthService.consume_oauth_exchange_code(code)
        self.assertEqual(token, self.mock_jwt)

        # Deuxième tentative avec le même code -> Rejet 400 (Usage unique)
        with self.assertRaises(HTTPException) as cm:
            AuthService.consume_oauth_exchange_code(code)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("invalide ou expiré", cm.exception.detail)

    def test_oauth_code_invalid_rejected(self):
        """Un faux code d'échange est immédiatement rejeté avec 400."""
        with self.assertRaises(HTTPException) as cm:
            AuthService.consume_oauth_exchange_code("totally_fake_oauth_exchange_code")
        self.assertEqual(cm.exception.status_code, 400)

    def test_oauth_code_expired_rejected(self):
        """Un code dont la validité (60s) est dépassée est rejeté avec 400."""
        code = AuthService.create_oauth_exchange_code(self.mock_jwt)
        # Simuler l'expiration en manipulant l'horodatage interne
        AuthService._exchange_codes[code]["expires_at"] = time.time() - 5

        with self.assertRaises(HTTPException) as cm:
            AuthService.consume_oauth_exchange_code(code)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("invalide ou expiré", cm.exception.detail)

    # ═══════════════════════════════════════════════════════════════
    # VULN-004 : Suppression de l'authentification par Query Parameter
    # ═══════════════════════════════════════════════════════════════

    def test_get_current_user_via_header_success(self):
        """L'authentification par en-tête Authorization: Bearer fonctionne."""
        mock_db = AsyncMock()
        async def run():
            with patch("app.services.userService.UserService.get_by_id", new_callable=AsyncMock) as mock_get:
                mock_get.return_value = self.mock_user
                user = await get_current_user(header_token=self.valid_jwt, cookie_token=None, db=mock_db)
                self.assertEqual(user.id, self.user_id)

        asyncio.run(run())

    def test_get_current_user_via_cookie_success(self):
        """L'authentification par Cookie sécurisé sharaco_token fonctionne."""
        mock_db = AsyncMock()
        async def run():
            with patch("app.services.userService.UserService.get_by_id", new_callable=AsyncMock) as mock_get:
                mock_get.return_value = self.mock_user
                user = await get_current_user(header_token=None, cookie_token=self.valid_jwt, db=mock_db)
                self.assertEqual(user.id, self.user_id)

        asyncio.run(run())

    def test_get_current_user_no_credentials_fails(self):
        """Sans en-tête ni cookie, la requête échoue en 401 Unauthorized."""
        mock_db = AsyncMock()
        async def run():
            with self.assertRaises(HTTPException) as cm:
                await get_current_user(header_token=None, cookie_token=None, db=mock_db)
            self.assertEqual(cm.exception.status_code, 401)
            self.assertEqual(cm.exception.detail, "Not authenticated")

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
