"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { useCreateClient } from "../hooks/useClients";

interface CreateClientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateClientModal({ open, onOpenChange }: CreateClientModalProps) {
    const { mutate: createClient, isPending } = useCreateClient();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const resetForm = () => {
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
    };

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createClient(
            {
                name,
                email: email || undefined,
                phone: phone || undefined,
                address: address || undefined,
            },
            {
                onSuccess: () => {
                    handleClose();
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#2563EB] to-sky-500" />
                
                <div className="p-6">
                    <DialogHeader className="mb-6 flex flex-row items-center gap-4 space-y-0 text-left">
                        <div className="h-12 w-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center border border-[#2563EB]/20 shadow-sm shrink-0">
                            <UserPlus className="h-6 w-6 text-[#2563EB]" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                                Ajouter un client
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Saisissez les informations du nouveau client.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-name" className="text-slate-700 dark:text-slate-300 font-bold ml-1">Nom complet *</Label>
                            <Input
                                id="create-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-[#2563EB]"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="create-email" className="text-slate-700 dark:text-slate-300 font-bold ml-1">Email</Label>
                            <Input
                                id="create-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-[#2563EB]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="create-phone" className="text-slate-700 dark:text-slate-300 font-bold ml-1">Téléphone</Label>
                            <Input
                                id="create-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-[#2563EB]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="create-address" className="text-slate-700 dark:text-slate-300 font-bold ml-1">Adresse</Label>
                            <Input
                                id="create-address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-[#2563EB]"
                            />
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                                className="rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !name.trim()}
                                className="bg-[#2563EB] hover:bg-[#2563EB]/80 text-white rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all font-bold px-6"
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ajouter le client"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
