// features/quotes/components/SendEmailModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSendEmail } from "../hooks/useSendEmail";

interface SendEmailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentId: string;
    documentNumber?: string;
    clientEmail?: string;
    clientName?: string;
    onSent?: () => void;
    documentLabel?: "devis" | "facture";
}

export function SendEmailModal({
    open,
    onOpenChange,
    documentId,
    documentNumber,
    clientEmail,
    clientName,
    onSent,
    documentLabel = "devis"
}: SendEmailModalProps) {
    const sendEmailMutation = useSendEmail();

    const [email, setEmail] = useState(clientEmail || "");
    const [customMessage, setCustomMessage] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset form quand le modal s'ouvre
    useEffect(() => {
        if (open) {
            setEmail(clientEmail || "");
            setCustomMessage("");
            setEmailError("");
            setIsSuccess(false);
        }
    }, [open, clientEmail]);

    // Validation email
    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (value && !validateEmail(value)) {
            setEmailError("Email invalide");
        } else {
            setEmailError("");
        }
    };

    const handleSend = async () => {
        if (!email) {
            setEmailError("L'email est requis");
            return;
        }

        if (!validateEmail(email)) {
            setEmailError("Email invalide");
            return;
        }

        try {
            await sendEmailMutation.mutateAsync({
                documentId,
                data: {
                    custom_message: customMessage || undefined,
                    override_email: email !== clientEmail ? email : undefined,
                },
            });

            setIsSuccess(true);
            onSent?.();
        } catch (error) {
            console.error("Erreur envoi email:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl dark:shadow-blue-900/10 p-4 sm:p-6 rounded-lg gap-6">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-[#2563EB] dark:bg-[#2563EB]/20 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/10">
                            <CheckCircle2 className="h-8 w-8 text-white dark:text-[#2563EB]" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                                Email envoyé avec succès
                            </h2>

                            <p className="text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto text-base">
                                {/* ✅ Texte dynamique */}
                                Le {documentLabel} a bien été envoyé à <br />
                                <span className="font-medium text-slate-900 dark:text-zinc-200">{email}</span>
                            </p>
                            
                        </div>
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto mt-4 px-8 rounded-md bg-[#2563EB] hover:bg-[#2563EB]/80 dark:bg-[#2563EB] dark:hover:bg-[#2563EB]/80 text-white transition-all duration-300"
                        >
                            Fermer
                        </Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="gap-2">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 flex items-center gap-3">
                                
                                Envoyer par email
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-zinc-400 text-base">
                                Envoyer {documentLabel =='devis' ? 'le' : 'la'} {documentLabel} <span className="font-medium text-slate-900 dark:text-zinc-200">{documentNumber || ""}</span> à votre client.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5">
                            {/* Email du client */}
                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                                    Email du destinataire <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Entrez l'email du client"
                                        value={email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        className="pl-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all rounded-md"
                                        disabled={sendEmailMutation.isPending}
                                    />
                                </div>
                                {emailError && (
                                    <p className="text-sm text-rose-500 flex items-center gap-1.5 mt-1">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {emailError}
                                    </p>
                                )}
                                {clientEmail && email === clientEmail && (
                                    <p className="text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Email par défaut du client : <span className="font-medium text-slate-700 dark:text-zinc-300">{clientName}</span>
                                    </p>
                                )}
                            </div>

                            {/* Message personnalisé */}
                            <div className="space-y-2.5">
                                <Label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-zinc-300 flex justify-between items-center">
                                    Message personnalisé
                                    <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">Optionnel</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Bonjour, veuillez trouver ci-joint votre devis..."
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    rows={4}
                                    className="bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 resize-none transition-all rounded-md"
                                    disabled={sendEmailMutation.isPending}
                                />
                                <p className="text-xs text-slate-500 dark:text-zinc-500">
                                    Ce message sera inclus dans le corps de l'email envoyé au client.
                                </p>
                            </div>

                            {/* Info box */}
                            <div className="p-4 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/10 border border-blue-100 dark:border-blue-500/20">
                                <div className="flex gap-3">

                                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                        Le client recevra un email avec un lien pour consulter  {documentLabel =='devis' ? 'le' : 'la'} {documentLabel} en ligne.
                                        Le statut  {documentLabel =='devis' ? 'du' : 'de la'} {documentLabel} sera automatiquement mis à jour en <span className="font-semibold">"Envoyé"</span>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 mt-2">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={sendEmailMutation.isPending}
                                className="rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={!email || !!emailError || sendEmailMutation.isPending}
                                className="rounded-md cursor-pointer bg-[#2563EB] hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all duration-300"
                            >
                                {sendEmailMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        
                                          Envoyer  {documentLabel =='devis' ? 'le' : 'la'} {documentLabel}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}