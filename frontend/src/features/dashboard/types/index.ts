export interface DashboardStats {
    total_devis: number;
    total_factures: number;
    devis_sent: number;
    devis_viewed: number;
    devis_paid: number;
    factures_paid: number;
    conversion_rate: number;
    total_pending_cents: number;
    total_paid_cents: number;
}

export interface MonthlyRevenue {
    month: string;
    revenue_cents: number;
}