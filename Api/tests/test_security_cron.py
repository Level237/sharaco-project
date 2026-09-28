# Api/tests/test_security_cron.py
import unittest
import asyncio
from unittest.mock import patch, AsyncMock
from fastapi import HTTPException
from app.api.v1.cron import verify_cron_secret


class TestSecurityCronSecret(unittest.TestCase):
    """Vérifie la remédiation de la faille VULN-003 (Secret Cron par défaut & sécurisation de l'authentification batch)."""

    def test_missing_header_returns_401(self):
        """Une requête sans en-tête x-cron-secret est rejetée avec 401 Unauthorized."""
        async def run():
            with patch("app.api.v1.cron.settings") as mock_settings:
                mock_settings.CRON_SECRET = "production-super-secret-key-12345"
                with self.assertRaises(HTTPException) as cm:
                    await verify_cron_secret(x_cron_secret=None)
                self.assertEqual(cm.exception.status_code, 401)
                self.assertIn("manquant", cm.exception.detail)

        asyncio.run(run())

    def test_legacy_default_secret_rejected_with_403(self):
        """L'ancien secret par défaut 'dev-cron-secret' est formellement rejeté avec 403 Forbidden."""
        async def run():
            with patch("app.api.v1.cron.settings") as mock_settings:
                mock_settings.CRON_SECRET = "production-super-secret-key-12345"
                with self.assertRaises(HTTPException) as cm:
                    await verify_cron_secret(x_cron_secret="dev-cron-secret")
                self.assertEqual(cm.exception.status_code, 403)
                self.assertIn("invalide", cm.exception.detail)

        asyncio.run(run())

    def test_invalid_secret_rejected_with_403(self):
        """Un secret erroné est rejeté avec 403 Forbidden."""
        async def run():
            with patch("app.api.v1.cron.settings") as mock_settings:
                mock_settings.CRON_SECRET = "production-super-secret-key-12345"
                with self.assertRaises(HTTPException) as cm:
                    await verify_cron_secret(x_cron_secret="wrong-secret-token")
                self.assertEqual(cm.exception.status_code, 403)
                self.assertIn("invalide", cm.exception.detail)

        asyncio.run(run())

    def test_unconfigured_cron_secret_fails_closed_with_500(self):
        """Si CRON_SECRET n'est pas configuré sur le serveur, l'endpoint fail-close en 500 (pas de fallback)."""
        async def run():
            with patch("app.api.v1.cron.settings") as mock_settings:
                mock_settings.CRON_SECRET = ""
                with self.assertRaises(HTTPException) as cm:
                    await verify_cron_secret(x_cron_secret="any-token")
                self.assertEqual(cm.exception.status_code, 500)
                self.assertIn("pas configuré", cm.exception.detail)

        asyncio.run(run())

    def test_valid_secret_passes_successfully(self):
        """Un secret valide correspondant à la configuration serveur autorise la requête."""
        async def run():
            with patch("app.api.v1.cron.settings") as mock_settings:
                mock_settings.CRON_SECRET = "production-super-secret-key-12345"
                # Ne doit lever aucune exception
                await verify_cron_secret(x_cron_secret="production-super-secret-key-12345")

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
