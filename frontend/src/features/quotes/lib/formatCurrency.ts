import { useAuthStore } from "@/store/auth-store";

/**
 * Formate un montant vers une chaîne de devise lisible.
 * 
 * @param amount - Montant à formater (ex: 30000 -> 30 000 FCFA ou 30 000,00 €)
 * @param currency - Code devise ISO 4217 (si omis, utilise la devise utilisateur du store ou "XOF")
 * @param locale - Locale pour le formatage (défaut: "fr-FR")
 * @returns Chaîne formatée
 * 
 * @example
 * formatCurrency(30000)           // "30 000 FCFA" (selon devise active)
 * formatCurrency(30000, 'EUR')    // "30 000,00 €"
 * formatCurrency(0)               // "0 FCFA"
 */
export function formatCurrency(
    amount: number | null | undefined,
    currency?: string,
    locale: string = 'fr-FR'
): string {
    const cur = currency || useAuthStore.getState().currency || "XOF";

    if (amount == null || isNaN(amount)) {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: cur,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(0);
    }

    // Devises sans décimales (ex: FCFA, Yen, etc.)
    const noDecimalCurrencies = [
        'XAF', 'XOF', 'JPY', 'KRW', 'CLP', 'GNF', 'CDF', 'RWF', 'KES', 'UGX'
    ];
    const isNoDecimal = noDecimalCurrencies.includes(cur);
    const minDigits = isNoDecimal ? 0 : 2;
    const maxDigits = isNoDecimal ? 0 : 2;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: cur,
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
    }).format(amount);
}