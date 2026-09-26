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


def get_currency_symbol(code: str) -> str:
    """Retourne le symbole d'affichage d'une devise."""
    return CURRENCY_DISPLAY.get(code, code)


def format_amount(cents: int, currency_code: str = "XOF") -> str:
    """
    Formate un montant en centimes avec la devise appropriée.
    Utilisé pour les emails et notifications.
    
    Exemples :
        format_amount(1500000, "XOF") → "1,500,000 F CFA"
        format_amount(1500000, "EUR") → "1,500,000 €"
        format_amount(1500000, "USD") → "1,500,000 $"
    """
    symbol = get_currency_symbol(currency_code)
    return f"{cents:,} {symbol}"