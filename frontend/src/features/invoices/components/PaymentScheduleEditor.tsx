// components/quotes/PaymentScheduleEditor.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
    Plus, Trash2, GripVertical, Calendar, 
    CheckCircle2, AlertCircle, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/features/quotes/lib/formatCurrency';

export const getDefaultTriggerDate = (daysToAdd = 30): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface Milestone {
    id: string;
    title: string;
    percent: number;
    description: string;
    trigger_date: string; // YYYY-MM-DD
}

interface PaymentScheduleEditorProps {
    totalAmount: number; // en centimes
    value: Milestone[];
    onChange: (milestones: Milestone[]) => void;
    paymentMode: 'simple' | 'schedule';
    onModeChange: (mode: 'simple' | 'schedule') => void;
    disabled?: boolean;
}

// Templates prédéfinis
const TEMPLATES = [
    {
        name: '50/50',
        label: '50% / 50%',
        milestones: [
            { title: 'Acompte à la commande', percent: 50 },
            { title: 'Solde à la livraison', percent: 50 },
        ],
    },
    {
        name: '30-40-30',
        label: '30% / 40% / 30%',
        milestones: [
            { title: 'Acompte à la signature', percent: 30 },
            { title: 'Mi-parcours (livraison MVP)', percent: 40 },
            { title: 'Solde à la livraison finale', percent: 30 },
        ],
    },
    {
        name: '3x33',
        label: '3 × 33%',
        milestones: [
            { title: '1er tiers', percent: 33.33 },
            { title: '2ème tiers', percent: 33.33 },
            { title: 'Solde', percent: 33.34 },
        ],
    },
    {
        name: '100',
        label: '100% à la commande',
        milestones: [
            { title: 'Paiement intégral', percent: 100 },
        ],
    },
];

// Helper pour trouver si les jalons actuels correspondent à un template
const findMatchingTemplate = (milestones: Milestone[]): string | null => {
    if (!milestones || milestones.length === 0) return null;
    for (const template of TEMPLATES) {
        if (template.milestones.length === milestones.length) {
            const isMatch = template.milestones.every(
                (tm, i) => Math.abs(tm.percent - (milestones[i]?.percent || 0)) < 0.01
            );
            if (isMatch) return template.name;
        }
    }
    return null;
};

