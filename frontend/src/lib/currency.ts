export const COUNTRY_CURRENCY: Record<string, string> = {
    // Europe (Euro)
    FR: "EUR", BE: "EUR", DE: "EUR", ES: "EUR", IT: "EUR", PT: "EUR",
    NL: "EUR", LU: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", AT: "EUR",
    // UEMOA (FCFA Ouest)
    SN: "XOF", CI: "XOF", ML: "XOF", BF: "XOF", NE: "XOF", TG: "XOF", BJ: "XOF", GW: "XOF",
    // CEMAC (FCFA Central)
    CM: "XAF", GA: "XAF", CG: "XAF", TD: "XAF", CF: "XAF", GQ: "XAF",
    // Autres
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

export function detectCurrency(fallback = "XOF"): string {
    if (typeof navigator === "undefined") return fallback;
    const country = (navigator.language || "").split("-")[1]?.toUpperCase();
    return (country && COUNTRY_CURRENCY[country]) || fallback;
}