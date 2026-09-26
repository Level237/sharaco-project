# Api/tests/test_documents.py
import unittest
from types import SimpleNamespace
from app.services.documentService import DocumentService
from app.models.document import DocumentStatus, DocumentType


class TestDocumentCalculations(unittest.TestCase):

    def test_calculate_totals_zero_tax(self):
        """Vérifie le calcul avec TVA à 0%."""
        items = [
            SimpleNamespace(quantity=2, unit_price_cents=50000, tax_rate=0),
            SimpleNamespace(quantity=1, unit_price_cents=25000, tax_rate=0),
        ]
        totals = DocumentService.calculate_totals(items)
        self.assertEqual(totals["subtotal_cents"], 125000)
        self.assertEqual(totals["tax_total_cents"], 0)
        self.assertEqual(totals["grand_total_cents"], 125000)

    def test_calculate_totals_with_vat(self):
        """Vérifie le calcul avec TVA à 18%."""
        items = [
            SimpleNamespace(quantity=1, unit_price_cents=100000, tax_rate=18),
        ]
        totals = DocumentService.calculate_totals(items)
        self.assertEqual(totals["subtotal_cents"], 100000)
        self.assertEqual(totals["tax_total_cents"], 18000)
        self.assertEqual(totals["grand_total_cents"], 118000)

    def test_calculate_totals_rounding_cents(self):
        """Vérifie que les arrondis de centimes sont toujours des entiers."""
        items = [
            SimpleNamespace(quantity=3, unit_price_cents=3333, tax_rate=19.6),
        ]
        totals = DocumentService.calculate_totals(items)
        self.assertIsInstance(totals["subtotal_cents"], int)
        self.assertIsInstance(totals["tax_total_cents"], int)
        self.assertIsInstance(totals["grand_total_cents"], int)
        self.assertEqual(totals["subtotal_cents"], 9999)
        self.assertEqual(totals["tax_total_cents"], int(9999 * 19.6 / 100))
        self.assertEqual(totals["grand_total_cents"], totals["subtotal_cents"] + totals["tax_total_cents"])

    def test_valid_status_transitions(self):
        """Vérifie la logique des transitions de statut d'un document."""
        valid_transitions = {
            DocumentStatus.DRAFT: [DocumentStatus.SENT],
            DocumentStatus.SENT: [DocumentStatus.VIEWED, DocumentStatus.PAID],
            DocumentStatus.VIEWED: [DocumentStatus.PAID],
            DocumentStatus.PAID: [],
        }
        self.assertIn(DocumentStatus.SENT, valid_transitions[DocumentStatus.DRAFT])
        self.assertIn(DocumentStatus.PAID, valid_transitions[DocumentStatus.SENT])
        self.assertIn(DocumentStatus.PAID, valid_transitions[DocumentStatus.VIEWED])
        self.assertEqual(len(valid_transitions[DocumentStatus.PAID]), 0)

    def test_document_schemas_project_id(self):
        """Vérifie la présence et validation du project_id dans DocumentCreate et DocumentUpdate."""
        import uuid
        from app.schemas.document import DocumentCreate, DocumentUpdate

        proj_id = uuid.uuid4()

        # DocumentCreate
        create_payload = DocumentCreate(
            project_id=proj_id,
            items=[{"description": "Prestation", "quantity": 1, "unit_price_cents": 10000, "tax_rate": 20}]
        )
        self.assertEqual(create_payload.project_id, proj_id)

        # DocumentUpdate
        update_payload = DocumentUpdate(
            project_id=proj_id
        )
        self.assertEqual(update_payload.project_id, proj_id)

    def test_get_current_user_auth(self):
        """Vérifie le fonctionnement de get_current_user via header et query param."""
        import asyncio
        from unittest.mock import AsyncMock, patch
        from fastapi import HTTPException
        from jose import jwt
        from app.core.deps import get_current_user
        from app.core.config import settings

        user_id = "123e4567-e89b-12d3-a456-426614174000"
        valid_jwt = jwt.encode({"sub": user_id}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        mock_user = SimpleNamespace(id=user_id, email="test@sharaco.com")
        mock_db = AsyncMock()

        async def run_tests():
            # 1. Ni header ni query -> 401 Not authenticated
            with self.assertRaises(HTTPException) as cm:
                await get_current_user(header_token=None, auth_token_query=None, db=mock_db)
            self.assertEqual(cm.exception.status_code, 401)
            self.assertEqual(cm.exception.detail, "Not authenticated")

            # 2. Token via header
            with patch("app.services.userService.UserService.get_by_id", new_callable=AsyncMock) as mock_get_user:
                mock_get_user.return_value = mock_user
                user = await get_current_user(header_token=valid_jwt, auth_token_query=None, db=mock_db)
                self.assertEqual(user.id, user_id)

            # 3. Token via query parameter
            with patch("app.services.userService.UserService.get_by_id", new_callable=AsyncMock) as mock_get_user:
                mock_get_user.return_value = mock_user
                user = await get_current_user(header_token=None, auth_token_query=valid_jwt, db=mock_db)
                self.assertEqual(user.id, user_id)

        asyncio.run(run_tests())


if __name__ == "__main__":
    unittest.main()
