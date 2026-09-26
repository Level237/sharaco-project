"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/store/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User, Building2, Mail, MapPin, Loader2, Info, CheckCircle2, ShieldCheck } from "lucide-react";
import type { User as UserType } from "@/features/auth/types";

export function CompleteProfileModal() {
    const { data: user, isLoading } = useCurrentUser();
    const setUser = useAuthStore((s) => s.setUser);
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

    // Initialisation intelligente des champs
    useEffect(() => {
        if (isLoading || !user) return;

        const isDismissed = typeof window !== "undefined" && sessionStorage.getItem("sharaco_dismiss_profile_modal") === "true";
        if (isDismissed) {
            setHasBeenDismissed(true);
            return;
        }

        const isMissingFullName = !user.full_name || user.full_name.trim() === "";
        const isMissingEmail = !user.email || user.email.trim() === "";
        const isMissingCompanyName = !user.company_name || user.company_name.trim() === "";
        const isMissingAddress = !user.address || user.address.trim() === "";

        // Si au moins une information essentielle manque, on ouvre la modale
        if (isMissingFullName || isMissingEmail || isMissingCompanyName || isMissingAddress) {
            setFullName(user.full_name || "");
            setEmail(user.email || "");
            setCompanyName(user.company_name || "");
            setAddress(user.address || "");
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [user, isLoading]);

    // Calcul du taux de complétion en direct
    const completedCount = useMemo(() => {
        let count = 0;
        if (fullName.trim()) count++;
        if (email.trim()) count++;
        if (companyName.trim()) count++;
        if (address.trim()) count++;
        return count;
    }, [fullName, email, companyName, address]);

    const progressPercentage = Math.round((completedCount / 4) * 100);

    const handleDismiss = () => {
        setOpen(false);
        setHasBeenDismissed(true);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("sharaco_dismiss_profile_modal", "true");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: Record<string, string> = {};
        if (fullName.trim()) payload.full_name = fullName.trim();
        if (email.trim()) payload.email = email.trim();
        if (companyName.trim()) payload.company_name = companyName.trim();
        if (address.trim()) payload.address = address.trim();

        if (!payload.full_name && !payload.company_name) {
            toast.error("Veuillez renseigner au moins votre nom complet et le nom de votre entreprise.");
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedUser = await api.put<UserType>("/api/v1/auth/me", payload);

            if (updatedUser) {
                setUser(updatedUser);
            } else if (user) {
                setUser({
                    ...user,
                    ...payload,
                });
            }

            await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            await queryClient.invalidateQueries({ queryKey: ["user"] });

            toast.success("Informations enregistrées avec succès", {
                description: "Votre profil professionnel a été mis à jour.",
            });

            setOpen(false);
        } catch (error: any) {
            console.error("Erreur mise à jour profil:", error);
            toast.error("Impossible d'enregistrer les informations", {
                description: error?.detail || error?.message || "Veuillez réessayer ultérieurement.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || hasBeenDismissed) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) handleDismiss(); }}>
            <DialogContent className="max-w-[92vw] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl p-0 !z-[9999]">
                {/* Ligne d'accentuation supérieure (#2563EB) */}
                <div className="sticky top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#2563EB] via-blue-500 to-sky-400 z-10" />

                <div className="p-6 sm:p-7">
                    <DialogHeader className="mb-5 flex flex-col items-center text-center space-y-2">
                        <div className="h-13 w-13 rounded-2xl bg-[#2563EB]/10 dark:bg-[#2563EB]/20 flex items-center justify-center border border-[#2563EB]/20 shadow-inner mb-1 p-3">
                            <ShieldCheck className="h-7 w-7 text-[#2563EB]" />
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Complétez vos informations
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            Renseignez vos coordonnées pour activer la création de devis et factures conformes à votre activité.
                        </DialogDescription>

                        {/* Barre de progression intelligente */}
                        <div className="w-full max-w-xs pt-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                                <span>Profil complété</span>
                                <span className="text-[#2563EB]">{completedCount}/4 ({progressPercentage}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="p-4 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl space-y-3.5">
                            {/* Champ Nom complet */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="profile-fullname" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-[#2563EB]" />
                                        Nom complet
                                    </Label>
                                    {user?.full_name?.trim() ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3" /> Renseigné
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-full">
                                            Requis
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="profile-fullname"
                                    placeholder="Alexandre Martin"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={isSubmitting}
                                    className="h-11 bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-[#2563EB] text-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                                />
                            </div>

                            {/* Champ Nom de l'entreprise */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="profile-companyname" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                                        Nom de l'entreprise ou raison sociale
                                    </Label>
                                    {user?.company_name?.trim() ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3" /> Renseigné
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-full">
                                            Requis
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="profile-companyname"
                                    placeholder="Cabinet Conseil & Associés"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    disabled={isSubmitting}
                                    className="h-11 bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-[#2563EB] text-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                                />
                            </div>

                            {/* Champ Email */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="profile-email" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                                        Adresse email professionnelle
                                    </Label>
                                    {user?.email?.trim() ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3" /> Renseigné
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-full">
                                            Requis
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="profile-email"
                                    type="email"
                                    placeholder="contact@entreprise.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    className="h-11 bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-[#2563EB] text-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                                />
                            </div>

                            {/* Champ Adresse */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="profile-address" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                                        Adresse de facturation / domiciliation
                                    </Label>
                                    {user?.address?.trim() ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3" /> Renseigné
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-full">
                                            Recommandé
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="profile-address"
                                    placeholder="14 avenue des Champs-Élysées, 75008 Paris"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    disabled={isSubmitting}
                                    className="h-11 bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-[#2563EB] text-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Encadré informatif */}
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 text-xs text-blue-800 dark:text-blue-300">
                            <Info className="w-4 h-4 shrink-0 text-[#2563EB] mt-0.5" />
                            <span>
                                Ces informations sont intégrées directement sur les en-têtes et les mentions légales de vos devis et factures.
                            </span>
                        </div>

                        {/* Boutons d'actions */}
                        <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleDismiss}
                                disabled={isSubmitting}
                                className="h-11 rounded-xl font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex-1"
                            >
                                Plus tard
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || (!fullName.trim() && !companyName.trim())}
                                className="h-11 rounded-xl font-bold bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex-[1.4]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    "Enregistrer mes informations"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
