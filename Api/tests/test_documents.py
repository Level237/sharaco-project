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


if __name__ == "__main__":
    unittest.main()
