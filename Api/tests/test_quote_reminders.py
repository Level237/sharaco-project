import unittest
from types import SimpleNamespace

from app.services.quoteReminders import (
    next_quote_reminder_level,
    quote_reminder_intro,
    validate_quote_reminder_config,
)


def _cfg(**overrides):
    base = dict(
        reminder_1_enabled=True,
        reminder_1_days=2,
        reminder_1_subject="Vous avez bien reçu le devis {number} ?",
        reminder_2_enabled=True,
        reminder_2_days=5,
        reminder_2_subject="Une question sur le devis {number} ?",
        reminder_3_enabled=True,
        reminder_3_days=10,
        reminder_3_subject="Dernier rappel : le devis {number} expire bientôt",
    )
    base.update(overrides)
    return SimpleNamespace(**base)


class TestQuoteReminders(unittest.TestCase):
    def test_nothing_before_first_delay(self):
        self.assertIsNone(next_quote_reminder_level(1, _cfg(), []))

    def test_first_then_second_then_third(self):
        cfg = _cfg()
        self.assertEqual(next_quote_reminder_level(2, cfg, []), 1)
        self.assertEqual(next_quote_reminder_level(5, cfg, [1]), 2)
        self.assertEqual(next_quote_reminder_level(10, cfg, [1, 2]), 3)

    def test_one_level_per_pass_even_if_late(self):
        self.assertEqual(next_quote_reminder_level(12, _cfg(), []), 1)
        self.assertEqual(next_quote_reminder_level(12, _cfg(), [1]), 2)
        self.assertEqual(next_quote_reminder_level(12, _cfg(), [1, 2]), 3)
        self.assertIsNone(next_quote_reminder_level(12, _cfg(), [1, 2, 3]))

    def test_skip_disabled_level(self):
        cfg = _cfg(reminder_1_enabled=False)
        self.assertEqual(next_quote_reminder_level(5, cfg, []), 2)

    def test_validate_increasing_days(self):
        with self.assertRaises(ValueError):
            validate_quote_reminder_config(_cfg(reminder_2_days=2))

    def test_validate_subject_required_when_enabled(self):
        with self.assertRaises(ValueError):
            validate_quote_reminder_config(_cfg(reminder_1_subject="  "))

    def test_last_intro_includes_expiry(self):
        text = quote_reminder_intro(3, "28/11/2026")
        self.assertIn("28/11/2026", text)
        self.assertIn("Dernier", text)
