// features/quotes/components/EditorPanel.tsx
"use client";

import { QuoteDraft, QuoteLineItem } from "../../types/QuoteBuilder";
import { User, Calendar, Paintbrush, ReceiptText, CreditCard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuoteTotal } from "../../hooks/useQuoteTotal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabDetails } from "./tabs/TabDetails";
import { TabClient } from "./tabs/TabClient";
import { TabItems } from "./tabs/TabItems";
import { TabDesign } from "./tabs/TabDesign";
import { PaymentScheduleEditor, getDefaultTriggerDate } from "@/features/invoices/components/PaymentScheduleEditor";
import { cn } from "@/lib/utils";

interface EditorPanelProps {
    draft: QuoteDraft;
    onChange: <K extends keyof QuoteDraft>(field: K, value: QuoteDraft[K]) => void;
    onItemChange: <K extends keyof QuoteLineItem>(id: string, field: K, value: QuoteLineItem[K]) => void;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
    isMobile?: boolean;
    onClose?: () => void;
}

export function EditorPanel({ 
    draft, 
    onChange, 
    onItemChange, 
    onAddItem, 
    onRemoveItem,
    isMobile = false,
    onClose,
}: EditorPanelProps) {
    const { grandTotal } = useQuoteTotal(draft.items, draft.hasVat, draft.vatRate, draft.discountRate, draft.isTaxExempt);

    const handlePaymentModeChange = (mode: 'simple' | 'schedule') => {
        onChange('paymentMode', mode);

        if (mode === 'schedule') {
            const currentMilestones = draft.paymentMilestones || [];
            const totalPercent = currentMilestones.reduce(
                (sum, m) => sum + (m.percent || 0),
                0
            );
            const isValid = Math.abs(totalPercent - 100) < 0.01;
            const hasDefaultMilestone =
                currentMilestones.length === 1 &&
                currentMilestones[0].percent === 100 &&
                currentMilestones[0].title === 'Paiement intégral';

            if (!isValid || currentMilestones.length === 0 || hasDefaultMilestone) {
                const defaultDate = getDefaultTriggerDate(30);
                onChange('paymentMilestones', [
                    {
                        id: crypto.randomUUID(),
                        title: 'Acompte à la commande',
                        percent: 50,
                        description: '',
                        trigger_date: defaultDate,
                    },
                    {
                        id: crypto.randomUUID(),
                        title: 'Solde à la livraison',
                        percent: 50,
                        description: '',
                        trigger_date: defaultDate,
                    },
                ]);
            }
        } else {
            onChange('paymentMilestones', [
                {
                    id: crypto.randomUUID(),
                    title: 'Paiement intégral',
                    percent: 100,
                    description: '',
                    trigger_date: '',
                },
            ]);
        }
    };

    return (
        <div className={cn(
            "w-full h-full bg-zinc-950 flex flex-col border-r border-white/5 relative z-20",
            isMobile ? "pt-0" : "pt-[72px]"
        )}>
            <Tabs defaultValue="items" className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs navigation */}
                <div className={cn(
                    "bg-zinc-950 shrink-0",
                    isMobile ? "px-3 py-2" : "px-6 py-4"
                )}>
                    <TabsList className={cn(
                        "w-full bg-zinc-900/50 border border-white/5 rounded-xl flex",
                        isMobile ? "h-10 p-0.5" : "h-11 p-1"
                    )}>
                        {[
                            { value: "items", icon: ReceiptText, label: "Items" },
                            { value: "client", icon: User, label: "Client" },
                          
                            { value: "payment", icon: CreditCard, label: "Paiement" },
                            { value: "design", icon: Paintbrush, label: "Design" },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={cn(
                                    "flex-1 cursor-pointer rounded-lg text-zinc-500 data-[state=active]:bg-white/5 data-[state=active]:text-white font-bold uppercase tracking-widest transition-all gap-2",
                                    isMobile ? "text-[9px] py-1.5" : "text-[10px]"
                                )}
                            >
                                <tab.icon className={cn(
                                    "stroke-[2]",
                                    isMobile ? "w-3 h-3" : "w-3.5 h-3.5"
                                )} />
                                <span className={cn(
                                    isMobile ? "hidden sm:inline" : "hidden xl:inline"
                                )}>
                                    {tab.label}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* Contenu scrollable */}
                <ScrollArea className="flex-1">
                    <div className={cn(
                        "max-w-2xl mx-auto w-full",
                        isMobile ? "px-4 py-4 pb-24" : "px-6 py-4 pb-32"
                    )}>
                        <TabsContent value="details" className="mt-0 outline-none">
                            <TabDetails draft={draft} onChange={onChange} />
                        </TabsContent>

                        <TabsContent value="client" className="mt-0 outline-none">
                            <TabClient draft={draft} onChange={onChange} />
                        </TabsContent>

                        <TabsContent value="items" className="mt-0 outline-none">
                            <TabItems
                                draft={draft}
                                onItemChange={onItemChange}
                                onAddItem={onAddItem}
                                onRemoveItem={onRemoveItem}
                                onDraftChange={onChange}
                            />
                        </TabsContent>

                        <TabsContent value="payment" className="mt-0 outline-none">
                            <PaymentScheduleEditor
                                totalAmount={grandTotal}
                                value={draft.paymentMilestones}
                                onChange={(milestones) => onChange('paymentMilestones', milestones)}
                                paymentMode={draft.paymentMode}
                                onModeChange={handlePaymentModeChange}
                                disabled={false}
                            />
                        </TabsContent>

                        <TabsContent value="design" className="mt-0 outline-none">
                            <TabDesign draft={draft} onChange={onChange} />
                        </TabsContent>
                    </div>
                </ScrollArea>
            </Tabs>
        </div>
    );
}