export function PaymentScheduleEditor({
    totalAmount,
    value,
    onChange,
    paymentMode,
    onModeChange,
    disabled,
}: PaymentScheduleEditorProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    // Détecter automatiquement le template correspondant et l'affichage des jalons
    const matchingTemplateName = useMemo(() => findMatchingTemplate(value), [value]);
    const activeTemplate = selectedTemplate || matchingTemplateName;
    const hasMilestones = Boolean(value && value.length > 0);
    const showEditor = Boolean(activeTemplate || hasMilestones);

    // Calcul du total et validation
    const totalPercent = useMemo(
        () => value.reduce((sum, m) => sum + m.percent, 0),
        [value]
    );
    const isValidPercent = Math.abs(totalPercent - 100) < 0.01;
    const hasDates = useMemo(
        () => value.every(m => Boolean(m.trigger_date && m.trigger_date.trim() !== '')),
        [value]
    );
    const isValid = isValidPercent && hasDates;

    // Auto-initialisation si le mode échéancier est actif et la liste est vide
    useEffect(() => {
        if (paymentMode === 'schedule' && (!value || value.length === 0)) {
            const defaultDate = getDefaultTriggerDate(30);
            onChange([
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
    }, [paymentMode, value, onChange]);

    // Assurer qu'une date par défaut (+30j) existe pour les échéances sans date
    useEffect(() => {
        if (value && value.length > 0) {
            const hasMissingDate = value.some(m => !m.trigger_date);
            if (hasMissingDate) {
                const defaultDate = getDefaultTriggerDate(30);
                onChange(value.map(m => m.trigger_date ? m : { ...m, trigger_date: defaultDate }));
            }
        }
    }, [value, onChange]);

    // Formatage monnaie
    

    // Calcul du montant pour une échéance
    const calculateAmount = (percent: number) => {
        return Math.round(totalAmount * percent / 100);
    };

    // Ajouter une échéance vide (avec date par défaut J+30)
    const addMilestone = () => {
        onChange([
            ...value,
            {
                id: crypto.randomUUID(),
                title: '',
                percent: 0,
                description: '',
                trigger_date: getDefaultTriggerDate(30),
            },
        ]);
    };

    // Supprimer une échéance
    const removeMilestone = (id: string) => {
        onChange(value.filter(m => m.id !== id));
    };

    // Mettre à jour une échéance
    const updateMilestone = (id: string, field: keyof Milestone, newValue: string | number) => {
        onChange(
            value.map(m => (m.id === id ? { ...m, [field]: newValue } : m))
        );
    };

    // Appliquer un template avec date par défaut (J+30)
    const applyTemplate = (template: typeof TEMPLATES[0]) => {
        setSelectedTemplate(template.name);
        const defaultDate = getDefaultTriggerDate(30);
        onChange(
            template.milestones.map(m => ({
                id: crypto.randomUUID(),
                title: m.title,
                percent: m.percent,
                description: '',
                trigger_date: defaultDate,
            }))
        );
    };

    const handleModeChange = (nextMode: 'simple' | 'schedule') => {
        onModeChange(nextMode);
        if (nextMode !== 'schedule') {
            setSelectedTemplate(null);
        }
    };

    const hasExistingSchedule = paymentMode === 'schedule' && value && value.length > 0;

    return (
        <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                             Modalités de paiement
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">
                            Définissez comment votre client vous règlera
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Choix du mode ou affichage direct si un échéancier existe déjà */}
                {hasExistingSchedule ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs sm:text-sm font-bold text-white">
                                Échéancier de paiement ({value.length} {value.length > 1 ? 'échéances' : 'échéance'})
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleModeChange('simple')}
                            className="text-xs text-zinc-400 hover:text-white h-7 px-2"
                        >
                            Changer le mode
                        </Button>
                    </div>
                ) : (
                    <RadioGroup
                        value={paymentMode}
                        onValueChange={(v) => handleModeChange(v as 'simple' | 'schedule')}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        disabled={disabled}
                    >
                        <label
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                                paymentMode === 'simple'
                                    ? "border-[#2563EB] bg-[#2563EB]/5"
                                    : "border-zinc-800 hover:border-zinc-700"
                            )}
                        >
                            <RadioGroupItem value="simple" className="mt-1" />
                            <div>
                                <div className="font-bold text-white">Paiement simple</div>
                                <div className="text-xs text-zinc-400 mt-0.5">
                                    100% à la livraison (pas d&apos;acompte)
                                </div>
                            </div>
                        </label>

                        <label
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                                paymentMode === 'schedule'
                                    ? "border-[#2563EB] bg-[#2563EB]/5"
                                    : "border-zinc-800 hover:border-zinc-700"
                            )}
                        >
                            <RadioGroupItem value="schedule" className="mt-1" />
                            <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                    Échéancier
                                    <span className="px-1.5 py-0.5 text-[7px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
                                        RECOMMANDÉ
                                    </span>
                                </div>
                                <div className="text-xs text-zinc-400 mt-0.5">
                                    Paiement échelonné (acompte + tranches)
                                </div>
                            </div>
                        </label>
                    </RadioGroup>
                )}

                {/* Section échéancier (uniquement si mode schedule) */}
                <AnimatePresence mode="wait">
                    {paymentMode === 'schedule' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            <div>
                                <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                                    Templates rapides
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {TEMPLATES.map(template => {
                                        const isSelected = activeTemplate === template.name;
                                        return (
                                            <button
                                                key={template.name}
                                                type="button"
                                                onClick={() => applyTemplate(template)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                    "border border-zinc-800 text-zinc-300",
                                                    isSelected
                                                        ? "border-[#2563EB] bg-[#2563EB]/10 text-white"
                                                        : "hover:border-[#2563EB] hover:bg-[#2563EB]/10 hover:text-white"
                                                )}
                                            >
                                                <Zap className="h-3 w-3 inline mr-1" />
                                                {template.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {showEditor ? (
                                <>
                                    <div className="space-y-3">
                                        {value.map((milestone, index) => (
                                            <motion.div
                                                key={milestone.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab" />
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-[#2563EB]/20 text-[#2563EB] text-xs font-black flex items-center justify-center">
                                                                {index + 1}
                                                            </div>
                                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                                                Échéance
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {value.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMilestone(milestone.id)}
                                                            className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="md:col-span-2">
                                                        <Label className="text-xs text-zinc-400 font-bold">
                                                            Titre
                                                        </Label>
                                                        <Input
                                                            value={milestone.title}
                                                            onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                                            placeholder="Ex: Acompte à la signature"
                                                            className="h-9 bg-zinc-950 border-zinc-800 text-white mt-1"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs text-zinc-400 font-bold">
                                                            Pourcentage
                                                        </Label>
                                                        <div className="relative mt-1">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                step={0.01}
                                                                value={milestone.percent}
                                                                onChange={(e) => updateMilestone(milestone.id, 'percent', parseFloat(e.target.value) || 0)}
                                                                className="h-9 bg-zinc-950 border-zinc-800 text-white pr-8"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-zinc-500">Montant :</span>
                                                        <span className="font-bold text-white">
                                                            
                                                            {formatCurrency(calculateAmount(milestone.percent))}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                                        <Input
                                                            type="date"
                                                            required
                                                            value={milestone.trigger_date || getDefaultTriggerDate(30)}
                                                            onChange={(e) => updateMilestone(milestone.id, 'trigger_date', e.target.value)}
                                                            className={cn(
                                                                "h-7 bg-zinc-950 border-zinc-800 text-white text-xs w-36",
                                                                !milestone.trigger_date && "border-red-500/50"
                                                            )}
                                                            placeholder="Date prévue"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={addMilestone}
                                        variant="outline"
                                        className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajouter une échéance
                                    </Button>

                                    <div
                                        className={cn(
                                            "p-4 rounded-xl border transition-all",
                                            isValid
                                                ? "border-emerald-500/30 bg-emerald-500/5"
                                                : "border-red-500/30 bg-red-500/5"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {isValid ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-400" />
                                                )}
                                                <span className="text-sm font-bold text-white">
                                                    Total de l&apos;échéancier
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-white">
                                                    {totalPercent.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-zinc-400">
                                                    {formatCurrency(totalAmount)}
                                                </div>
                                            </div>
                                        </div>
                                        {!isValidPercent && (
                                            <p className="text-xs text-red-400 mt-2">
                                                {totalPercent < 100
                                                    ? `⚠️ Il manque ${(100 - totalPercent).toFixed(1)}% pour atteindre 100%`
                                                    : `⚠️ Vous dépassez de ${(totalPercent - 100).toFixed(1)}% (max 100%)`}
                                            </p>
                                        )}
                                        {!hasDates && (
                                            <p className="text-xs text-red-400 mt-2">
                                                ⚠️ La date d&apos;échéance est requise pour toutes les tranches
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-400">
                                    Choisissez un template rapide pour afficher les tranches de paiement.
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}