# app/services/contractKinds.py

CONTRACT_LAYOUT_MAP = {
    "classic": "contrat.html",
    "prestation": "contrat.html",
    "cession": "contrat_cession.html",
    "recurrent": "contrat_recurrent.html",
    "nda": "contrat_nda.html",
}

CONTRACT_TITLES = {
    "classic": "Contrat de prestation",
    "prestation": "Contrat de prestation",
    "cession": "Cession de droits",
    "recurrent": "Contrat d'accompagnement",
    "nda": "Accord de confidentialité",
}

CONTRACT_LAYOUTS = tuple(CONTRACT_LAYOUT_MAP.keys())

DEFAULT_RULES = {
    "prestation": [
        {
            "title": "Objet",
            "body": "Le prestataire réalise la mission définie avec le client, dans le cadre du projet auquel ce contrat est rattaché.",
        },
        {
            "title": "Obligations",
            "body": "Chaque partie communique les informations nécessaires à la bonne exécution. Le client valide les livrables dans un délai raisonnable.",
        },
        {
            "title": "Paiement",
            "body": "Les sommes dues suivent les conditions convenues entre les parties. Un retard peut suspendre la poursuite des travaux.",
        },
        {
            "title": "Fin du contrat",
            "body": "Une partie peut mettre fin au contrat par écrit, sous réserve des prestations déjà réalisées et des sommes déjà dues.",
        },
    ],
    "cession": [
        {
            "title": "Livrables concernés",
            "body": "Le cédant transmet les droits sur les livrables décrits dans ce contrat, pour l'usage convenu avec le cessionnaire.",
        },
        {
            "title": "Étendue",
            "body": "La cession porte sur le territoire, la durée et les supports indiqués dans les conditions particulières. À défaut, elle reste limitée à l'usage du projet.",
        },
        {
            "title": "Mentions",
            "body": "Si une mention d'auteur est prévue, le cessionnaire la conserve sur les supports concernés.",
        },
        {
            "title": "Hors cadre",
            "body": "Toute utilisation hors du cadre convenu nécessite un avenant écrit.",
        },
    ],
    "recurrent": [
        {
            "title": "Rythme",
            "body": "Les prestations sont fournies de façon récurrente, selon le rythme convenu entre les parties.",
        },
        {
            "title": "Résiliation",
            "body": "Chaque partie peut résilier par écrit, avec un préavis raisonnable, sauf faute grave.",
        },
        {
            "title": "Révision",
            "body": "Le forfait peut être ajusté d'un commun accord, notamment si le volume de travail change.",
        },
        {
            "title": "Impayé",
            "body": "Le prestataire peut suspendre l'accompagnement en cas de retard de paiement.",
        },
    ],
    "nda": [
        {
            "title": "Secret",
            "body": "Les informations échangées restent confidentielles et ne sont pas divulguées à des tiers sans accord écrit.",
        },
        {
            "title": "Usage",
            "body": "Elles ne servent qu'à évaluer ou exécuter le projet. Toute autre utilisation est exclue.",
        },
        {
            "title": "Durée",
            "body": "L'obligation dure vingt-quatre mois après la fin des échanges, sauf accord contraire dans les conditions particulières.",
        },
        {
            "title": "Restitution",
            "body": "Sur demande, les documents confidentiels sont restitués ou détruits, hors copies légalement conservées.",
        },
    ],
}

DEFAULT_RULES["classic"] = DEFAULT_RULES["prestation"]


def normalize_contract_layout(layout_style: str | None) -> str:
    if layout_style in CONTRACT_LAYOUT_MAP:
        return "prestation" if layout_style == "classic" else layout_style
    return "prestation"


def default_rules_for(layout_style: str | None) -> list[dict]:
    kind = normalize_contract_layout(layout_style)
    return [dict(rule) for rule in DEFAULT_RULES[kind]]


def contract_title(layout_style: str | None) -> str:
    kind = layout_style if layout_style in CONTRACT_TITLES else "prestation"
    return CONTRACT_TITLES[kind]
