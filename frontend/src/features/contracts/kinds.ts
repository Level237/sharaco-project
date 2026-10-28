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

export const DEFAULT_CONTRACT_RULES: Record<ContractKind, { title: string; body: string }[]> = {
    prestation: [
        {
            title: "Objet",
            body: "Le prestataire réalise la mission définie avec le client, dans le cadre du projet auquel ce contrat est rattaché.",
        },
        {
            title: "Obligations",
            body: "Chaque partie communique les informations nécessaires à la bonne exécution. Le client valide les livrables dans un délai raisonnable.",
        },
        {
            title: "Paiement",
            body: "Les sommes dues suivent les conditions convenues entre les parties. Un retard peut suspendre la poursuite des travaux.",
        },
        {
            title: "Fin du contrat",
            body: "Une partie peut mettre fin au contrat par écrit, sous réserve des prestations déjà réalisées et des sommes déjà dues.",
        },
    ],
    cession: [
        {
            title: "Livrables concernés",
            body: "Le cédant transmet les droits sur les livrables décrits dans ce contrat, pour l'usage convenu avec le cessionnaire.",
        },
        {
            title: "Étendue",
            body: "La cession porte sur le territoire, la durée et les supports indiqués dans les conditions particulières. À défaut, elle reste limitée à l'usage du projet.",
        },
        {
            title: "Mentions",
            body: "Si une mention d'auteur est prévue, le cessionnaire la conserve sur les supports concernés.",
        },
        {
            title: "Hors cadre",
            body: "Toute utilisation hors du cadre convenu nécessite un avenant écrit.",
        },
    ],
    recurrent: [
        {
            title: "Rythme",
            body: "Les prestations sont fournies de façon récurrente, selon le rythme convenu entre les parties.",
        },
        {
            title: "Résiliation",
            body: "Chaque partie peut résilier par écrit, avec un préavis raisonnable, sauf faute grave.",
        },
        {
            title: "Révision",
            body: "Le forfait peut être ajusté d'un commun accord, notamment si le volume de travail change.",
        },
        {
            title: "Impayé",
            body: "Le prestataire peut suspendre l'accompagnement en cas de retard de paiement.",
        },
    ],
    nda: [
        {
            title: "Secret",
            body: "Les informations échangées restent confidentielles et ne sont pas divulguées à des tiers sans accord écrit.",
        },
        {
            title: "Usage",
            body: "Elles ne servent qu'à évaluer ou exécuter le projet. Toute autre utilisation est exclue.",
        },
        {
            title: "Durée",
            body: "L'obligation dure vingt-quatre mois après la fin des échanges, sauf accord contraire dans les conditions particulières.",
        },
        {
            title: "Restitution",
            body: "Sur demande, les documents confidentiels sont restitués ou détruits, hors copies légalement conservées.",
        },
    ],
}

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
