"""Règles pures des relances devis (sans I/O)."""

from typing import Any, Iterable, Optional

QUOTE_REMINDER_LEVELS = (1, 2, 3)
MIN_DAYS = 1
MAX_DAYS = 60

DEFAULT_SUBJECTS = {
    1: "Vous avez bien reçu le devis {number} ?",
    2: "Une question sur le devis {number} ?",
    3: "Dernier rappel : le devis {number} expire bientôt",
}

DEFAULT_DAYS = {1: 2, 2: 5, 3: 10}


def quote_reminder_intro(level: int, expiry: str = "") -> str:
    if level == 1:
        return "Vous avez bien reçu le devis ? Ouvrez-le via le lien ci-dessous."
    if level == 2:
        return (
            "Une question sur une ligne, un délai ou un montant ? "
            "Répondez à cet email ou ouvrez le devis."
        )
    if expiry:
        return (
            f"Dernier rappel : ce devis expire le {expiry}. "
            "Après cette date, nous n’enverrons plus de relance."
        )
    return (
        "Dernier rappel concernant ce devis. "
        "Nous n’enverrons plus de relance après ce message."
    )


def next_quote_reminder_level(
    days_since_sent: int,
    config: Any,
    already_sent: Iterable[int],
) -> Optional[int]:
    """Premier niveau dû et pas encore envoyé. Un seul par passage."""
    sent = set(already_sent)
    for level in QUOTE_REMINDER_LEVELS:
        if not getattr(config, f"reminder_{level}_enabled", False):
            continue
        if level in sent:
            continue
        delay = int(getattr(config, f"reminder_{level}_days", 0) or 0)
        if delay < MIN_DAYS:
            continue
        if days_since_sent >= delay:
            return level
    return None


def validate_quote_reminder_config(config: Any) -> None:
    days: list[tuple[int, int]] = []
    for level in QUOTE_REMINDER_LEVELS:
        enabled = bool(getattr(config, f"reminder_{level}_enabled", False))
        delay = int(getattr(config, f"reminder_{level}_days", 0) or 0)
        subject = (getattr(config, f"reminder_{level}_subject", "") or "").strip()
        if enabled:
            if delay < MIN_DAYS or delay > MAX_DAYS:
                raise ValueError(
                    f"Le délai de la relance {level} doit être entre {MIN_DAYS} et {MAX_DAYS} jours."
                )
            if not subject:
                raise ValueError(f"Le sujet de la relance {level} est obligatoire.")
            days.append((level, delay))

    for prev, curr in zip(days, days[1:]):
        if curr[1] <= prev[1]:
            raise ValueError(
                "Chaque relance suivante doit partir plus tard que la précédente "
                f"(J+{prev[1]} puis J+{curr[1]})."
            )
