"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, FolderPlus, Edit3 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { clientsApi } from "@/features/clients/api/clientsApi"

import { useRouter } from "next/navigation"
import { useCreateProject, useUpdateProject } from "../hooks/useProject"
import { Project } from "../types"

interface CreateProjectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    project?: Project
}

export function CreateProjectModal({ open, onOpenChange, project }: CreateProjectModalProps) {
    const router = useRouter()
    const createMutation = useCreateProject()
    const updateMutation = useUpdateProject()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [clientId, setClientId] = useState("")
    const [budget, setBudget] = useState("")

    const isPending = createMutation.isPending || updateMutation.isPending

    // Charger les clients pour le select
    const { data: clients = [], isLoading: isLoadingClients } = useQuery({
        queryKey: ['clients'],
        queryFn: () => clientsApi.getAll(),
        enabled: open,
    })

    // Reset form quand on ouvre/ferme
    useEffect(() => {
        if (open) {
            setName(project?.name || "")
            setDescription(project?.description || "")
            setClientId(project?.client_id || "")
            setBudget(project?.budget_cents ? (project.budget_cents / 100).toString() : "")
        } else {
            setName("")
            setDescription("")
            setClientId("")
            setBudget("")
        }
    }, [open, project])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !clientId) return

        try {
            const data = {
                name,
                description: description || undefined,
                client_id: clientId,
                budget_cents: budget ? parseInt(budget) * 100 : undefined,
                status: project ? project.status : "DRAFT"
            }

            if (project) {
                await updateMutation.mutateAsync({ id: project.id, data })
                onOpenChange(false)
            } else {
                const newProject = await createMutation.mutateAsync(data)
                onOpenChange(false)
                router.push(`/dashboard/projects/${newProject.id}`)
            }
        } catch (error) {
            console.error("Erreur:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[92vw] sm:max-w-[400px] p-0 overflow-hidden bg-white/70 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border-slate-200/50 dark:border-white/10 shadow-2xl rounded-3xl">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* ═══════════════════════════════════════════════════════════
                        TOP AREA - Icon & Name
                    ═══════════════════════════════════════════════════════════ */}
                    <div className="pt-8 sm:pt-10 pb-5 sm:pb-6 px-4 sm:px-6 flex flex-col items-center justify-center bg-gradient-to-b from-blue-500/10 to-transparent">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 dark:bg-blue-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner ring-1 ring-white/20 dark:ring-white/10 relative group">
                            {project ? (
                                <Edit3 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 duration-300" strokeWidth={1.5} />
                            ) : (
                                <FolderPlus className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 duration-300" strokeWidth={1.5} />
                            )}
                        </div>

                        <input
                            autoFocus
                            placeholder={project ? "Modifier le dossier" : "Nouveau dossier"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full text-center text-xl sm:text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        PROPERTIES AREA
                    ═══════════════════════════════════════════════════════════ */}
                    <div className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-3 sm:space-y-4">
                        <div className="p-1.5 sm:p-2 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                            {/* ═══════════ Client Field ═══════════ */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-3 py-2 gap-1 sm:gap-4">
                                <Label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 sm:w-24 sm:shrink-0">
                                    Client
                                </Label>
                                <Select value={clientId} onValueChange={setClientId} required>
                                    <SelectTrigger className="h-8 sm:h-9 border-none bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 shadow-none focus:ring-0 text-left sm:text-right font-medium w-full">
                                        <SelectValue placeholder="Sélectionner un client..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[100]">
                                        {isLoadingClients ? (
                                            <div className="p-2 text-center text-sm bg-white text-slate-500">
                                                Chargement...
                                            </div>
                                        ) : clients.length === 0 ? (
                                            <div className="p-2 text-center text-sm bg-white text-slate-500">
                                                Aucun client
                                            </div>
                                        ) : (
                                            clients.map((client: any) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="h-px bg-slate-200/50 dark:bg-white/5 w-full my-1" />

                            {/* ═══════════ Budget Field ═══════════ */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-3 py-2 gap-1 sm:gap-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                <Label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 sm:w-24 sm:shrink-0">
                                    Budget (FCFA)
                                </Label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="w-full text-left sm:text-right bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="h-px bg-slate-200/50 dark:bg-white/5 w-full my-1" />

                            {/* ═══════════ Description Field ═══════════ */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-2 sm:px-3 py-2 gap-1 sm:gap-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                <Label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 sm:w-24 sm:shrink-0 sm:mt-1">
                                    Note
                                </Label>
                                <textarea
                                    placeholder="Description du projet..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full text-left sm:text-right bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-slate-900 dark:text-white resize-none"
                                />
                            </div>
                        </div>

                        {/* ═══════════ Actions ═══════════ */}
                        <div className="flex gap-2 sm:gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                                className="flex-1 rounded-xl h-10 sm:h-11 text-sm hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={!name || !clientId || isPending}
                                className="flex-1 rounded-xl h-10 sm:h-11 text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    project ? "Enregistrer" : "Créer"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}