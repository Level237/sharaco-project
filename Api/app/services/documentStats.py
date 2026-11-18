"""Agrégats financiers des factures (taux d'encaissement)."""

from typing import Any

COLLECTED_STATUSES = ("PAID", "ACCEPTED")
RECEIVABLE_STATUSES = ("SENT", "VIEWED")
EXCLUDED_STATUSES = ("REFUSED",)


def _bucket(invoices_by_status: dict[str, Any], status: str) -> tuple[int, int]:
    data = invoices_by_status.get(status) or {}
    return int(data.get("total_cents") or 0), int(data.get("count") or 0)


def _sum_statuses(
    invoices_by_status: dict[str, Any], statuses: tuple[str, ...]
) -> tuple[int, int]:
    cents = 0
    count = 0
    for status in statuses:
        amount, n = _bucket(invoices_by_status, status)
        cents += amount
        count += n
    return cents, count


def compute_invoice_collection(invoices_by_status: dict[str, Any] | None) -> dict[str, float | int]:
    """Taux d'encaissement = montant payé / montant de toutes les factures.

    Impayées (brouillon, envoyée, vue, en retard) baissent le taux.
    Seules les factures refusées/annulées sont hors calcul.
    """
    by_status = invoices_by_status or {}

    collected_cents, collected_count = _sum_statuses(by_status, COLLECTED_STATUSES)
    receivables_cents, receivables_count = _sum_statuses(by_status, RECEIVABLE_STATUSES)
    overdue_cents, overdue_count = _bucket(by_status, "OVERDUE")

    issued_cents = 0
    issued_count = 0
    for status in by_status:
        if status in EXCLUDED_STATUSES:
            continue
        amount, n = _bucket(by_status, status)
        issued_cents += amount
        issued_count += n

    if issued_cents > 0:
        rate = round(collected_cents / issued_cents * 100, 1)
    elif issued_count > 0:
        rate = round(collected_count / issued_count * 100, 1)
    else:
        rate = 0.0

    rate = min(100.0, max(0.0, rate))

    return {
        "revenue_cents": collected_cents,
        "paid_invoices_count": collected_count,
        "receivables_cents": receivables_cents,
        "receivables_count": receivables_count,
        "overdue_cents": overdue_cents,
        "overdue_count": overdue_count,
        "issued_cents": issued_cents,
        "issued_count": issued_count,
        "collection_rate": rate,
    }
