# app/core/currency.py

CURRENCY_DISPLAY = {
    "XOF": "F CFA",
    "XAF": "F CFA",
    "EUR": "€",
    "USD": "$",
    "GBP": "£",
    "CHF": "CHF",
    "CAD": "$",
    "MAD": "DH",
    "TND": "DT",
    "DZD": "DA",
    "NGN": "₦",
    "GNF": "FG",
    "CDF": "FC",
    "RWF": "RWF",
    "KES": "KES",
}

# Correspondance Pays → Devise (utilisé côté frontend)
COUNTRY_CURRENCY = {
    # Europe (Euro)
    "FR": "EUR", "BE": "EUR", "DE": "EUR", "ES": "EUR", "IT": "EUR", "PT": "EUR",
    "NL": "EUR", "LU": "EUR", "IE": "EUR", "FI": "EUR", "GR": "EUR", "AT": "EUR",
    # UEMOA (FCFA Ouest)
    "SN": "XOF", "CI": "XOF", "ML": "XOF", "BF": "XOF", "NE": "XOF", "TG": "XOF",
    "BJ": "XOF", "GW": "XOF",
    # CEMAC (FCFA Central)
    "CM": "XAF", "GA": "XAF", "CG": "XAF", "TD": "XAF", "CF": "XAF", "GQ": "XAF",
    # Autres
    "US": "USD", "CA": "CAD", "GB": "GBP", "CH": "CHF",
    "MA": "MAD", "TN": "TND", "DZ": "DZD",
    "NG": "NGN", "GN": "GNF", "CD": "CDF", "RW": "RWF", "KE": "KES",
}

# Labels lisibles pour l'UI
CURRENCY_LABELS = {
    "XOF": "Franc CFA — F CFA",
    "XAF": "Franc CFA — F CFA",
    "EUR": "Euro — €",
    "USD": "Dollar US — $",
    "GBP": "Livre — £",
    "CHF": "Franc suisse — CHF",
    "CAD": "Dollar canadien — $",
    "MAD": "Dirham marocain — DH",
    "TND": "Dinar tunisien — DT",
    "DZD": "Dinar algérien — DA",
    "NGN": "Naira — ₦",
    "GNF": "Franc guinéen — FG",
    "CDF": "Franc congolais — FC",
    "RWF": "Franc rwandais — RWF",
    "KES": "Shilling kényan — KES",
}


DEFAULT_CURRENCY = "XOF"

# Assignés tout seuls : USD par l'ancien défaut, EUR par la langue du
# navigateur (fr-FR, en-US), pas par le pays où se trouve la personne.
UNTRUSTED_CURRENCIES = {"USD", "EUR"}

CEMAC = {"CM", "GA", "CG", "TD", "CF", "GQ"}
UEMOA = {"SN", "CI", "ML", "BF", "NE", "TG", "BJ", "GW"}

_ALIASES = {
    "FCFA": "XOF",
    "F CFA": "XOF",
    "CFA": "XOF",
}


def _normalize(code: str | None) -> str:
    raw = (code or "").strip().upper()
    return _ALIASES.get(raw, raw)


def resolve_currency(code: str | None, country: str | None = None) -> str:
    """Devise du pays de l'utilisateur, identique sur le devis et l'interface.

    Le pays connu l'emporte sur un euro ou un dollar arrivé tout seul, et
    sur le franc CFA ouest laissé par défaut. Un pays de la zone euro
    garde l'euro. Sans pays, l'euro et le dollar ne sont pas repris :
    le franc CFA ouest reste la valeur stable.
    """
    raw = _normalize(code)
    country_code = (country or "").strip().upper()
    located = COUNTRY_CURRENCY.get(country_code)

    if located and _is_automatic(raw, located):
        return located
    if raw in CURRENCY_DISPLAY and raw not in UNTRUSTED_CURRENCIES:
        return raw
    if located:
        return located
    return DEFAULT_CURRENCY


def _is_automatic(raw: str, located: str) -> bool:
    if raw in {"", "USD"}:
        return True
    if raw == "EUR" and located != "EUR":
        return True
    if raw == "XOF" and located != "XOF":
        return True
    if raw == "XAF" and located != "XAF":
        return True
    return False


def currency_label(code: str | None) -> str:
    """Symbole d'un code déjà résolu. Ne réinterprète pas le pays."""
    key = _normalize(code)
    return CURRENCY_DISPLAY.get(key, CURRENCY_DISPLAY[DEFAULT_CURRENCY])


def get_currency_symbol(code: str | None = None, country: str | None = None) -> str:
    """Symbole d'affichage, après résolution selon le pays."""
    return currency_label(resolve_currency(code, country))


def format_amount(
    cents: int,
    currency_code: str = "XOF",
    country: str | None = None,
) -> str:
    """
    Formate un montant en centimes avec la devise appropriée.
    Utilisé pour les emails et notifications.
    
    Exemples :
        format_amount(1500000, "XOF") → "1,500,000 F CFA"
        format_amount(1500000, "XAF") → "1,500,000 F CFA"
        format_amount(1500000, "MAD") → "1,500,000 DH"
    """
    if country:
        code = resolve_currency(currency_code, country)
    else:
        key = _normalize(currency_code)
        code = key if key in CURRENCY_DISPLAY else resolve_currency(currency_code, None)
    return f"{cents:,} {currency_label(code)}"