import type { SelectedNode } from "../components/WorkflowInspector";
import type { WorkflowId } from "./workflows";

export type ReminderTourScope = WorkflowId | "list";

export type ReminderTourApi = {
    select: (node: SelectedNode | null) => void;
    focusNode: (id: string | null) => void;
};

export type ReminderTourStep = {
    element?: string;
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    node?: SelectedNode;
};

function isMobile() {
    return typeof window !== "undefined" && window.innerWidth < 768;
}

function side(prefer: "left" | "right" | "top" | "bottom"): ReminderTourStep["side"] {
    if (isMobile()) return prefer === "left" || prefer === "right" ? "bottom" : prefer;
    return prefer;
}

export function reminderTourSteps(scope: ReminderTourScope): ReminderTourStep[] {
    const compact = isMobile();

    if (scope === "list") {
        return [
            {
                title: "Deux relances distinctes",
                description:
                    "Devis et facture ne se mélangent jamais. Chaque fil a son graphe, ses règles d’arrêt et ses emails. Ouvrez une carte pour voir le détail.",
            },
            {
                element: '[data-tour="relance-list-devis"]',
                title: "Relance devis",
                description:
                    "Après l’envoi d’un devis, jusqu’à 3 emails peuvent partir (par défaut 2, 5 et 10 jours plus tard). Lorsque le client ouvre, accepte ou refuse le devis, les relances s’arrêtent. Vous réglez les délais et les sujets dans le graphe.",
                side: side("bottom"),
            },
            {
                element: '[data-tour="relance-list-facture"]',
                title: "Relance facture",
                description:
                    "Autour de l’échéance, un email part 3 jours avant, puis un autre la veille. Après la date limite, rien ne part tout seul au client : vous êtes prévenu d’abord pour confirmer si la facture est déjà payée.",
                side: side("bottom"),
            },
        ];
    }

    if (scope === "devis") {
        return [
            {
                element: '[data-tour="relance-canvas"]',
                title: "Le graphe de relance",
                description: compact
                    ? "Glissez le fond, pincez pour zoomer, touchez une carte. Le panneau du bas affiche les champs de la carte."
                    : "Glissez le fond, zoomez, cliquez une carte. Le panneau de droite montre les champs à régler pour cette carte.",
                side: side("bottom"),
            },
            {
                element: '[data-tour="relance-zoom"]',
                title: "Zoom et cadrage",
                description:
                    "− / + pour zoomer, le pourcentage pour 100 %, le cadre pour tout voir. Sur mobile, pincez le graphe.",
                side: side("top"),
            },
            {
                element: '[data-tour="relance-devis-trigger"]',
                title: "Devis envoyé",
                description:
                    "Dès que vous envoyez le devis par email, ce fil commence. Le jour de l’envoi, aucun message de relance n’est envoyé. Il n’y a rien à régler sur cette carte.",
                side: side("right"),
                node: { workflow: "devis", id: "trigger" },
            },
            {
                element: '[data-tour="relance-devis-gate"]',
                title: "État du devis",
                description:
                    "Avant d’envoyer une relance, Sharaco regarde où en est le devis. Si le client l’a déjà ouvert, accepté ou refusé, aucun email ne part. Sinon, le palier suivant peut s’envoyer.",
                side: side("right"),
                node: { workflow: "devis", id: "gate" },
            },
            {
                element: '[data-tour="relance-devis-stop"]',
                title: "On coupe tout",
                description:
                    "Lorsque le devis est accepté ou refusé, les relances s’arrêtent tout de suite, même le jour de l’envoi. Vous n’envoyez plus de J+2, J+5 ni J+10. Si le client ouvre seulement le devis sans décider, vous choisissez dans le formulaire à droite (ou en bas sur mobile) si cela arrête aussi les relances.",
                side: side("bottom"),
                node: { workflow: "devis", id: "stop" },
            },
            {
                element: '[data-tour="relance-field-stop-view"]',
                title: "Couper à l’ouverture",
                description:
                    "Si vous activez cette option, dès que le client ouvre le devis, plus aucun email de relance n’est envoyé. Si vous la désactivez, Sharaco continue de relancer tant que le devis n’est ni accepté ni refusé. Cliquez sur Enregistrer pour garder ce choix.",
                side: side("left"),
                node: { workflow: "devis", id: "stop" },
            },
            ...mailFormSteps(
                1,
                "mail1",
                "Bien reçu ?",
                "C’est le premier email de relance, quelques jours après l’envoi. Il demande simplement si le client a bien reçu le devis, avec le lien pour l’ouvrir."
            ),
            ...mailFormSteps(
                2,
                "mail2",
                "Questions ?",
                "C’est le deuxième email, plus tard. Il part à sa propre date. Si vous désactivez le premier email, celui-ci peut quand même s’envoyer."
            ),
            ...mailFormSteps(
                3,
                "mail3",
                "Expiration",
                "C’est le dernier email de relance, souvent près de la fin de validité du devis. Après celui-ci, Sharaco n’envoie plus de quatrième message."
            ),
            {
                element: '[data-tour="relance-devis-idle"]',
                title: "Silence",
                description:
                    "Quand les emails de relance prévus ont été envoyés, Sharaco s’arrête. Il n’y a pas de formulaire ici et aucun email supplémentaire ne part.",
                side: side("left"),
                node: { workflow: "devis", id: "idle" },
            },
            {
                element: '[data-tour="relance-devis-active"]',
                title: "Fil actif",
                description:
                    "Cet interrupteur allume ou éteint toute la relance devis pour votre compte. S’il est désactivé, aucun des trois emails ne part, même si les paliers sont cochés.",
                side: side("bottom"),
            },
            {
                element: '[data-tour="relance-devis-save"]',
                title: "Sauver",
                description:
                    "Les délais, les sujets et les interrupteurs ne sont pris en compte qu’après un clic sur Enregistrer ou Sauver. Ces réglages s’appliquent seulement à votre compte.",
                side: side("bottom"),
            },
        ];
    }

    return [
        {
            element: '[data-tour="relance-canvas"]',
            title: "Relance facture",
            description: compact
                ? "Fil autour de l’échéance J0, séparé du devis. Touchez une carte : le détail s’ouvre en bas."
                : "Fil autour de l’échéance J0, séparé du devis. Cliquez une carte pour lire la règle dans le panneau.",
            side: side("bottom"),
        },
        {
            element: '[data-tour="relance-facture-trigger"]',
            title: "Facture envoyée",
            description:
                    "Dès que vous envoyez la facture, ce fil suit sa date d’échéance. Il n’y a rien à régler sur cette carte.",
            side: side("right"),
            node: { workflow: "facture", id: "trigger" },
        },
        {
            element: '[data-tour="relance-facture-gate"]',
            title: "Statut facture",
            description:
                "Avant chaque email, Sharaco vérifie si la facture est déjà marquée comme payée. Si oui, aucun rappel ne part, ni avant ni après l’échéance.",
            side: side("right"),
            node: { workflow: "facture", id: "gate" },
        },
        {
            element: '[data-tour="relance-facture-stop"]',
            title: "Fil arrêté",
            description:
                "Lorsque la facture est payée, les relances s’arrêtent tout de suite. Aucun email de rappel n’est envoyé ensuite. Il n’y a rien à régler sur cette carte.",
            side: side("bottom"),
            node: { workflow: "facture", id: "stop" },
        },
        {
            element: '[data-tour="relance-facture-j3"]',
            title: "J-3 · Prévention",
            description:
                "Trois jours avant la date limite, le client reçoit automatiquement un email avec le montant et le lien de la facture. Ce message est déjà actif. Il n’y a pas encore de formulaire à modifier ici.",
            side: side("left"),
            node: { workflow: "facture", id: "j3" },
        },
        {
            element: '[data-tour="relance-facture-j1"]',
            title: "J-1 · Rappel",
            description:
                "La veille de la date limite, le client reçoit automatiquement un second rappel. Ce message est déjà actif. Il n’y a pas encore de formulaire à modifier ici.",
            side: side("left"),
            node: { workflow: "facture", id: "j1" },
        },
        {
            element: '[data-tour="relance-facture-digest"]',
            title: "J+1 · Digest",
            description:
                "Le lendemain de l’échéance, l’alerte vous arrive d’abord. Vous pourrez indiquer si c’est déjà payé, relancer le client, ou attendre. Le client ne reçoit rien tout seul après la date limite.",
            side: side("left"),
            node: { workflow: "facture", id: "digest" },
        },
        {
            element: '[data-tour="relance-facture-manual"]',
            title: "Relance retard",
            description:
                "Cet email au client, après la date limite, ne part que si vous le validez. Ce n’est pas un envoi automatique. Il n’y a pas de formulaire à remplir pour le moment.",
            side: side("top"),
            node: { workflow: "facture", id: "manual" },
        },
    ];
}

