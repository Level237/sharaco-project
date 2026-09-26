"use client";


import { Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuoteLineItem } from "../../types/QuoteBuilder";
import { cn } from "@/lib/utils";

interface LineItemProps {
    item: QuoteLineItem;
    index: number;
    hasVat?: boolean;
    onChange: (id: string, field: keyof QuoteLineItem, value: any) => void;
    onRemove: (id: string) => void;
}

export function LineItem({ item, index, hasVat = false, onChange, onRemove }: LineItemProps) {
    const handleNumberChange = (field: keyof QuoteLineItem, val: string) => {
        const num = parseFloat(val);
        onChange(item.id, field, isNaN(num) ? 0 : num);
    };

    const lineTotal = item.quantity * item.unitPrice;

    return (
        <div
            className="group relative flex items-start gap-3 p-4 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-md hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all duration-300"
        >
            <div className="mt-2 text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 flex flex-col gap-4">
                {/* Row 1: Description */}
                <div className="space-y-1 w-full">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                    <Input
                        value={item.description}
                        onChange={(e) => onChange(item.id, 'description', e.target.value)}
                        placeholder="Création site web vitrine..."
                        className="bg-white/50 dark:bg-slate-950/50 border-white/20 dark:border-white/10 focus:border-sky-500 rounded-xl w-full"
                    />
                </div>

                {/* Row 2: Metrics */}
                <div className={cn(
                    "grid gap-4 items-end",
                    hasVat ? "grid-cols-2 lg:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
                )}>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Qté</label>
                        <Input
                            type="number"
                            min="1"
                            value={item.quantity || ''}
                            onChange={(e) => handleNumberChange('quantity', e.target.value)}
                            className="bg-white/50 dark:bg-slate-950/50 border-white/20 dark:border-white/10 focus:border-sky-500 rounded-xl"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Prix Unitaire (HT)</label>
                        <div className="relative">
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice || ''}
                                onChange={(e) => handleNumberChange('unitPrice', e.target.value)}
                                className="pl-6 bg-white/50 dark:bg-slate-950/50 border-white/20 dark:border-white/10 focus:border-sky-500 rounded-xl"
                            />
                            
                        </div>
                    </div>

                    {hasVat && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TVA (%)</label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.tax_rate ?? ''}
                                onChange={(e) => handleNumberChange('tax_rate', e.target.value)}
                                className="bg-white/50 dark:bg-slate-950/50 border-white/20 dark:border-white/10 focus:border-sky-500 rounded-xl"
                            />
                        </div>
                    )}

                    <div className="space-y-1 flex flex-col pb-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right w-full">Total HT</label>
                        <div className="font-bold text-slate-900 dark:text-white text-lg text-right">
                            {lineTotal}
                        </div>
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="mt-6 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}