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
            className="group relative flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/40 dark:bg-slate-900/40 rounded-lg border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-md hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all duration-300"
        >
            {/* Drag Handle & Delete (Mobile header, Desktop sides) */}
            <div className="flex sm:hidden w-full items-center justify-between pb-2 border-b border-white/10 dark:border-white/5 mb-1">
                <div className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-2">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Ligne {index + 1}</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(item.id)}
                    className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Desktop Drag Handle */}
            <div className="hidden sm:block mt-2 text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0">
                <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 flex flex-col gap-3 sm:gap-4 w-full min-w-0">
                {/* Row 1: Description */}
                <div className="space-y-1 w-full">
                    <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <Input
                        value={item.description}
                        onChange={(e) => onChange(item.id, 'description', e.target.value)}
                        placeholder="Création site web vitrine..."
                        className="bg-white/50 dark:bg-slate-950/50 border-white/20 dark:border-white/10 focus:border-blue-500 rounded-md w-full text-sm h-10 sm:h-11"
                    />
                </div>

                {/* Row 2: Metrics */}
                <div className={cn(
                    "grid gap-3 sm:gap-4 items-end",
                    hasVat ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"
                )}>
                    <div className="space-y-1">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Qté</label>
                        <Input
                            type="number"
                            min="1"
                            value={item.quantity || ''}
                            onChange={(e) => handleNumberChange('quantity', e.target.value)}
                            className="bg-white/50 dark:bg-slate-950/50 border-white/20 dark:border-white/10 focus:border-blue-500 rounded-md text-sm h-10 sm:h-11"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest truncate">Prix Unitaire</label>
                        <div className="relative">
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice || ''}
                                onChange={(e) => handleNumberChange('unitPrice', e.target.value)}
                                className="bg-white/50 dark:bg-slate-950/50 border-white/20 dark:border-white/10 focus:border-blue-500 rounded-md text-sm h-10 sm:h-11"
                            />
                        </div>
                    </div>

                    {hasVat && (
                        <div className="space-y-1">
                            <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">TVA (%)</label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.tax_rate ?? ''}
                                onChange={(e) => handleNumberChange('tax_rate', e.target.value)}
                                className="bg-white/50 dark:bg-slate-950/50 border-white/20 dark:border-white/10 focus:border-blue-500 rounded-md text-sm h-10 sm:h-11"
                            />
                        </div>
                    )}

                    <div className={cn(
                        "space-y-1 flex flex-col pb-1.5 sm:pb-2 text-right",
                        !hasVat && "col-span-2 sm:col-span-1" // on mobile without VAT, total takes full width row 2
                    )}>
                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest w-full">Total HT</label>
                        <div className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                            {lineTotal}
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Delete Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="hidden sm:flex mt-6 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 shrink-0"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}