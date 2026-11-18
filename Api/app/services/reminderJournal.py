"""Libellés du journal de relances (sans I/O)."""

QUOTE_STEP_LABELS = {
    1: "Palier 1 · Bien reçu ?",
    2: "Palier 2 · Questions ?",
    3: "Palier 3 · Expiration",
}

INVOICE_STEP_LABELS = {
    "DUE_3_DAYS": "J-3 · Prévention",
    "DUE_1_DAY": "J-1 · Rappel",
}


def quote_step_label(level: int) -> str:
    return QUOTE_STEP_LABELS.get(level, f"Palier {level}")


def invoice_step_label(reminder_type: str) -> str:
    return INVOICE_STEP_LABELS.get(reminder_type, reminder_type or "Rappel facture")
