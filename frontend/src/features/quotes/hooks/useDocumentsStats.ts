// features/quotes/hooks/useDocumentsStats.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DocumentsStatsData {
    // ✅ VRAI CA (le plus important)
    revenue_cents: number;
    paid_invoices_count: number;
    
    // 💰 Argent dû par les clients
    receivables_cents: number;
    receivables_count: number;
    
    // 🔴 Retards de paiement
    overdue_cents: number;
    overdue_count: number;
    
    // 📊 Pipeline commercial (devis signés non facturés)
    pipeline_cents: number;
    accepted_quotes_count: number;
    
    // 📈 Taux
    conversion_rate: number;
    collection_rate: number;
    
    // Détails par statut (pour graphiques)
    quotes_by_status: Record<string, number>;
    invoices_by_status: Record<string, { count: number; total_cents: number }>;
}

export function useDocumentsStats() {
    return useQuery<DocumentsStatsData>({
        queryKey: ["documents-stats"],
        queryFn: async () => {
            const data = await api.get<DocumentsStatsData>("/api/v1/documents/stats");
            return data;
        },
        refetchInterval: 30000, // Refresh toutes les 30s
        staleTime: 10000,
    });
}