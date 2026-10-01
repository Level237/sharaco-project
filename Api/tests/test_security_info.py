import unittest
from app.services.pdfRenderer import PDFRenderer
from app.core.config import Settings


class TestSecurityHardeningInfo(unittest.TestCase):
    """Vérification des durcissements de sécurité INFO-001 (anti-SSRF) et INFO-002 (séparation des secrets)."""

    def test_anti_ssrf_blocks_private_and_cloud_metadata_ips(self):
        """INFO-001 : Vérifie que les adresses privées, loopback et métadonnées cloud sont bloquées."""
        blocked_urls = [
            "http://169.254.169.254/latest/meta-data/",  # AWS / OpenStack metadata
            "http://169.254.169.254/computeMetadata/v1/", # GCP metadata
            "http://127.0.0.1:8000/api/v1/auth/me",
            "http://localhost:3000/dashboard",
            "http://0.0.0.0:8000/",
            "http://[::1]:8000/",
            "http://10.0.0.1/admin",
            "http://172.16.0.1/status",
            "http://192.168.1.1/router",
            "file:///etc/passwd",
            "file:///etc/hosts",
            "gopher://127.0.0.1:6379/_PING",
            "http://metadata.google.internal/",
            "http://myapp.localhost/",
        ]

        for url in blocked_urls:
            with self.subTest(url=url):
                self.assertFalse(
                    PDFRenderer.is_safe_subresource_url(url),
                    f"L'URL dangereuse {url} aurait dû être bloquée par le filtre anti-SSRF !",
                )

    def test_anti_ssrf_allows_safe_data_urls(self):
        """INFO-001 : Vérifie que les URLs in-memory data: (logos encodés) sont autorisées."""
        allowed_urls = [
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY44YAAAAASUVORK5CYII=",
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'></svg>",
            "about:blank",
        ]

        for url in allowed_urls:
            with self.subTest(url=url):
                self.assertTrue(
                    PDFRenderer.is_safe_subresource_url(url),
                    f"L'URL sûre {url} aurait dû être autorisée par le filtre anti-SSRF !",
                )

    def test_session_secret_key_separation(self):
        """INFO-002 : Vérifie que SESSION_SECRET_KEY est utilisée si définie, sinon repli sur SECRET_KEY."""
        # 1. Cas où SESSION_SECRET_KEY est distincte
        settings_custom = Settings(
            DB_USER="u",
            DB_PASSWORD="p",
            DB_HOST="h",
            DB_PORT="5432",
            DB_NAME="db",
            SECRET_KEY="jwt-secret-xyz",
            SESSION_SECRET_KEY="dedicated-session-secret-123",
        )
        self.assertEqual(settings_custom.EFFECTIVE_SESSION_SECRET_KEY, "dedicated-session-secret-123")
        self.assertNotEqual(settings_custom.EFFECTIVE_SESSION_SECRET_KEY, settings_custom.SECRET_KEY)

        # 2. Cas où SESSION_SECRET_KEY n'est pas définie (repli rétrocompatible)
        settings_fallback = Settings(
            DB_USER="u",
            DB_PASSWORD="p",
            DB_HOST="h",
            DB_PORT="5432",
            DB_NAME="db",
            SECRET_KEY="jwt-secret-fallback",
        )
        self.assertEqual(settings_fallback.EFFECTIVE_SESSION_SECRET_KEY, "jwt-secret-fallback")


if __name__ == "__main__":
    unittest.main()
