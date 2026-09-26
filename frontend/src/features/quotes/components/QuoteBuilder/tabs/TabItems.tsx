"use client";

import { QuoteDraft, QuoteLineItem } from "../../../types/QuoteBuilder";
import { Plus, ReceiptText, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineItem } from "../LineItem";
import { useQuoteTotal } from "../../../hooks/useQuoteTotal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/features/quotes/lib/formatCurrency";

interface TabItemsProps {
    draft: QuoteDraft;
    onItemChange: (id: string, field: keyof QuoteLineItem, value: any) => void;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
    onDraftChange: (field: keyof QuoteDraft, value: any) => void;
}

export function TabItems({ draft, onItemChange, onAddItem, onRemoveItem, onDraftChange }: TabItemsProps) {
    const { subTotal, totalTax, grandTotal, discountAmount } = useQuoteTotal(
        draft.items, 
        draft.hasVat, 
        draft.vatRate, 
        draft.discountRate, 
        draft.isTaxExempt
    );

    return (
        <div className="space-y-10 pb-32">
            {/* Header Description */}
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Services & Pricing</h3>
                <p className="text-sm text-zinc-500">Add or edit line items for this quotation. Totals are recalculated automatically.</p>
            </div>

            {/* Global VAT Settings */}
            <div className="p-6 bg-white/[0.04] border border-white/5 rounded-[2rem] space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-zinc-200">Apply VAT (TVA)</Label>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Enable tax calculation for this quote</p>
                    </div>
                    <Switch 
                        className="bg-slate-300"
                        checked={draft.hasVat}
                        onCheckedChange={(checked) => {
                            onDraftChange("hasVat", checked);
                            if (!checked) {
                                draft.items.forEach(item => {
                                    onItemChange(item.id, "tax_rate", 0);
                                });
                            } else {
                                const rate = draft.vatRate || 20;
                                draft.items.forEach(item => {
                                    onItemChange(item.id, "tax_rate", rate);
                                });
                            }
                        }}
                    />
                </div>

                {draft.hasVat && (
                    <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Percent className="h-3 w-3" /> VAT Percentage
                        </Label>
                        <div className="relative max-w-[120px]">
                            <Input
                                type="number"
                                value={draft.vatRate ?? 0}
                                onChange={(e) => {
                                    const rate = parseFloat(e.target.value) || 0;
                                    onDraftChange("vatRate", rate);
                                    draft.items.forEach(item => {
                                        onItemChange(item.id, "tax_rate", rate);
                                    });
                                }}
                                className="h-11 pr-8 bg-zinc-900/50 border-white/5 focus:border-white/10 rounded-xl text-zinc-200 font-mono"
                                placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-600">%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Items List */}
            <div className="space-y-4">
                {draft.items.map((item: QuoteLineItem, index: number) => (
                    <LineItem
                        key={item.id}
                        item={item}
                        index={index}
                        hasVat={draft.hasVat}
                        onChange={onItemChange}
                        onRemove={onRemoveItem}
                    />
                ))}
            </div>

            {/* Add Item Button */}
            <Button
                onClick={onAddItem}
                variant="outline"
                className="w-full h-14 border-dashed border border-zinc-800 bg-white/[0.02] hover:bg-white/[0.05] hover:border-zinc-600 text-zinc-400 hover:text-zinc-100 rounded-2xl transition-all group"
            >
                <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-xs uppercase tracking-widest">Add New Item</span>
            </Button>

            {/* Financial Summary */}
            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] mt-12 space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors" />

                <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                        <ReceiptText className="h-4 w-4 text-zinc-400" />
                    </div>
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Financial Summary</h4>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-zinc-500">
                        <span>Subtotal (Net)</span>
                        <span className="text-zinc-200">{formatCurrency(subTotal)}</span>
                    </div>

                    {draft.discountRate > 0 && (
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-emerald-500/80">
                            <span>Discount ({draft.discountRate}%)</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                    )}

                    {!draft.isTaxExempt && draft.hasVat && (
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-zinc-500">
                            <span>Tax Amount</span>
                            <span className="text-zinc-200">{formatCurrency(totalTax)}</span>
                        </div>
                    )}

                    <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total Amount</span>
                            <p className="text-[10px] text-zinc-500 leading-none">
                                {draft.hasVat ? "Including all applicable taxes" : "Tax not applicable"}
                            </p>
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">
                            {formatCurrency(grandTotal)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}