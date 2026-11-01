export type SpecKind = "mission" | "chantier" | "creation" | "accompagnement" | "cadrage" | "formation"

export interface SpecKindMeta {
    id: SpecKind
    title: string
    useWhen: string
}

export const SPEC_KINDS: SpecKindMeta[] = [
    { id: "mission", title: "Mission", useWhen: "Un besoin, des livrables, une fin." },
    { id: "chantier", title: "Intervention", useWhen: "Un lieu, des postes, une réception." },
    { id: "creation", title: "Création", useWhen: "Une intention, des fichiers, des retours." },
    { id: "accompagnement", title: "Accompagnement", useWhen: "Un rythme, un inclus / exclu." },
    { id: "cadrage", title: "Cadrage", useWhen: "Une étude avant de chiffrer ou d’exécuter." },
    { id: "formation", title: "Formation", useWhen: "Un public, un déroulé, un objectif." },
]

export function normalizeSpecKind(value?: string | null): SpecKind {
    if (SPEC_KINDS.some((kind) => kind.id === value)) return value as SpecKind
    return "mission"
}

export function specKindMeta(value?: string | null): SpecKindMeta {
    const id = normalizeSpecKind(value)
    return SPEC_KINDS.find((kind) => kind.id === id) || SPEC_KINDS[0]
}
