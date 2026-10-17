export const COUNTRY_CURRENCY: Record<string, string> = {
    FR: "EUR", BE: "EUR", DE: "EUR", ES: "EUR", IT: "EUR", PT: "EUR",
    NL: "EUR", LU: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", AT: "EUR",
    SN: "XOF", CI: "XOF", ML: "XOF", BF: "XOF", NE: "XOF", TG: "XOF", BJ: "XOF", GW: "XOF",
    CM: "XAF", GA: "XAF", CG: "XAF", TD: "XAF", CF: "XAF", GQ: "XAF",
    US: "USD", CA: "CAD", GB: "GBP", CH: "CHF",
    MA: "MAD", TN: "TND", DZ: "DZD",
    NG: "NGN", GN: "GNF", CD: "CDF", RW: "RWF", KE: "KES",
};

export const CURRENCY_LABELS: Record<string, string> = {
    XOF: "Franc CFA — F CFA",
    XAF: "Franc CFA — F CFA",
    EUR: "Euro — €",
    USD: "Dollar US — $",
    GBP: "Livre — £",
    CHF: "Franc suisse — CHF",
    CAD: "Dollar canadien — $",
    MAD: "Dirham marocain — DH",
    TND: "Dinar tunisien — DT",
    DZD: "Dinar algérien — DA",
    NGN: "Naira — ₦",
    GNF: "Franc guinéen — FG",
    CDF: "Franc congolais — FC",
    RWF: "Franc rwandais — RWF",
    KES: "Shilling kényan — KES",
};

/** Fuseau IANA → pays. La langue du navigateur (fr-FR, en-US) n'est pas un lieu. */
const TIMEZONE_COUNTRY: Record<string, string> = {
    "Africa/Douala": "CM",
    "Africa/Bangui": "CF",
    "Africa/Brazzaville": "CG",
    "Africa/Libreville": "GA",
    "Africa/Ndjamena": "TD",
    "Africa/Malabo": "GQ",
    "Africa/Lagos": "NG",
    "Africa/Porto-Novo": "BJ",
    "Africa/Niamey": "NE",
    "Africa/Lome": "TG",
    "Africa/Ouagadougou": "BF",
    "Africa/Bamako": "ML",
    "Africa/Dakar": "SN",
    "Africa/Abidjan": "CI",
    "Africa/Conakry": "GN",
    "Africa/Bissau": "GW",
    "Africa/Casablanca": "MA",
    "Africa/Tunis": "TN",
    "Africa/Algiers": "DZ",
    "Africa/Kinshasa": "CD",
    "Africa/Lubumbashi": "CD",
    "Africa/Kigali": "RW",
    "Africa/Nairobi": "KE",
    "Europe/Paris": "FR",
    "Europe/Brussels": "BE",
    "Europe/Berlin": "DE",
    "Europe/Madrid": "ES",
    "Europe/Rome": "IT",
    "Europe/Lisbon": "PT",
    "Europe/Amsterdam": "NL",
    "Europe/Luxembourg": "LU",
    "Europe/Dublin": "IE",
    "Europe/Helsinki": "FI",
    "Europe/Athens": "GR",
    "Europe/Vienna": "AT",
    "Europe/London": "GB",
    "Europe/Zurich": "CH",
    "America/Toronto": "CA",
    "America/New_York": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Los_Angeles": "US",
    "America/Phoenix": "US",
};

function isAutomatic(raw: string, located: string): boolean {
    if (!raw || raw === "USD") return true;
    if (raw === "EUR" && located !== "EUR") return true;
    if (raw === "XOF" && located !== "XOF") return true;
    if (raw === "XAF" && located !== "XAF") return true;
    return false;
}

export function detectCountry(): string | null {
    if (typeof Intl === "undefined") return null;
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return TIMEZONE_COUNTRY[tz] ?? null;
    } catch {
        return null;
    }
}

export function resolveCurrency(code?: string | null, country?: string | null): string {
    const raw = (code || "").trim().toUpperCase();
    const countryCode = (country || "").trim().toUpperCase();
    const located = COUNTRY_CURRENCY[countryCode];

    if (located && isAutomatic(raw, located)) return located;
    if (raw && CURRENCY_LABELS[raw] && raw !== "EUR" && raw !== "USD") return raw;
    if (located) return located;
    return "XOF";
}

/**
 * Pays et devise à enregistrer quand le profil ne correspond pas au lieu.
 * Retourne null si le profil est déjà celui du fuseau horaire.
 */
export function locationCurrencyUpdate(user: {
    country?: string | null;
    currency?: string | null;
}): { country: string; currency: string } | null {
    const detected = detectCountry();
    if (!detected) return null;
    const located = COUNTRY_CURRENCY[detected];
    if (!located) return null;

    const storedCountry = (user.country || "").trim().toUpperCase();
    const storedCurrency = (user.currency || "").trim().toUpperCase();

    if (storedCountry === detected && storedCurrency === located) return null;

    if (storedCountry === detected) {
        if (isAutomatic(storedCurrency, located)) {
            return { country: detected, currency: located };
        }
        return null;
    }

    const automatic =
        !storedCurrency ||
        storedCurrency === "USD" ||
        storedCurrency === "EUR" ||
        storedCurrency === "XOF" ||
        storedCurrency === "XAF";

    return {
        country: detected,
        currency: automatic ? located : storedCurrency,
    };
}

export function detectCurrency(fallback = "XOF"): string {
    return resolveCurrency(fallback, detectCountry());
}
