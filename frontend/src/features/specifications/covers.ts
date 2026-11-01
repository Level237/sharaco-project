export type SpecCover = "spine" | "masthead" | "folio" | "panel" | "ledger"

export interface SpecCoverMeta {
    id: SpecCover
    title: string
    useWhen: string
}

export const SPEC_COVERS: SpecCoverMeta[] = [
    { id: "spine", title: "Dossier", useWhen: "Bande verticale." },
    { id: "masthead", title: "Bandeau", useWhen: "En-tête pleine largeur." },
    { id: "folio", title: "Folio", useWhen: "Grand titre, filet." },
    { id: "panel", title: "Panneau", useWhen: "Plaque couleur." },
    { id: "ledger", title: "Fiche", useWhen: "Mentions en grille." },
]

export function normalizeSpecCover(value?: string | null): SpecCover {
    if (SPEC_COVERS.some((cover) => cover.id === value)) return value as SpecCover
    return "spine"
}