function mailFormSteps(
    level: 1 | 2 | 3,
    id: "mail1" | "mail2" | "mail3",
    label: string,
    extra: string
): ReminderTourStep[] {
    const node: SelectedNode = { workflow: "devis", id };
    const card: ReminderTourStep = {
        element: `[data-tour="relance-devis-${id}"]`,
        title: `${label}`,
        description: `${extra} Le formulaire de cette carte s’affiche à droite, ou en bas de l’écran sur mobile.`,
        side: side("left"),
        node,
    };

    if (level === 1) {
        return [
            card,
            {
                element: '[data-tour="relance-field-mail-enabled"]',
                title: "Activer ce palier",
                description:
                    "Si vous désactivez ce palier, cet email-là ne part pas. Les autres emails restent possibles : désactiver le premier n’empêche pas le second de s’envoyer à sa date.",
                side: side("left"),
                node,
            },
            {
                element: '[data-tour="relance-field-mail-days"]',
                title: "Jours après envoi",
                description:
                    "Indiquez combien de jours après l’envoi du devis cet email doit partir, entre 1 et 60. Pour le premier palier, la valeur proposée est 2 jours. Ce délai ne change que votre compte.",
                side: side("left"),
                node,
            },
            {
                element: '[data-tour="relance-field-mail-subject"]',
                title: "Sujet de l’email",
                description:
                    "C’est l’objet de l’email reçu par le client. Vous pouvez écrire {number} pour le numéro du devis, {company} pour votre société, et {expiry} pour la date de fin de validité.",
                side: side("left"),
                node,
            },
            {
                element: '[data-tour="relance-field-mail-save"]',
                title: "Enregistrer le palier",
                description:
                    "Sans un clic sur Enregistrer ici, ou sur Sauver en haut de l’écran, vos modifications ne sont pas gardées.",
                side: side("left"),
                node,
            },
        ];
    }

    return [
        card,
        {
            element: '[data-tour="relance-inspector"]',
            title: `Formulaire palier ${level}`,
            description:
                "Vous retrouvez les mêmes champs que pour le premier email : activer ou non, nombre de jours après l’envoi, objet du message, puis Enregistrer. Ce palier a son propre délai. Il n’attend pas que l’email précédent ait été envoyé.",
            side: side("left"),
            node,
        },
    ];
}

export const TOUR_STORAGE_KEY: Record<ReminderTourScope, string> = {
    list: "sharaco_relances_tour_list_v2",
    devis: "sharaco_relances_tour_devis_v2",
    facture: "sharaco_relances_tour_facture_v2",
};
