export type ContractKind = "prestation" | "cession" | "recurrent" | "nda"

export interface ContractKindMeta {
    id: ContractKind
    title: string
    useWhen: string
    itemsLabel: string
    dateLabel: string
}

export const CONTRACT_KINDS: ContractKindMeta[] = [
    {
        id: "prestation",
        title: "Prestation",
        useWhen: "Une mission, des livrables, une fin de chantier.",
        itemsLabel: "Prestations",
        dateLabel: "Fin prévue de la prestation",
    },
    {
        id: "cession",
        title: "Cession de droits",
        useWhen: "Transmettre l'usage d'une création, pas seulement l'exécuter.",
        itemsLabel: "Livrables cédés",
        dateLabel: "Fin de la cession",
    },
    {
        id: "recurrent",
        title: "Accompagnement",
        useWhen: "Un rythme, un forfait, un préavis.",
        itemsLabel: "Périmètre récurrent",
        dateLabel: "Fin de période",
    },
    {
        id: "nda",
        title: "Confidentialité",
        useWhen: "Protéger des échanges avant ou pendant un projet.",
        itemsLabel: "Informations concernées",
        dateLabel: "Fin de l'obligation",
    },
]

export function normalizeContractKind(value?: string | null): ContractKind {
    if (value === "cession" || value === "recurrent" || value === "nda" || value === "prestation") {
        return value
    }
    return "prestation"
}

export function contractKindMeta(value?: string | null): ContractKindMeta {
    const id = normalizeContractKind(value)
    return CONTRACT_KINDS.find((kind) => kind.id === id) || CONTRACT_KINDS[0]
}
