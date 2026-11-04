"use client"

import { useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useClients, useCreateClient } from "@/features/clients/hooks/useClients"
import type { Client } from "@/features/clients/types"
import { splitStoredAddress } from "../fromAccount"
import type { PublicInvoiceDraft } from "../types"

const FIELD =
    "h-9 rounded-md border border-white/10 bg-[#131722] text-xs text-white placeholder:text-slate-500 shadow-none hover:shadow-none focus:border-[#2563EB] focus:outline-none focus:ring-0 focus:shadow-none backdrop-blur-none"

export function fieldsFromClient(client: Client): Partial<PublicInvoiceDraft> {
    const { street, city } = splitStoredAddress(client.address)
    return {
        clientId: client.id,
        clientName: client.name || "",
        clientEmail: client.email || "",
        clientPhone: client.phone || "",
        clientAddress: street,
        clientCity: city,
    }
}

interface InvoiceClientPickerProps {
    selectedId: string | null
    onSelect: (patch: Partial<PublicInvoiceDraft>) => void
}

export function InvoiceClientPicker({ selectedId, onSelect }: InvoiceClientPickerProps) {
    const { data: clients, isLoading } = useClients(0, 100, { enabled: true })
    const createClient = useCreateClient()
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [formError, setFormError] = useState("")

    const resetForm = () => {
        setName("")
        setEmail("")
        setPhone("")
        setAddress("")
        setCity("")
        setFormError("")
    }

    const handleSelect = (id: string) => {
        if (!id) {
            onSelect({
                clientId: null,
                clientName: "",
                clientEmail: "",
                clientPhone: "",
                clientMobile: "",
                clientAddress: "",
                clientCity: "",
            })
            return
        }
        const client = clients?.find((row) => row.id === id)
        if (client) onSelect(fieldsFromClient(client))
    }

    const handleCreate = async () => {
        if (!name.trim()) {
            setFormError("Le nom du client est obligatoire.")
            return
        }
        setFormError("")
        try {
            const client = await createClient.mutateAsync({
                name: name.trim(),
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                address: [address.trim(), city.trim()].filter(Boolean).join("\n") || undefined,
            })
            onSelect(fieldsFromClient(client))
            setOpen(false)
            resetForm()
        } catch {
            setFormError("Impossible de créer le client.")
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <select
                    value={selectedId || ""}
                    onChange={(e) => handleSelect(e.target.value)}
                    className="h-9 min-w-0 flex-1 rounded-md border border-white/10 bg-[#131722] px-2.5 text-xs font-medium text-white focus:border-[#2563EB] focus:outline-none"
                >
                    <option value="">Choisir un client</option>
                    {clients?.map((client) => (
                        <option key={client.id} value={client.id} className="bg-[#111520]">
                            {client.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md bg-[#2563EB] px-2.5 text-[11px] font-semibold text-white hover:bg-[#1d4ed8]"
                >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Nouveau
                </button>
            </div>

            {open ? (
                <div className="space-y-2 rounded-md border border-white/10 bg-[#111520] p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Nouveau client
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false)
                                resetForm()
                            }}
                            className="text-slate-400 hover:text-white"
                            aria-label="Fermer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nom du client"
                        className={FIELD}
                    />
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className={FIELD}
                    />
                    <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Téléphone"
                        className={FIELD}
                    />
                    <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Quartier / Rue"
                        className={FIELD}
                    />
                    <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ville"
                        className={FIELD}
                    />
                    {formError ? <p className="text-[11px] text-rose-300">{formError}</p> : null}
                    <button
                        type="button"
                        disabled={createClient.isPending}
                        onClick={() => void handleCreate()}
                        className="h-9 w-full rounded-md bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                    >
                        {createClient.isPending ? "Création…" : "Ajouter le client"}
                    </button>
                </div>
            ) : null}
        </div>
    )
}
