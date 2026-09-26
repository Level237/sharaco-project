"use client";

import { useQuoteTotal } from "../../hooks/useQuoteTotal";
import { QuoteLineItem } from "../../types/QuoteBuilder";
import { Button } from "@/components/ui/button";
import { Send, Save, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryProps {
    items: QuoteLineItem[];
}

export function Summary({ items }: SummaryProps) {
    const { subTotal, totalTax, grandTotal } = useQuoteTotal(items);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] sticky top-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl">
                    <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Résumé financier</h3>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                    <span>Sous-total HT</span>
                    <span>{formatCurrency(subTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                    <span>TVA (Total)</span>
                    <span>{formatCurrency(totalTax)}</span>
                </div>

                <div className="flex items-end justify-between pt-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Total TTC</span>
                    <span className="text-4xl font-black bg-gradient-to-br from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                        {formatCurrency(grandTotal)}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-lg shadow-sky-500/25 border-0 transition-transform active:scale-[0.98] font-semibold text-base flex items-center justify-center">
                    <Send className="mr-2 h-4 w-4" /> Envoyer le devis
                </Button>
                <Button variant="outline" className="w-full h-12 rounded-xl bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors font-medium">
                    <Save className="mr-2 h-4 w-4" /> Enregistrer comme brouillon
                </Button>
            </div>
        </motion.div>
    );
}
