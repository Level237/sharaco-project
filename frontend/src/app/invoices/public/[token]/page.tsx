// app/invoices/public/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PaymentScheduleTracker } from "@/features/invoices/components/PaymentScheduleTracker";

export default function PublicInvoicePage() {
    const params = useParams();
    const token = params.token as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoices/public/${token}`)
            .then((r) => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Facture introuvable</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] py-8 sm:py-12">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
                {/* PDF Preview */}
                <div className="bg-white dark:bg-[#0b0b0b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    {/* ... ton affichage PDF existant ... */}
                </div>

                {/* ✅ Bloc suivi de paiement (masqué si pas d'échéancier) */}
                {data.has_schedule && data.payment_schedule && (
                    <PaymentScheduleTracker schedule={data.payment_schedule} />
                )}
            </div>
        </div>
    );
}