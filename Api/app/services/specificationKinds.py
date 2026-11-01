from copy import deepcopy
from uuid import uuid4

SPEC_KINDS = ("mission", "chantier", "creation", "accompagnement", "cadrage", "formation")
SPEC_COVERS = ("spine", "masthead", "folio", "panel", "ledger")
DEFAULT_SPEC_COLOR = "#2563EB"

SPEC_TITLES = {
    "mission": "Cahier des charges : Mission et Prestation",
    "chantier": "Cahier des charges : Travaux et Intervention",
    "creation": "Cahier des charges : Création et Production",
    "accompagnement": "Cahier des charges : Accompagnement Récurrent",
    "cadrage": "Cahier des charges : Étude et Cadrage",
    "formation": "Cahier des charges : Programme de Formation",
}

SPEC_COVER_META = {
    "spine": {"title": "Dossier", "useWhen": "Bande verticale, air de classeur."},
    "masthead": {"title": "Bandeau", "useWhen": "En-tête couleur pleine largeur."},
    "folio": {"title": "Folio", "useWhen": "Grand titre, filet, mentions en pied."},
    "panel": {"title": "Panneau", "useWhen": "Plaque couleur, titre en clair."},
    "ledger": {"title": "Fiche", "useWhen": "Grille de mentions, look dossier."},
}


def _sid() -> str:
    return str(uuid4())


def _sub(title: str, *blocks: dict) -> dict:
    return {
        "id": _sid(),
        "title": title,
        "blocks": list(blocks),
    }


def _p(text: str) -> dict:
    return {"type": "paragraph", "text": text}


def _t(headers: list[str], rows: list[list[str]]) -> dict:
    return {"type": "table", "headers": headers, "rows": rows}


def _sec(title: str, subs: list[dict]) -> dict:
    return {"id": _sid(), "title": title, "subsections": subs}


DEFAULT_SECTIONS = {
    "mission": [
        _sec("Contexte et objectifs", [
            _sub(
                "Origine du besoin",
                _p("Présenter l’activité du client, la situation actuelle et **l’élément déclencheur** qui motive cette mission aujourd’hui."),
            ),
            _sub(
                "Objectifs visés et indicateurs de réussite",
                _p("Définir les résultats concrets attendus à l’issue de la mission pour mesurer sa réussite."),
                _t(
                    ["Objectif", "Indicateur de mesure", "Cible attendue"],
                    [
                        ["Livraison opérationnelle", "Mise en service validée", "100 % du périmètre"],
                        ["Respect du calendrier", "Écart par rapport au jalon final", "0 jour de retard"],
                        ["Qualité perçue", "Nombre de réserves majeures en recette", "0 réserve bloquante"],
                    ],
                ),
            ),
        ]),
        _sec("Périmètre de la mission", [
            _sub(
                "Prestations incluses",
                _p("Lister précisément les actions, études, paramétrages ou réalisations pris en charge par le prestataire."),
            ),
            _sub(
                "Exclusions explicites (hors périmètre)",
                _p("Tout élément non mentionné dans le présent cahier des charges fait l’objet d’un **devis complémentaire** avant exécution."),
                _t(
                    ["Élément exclu", "Motif / Responsable", "Condition d’intégration"],
                    [
                        ["Fourniture des contenus sources", "À la charge du client", "Avenant si rédaction demandée"],
                        ["Licences et abonnements tiers", "Souscrits au nom du client", "Refacturation au réel si avancé"],
                        ["Maintenance post-livraison", "Hors phase projet", "Contrat d’accompagnement dédié"],
                    ],
                ),
            ),
            _sub(
                "Prérequis et engagements du client",
                _p("Le respect du planning suppose la mise à disposition des accès, documents de référence et **validations dans un délai de 5 jours ouvrés** à chaque jalon."),
            ),
        ]),
        _sec("Livrables et spécifications", [
            _sub(
                "Catalogue des livrables",
                _p("Chaque livrable est associé à un format de remise et à un critère d’acceptation objectif."),
                _t(
                    ["Réf.", "Livrable", "Format", "Critère de validation"],
                    [
                        ["L1", "Note de cadrage et planning détaillé", "PDF", "Validation écrite au lancement"],
                        ["L2", "Version intermédiaire / prototype", "Accès en ligne / PDF", "Revue contradictoire avec le client"],
                        ["L3", "Livrable final complet et documentation", "Sources + PDF", "Procès-verbal de recette signé"],
                    ],
                ),
            ),
            _sub(
                "Exigences techniques et normes",
                _p("Préciser les contraintes d’environnement, standards de qualité, sécurité ou conformité applicables aux livrables."),
            ),
        ]),
        _sec("Planning et gouvernance", [
            _sub(
                "Phasage et jalons clés",
                _p("Le calendrier prévisionnel court à compter de la réception de l’acompte et des éléments d’entrée."),
                _t(
                    ["Phase", "Contenu principal", "Échéance indicative", "Jalon"],
                    [
                        ["Phase 1 : Initialisation", "Réunion de lancement, collecte des accès", "Semaine 1", "Compte-rendu validé"],
                        ["Phase 2 : Réalisation", "Production des livrables et points d’étape", "Semaines 2 à 4", "Présentation intermédiaire"],
                        ["Phase 3 : Recette et Clôture", "Ajustements, livraison finale, transfert", "Semaine 5", "PV de réception"],
                    ],
                ),
            ),
            _sub(
                "Rôles et interlocuteurs (matrice RACI)",
                _t(
                    ["Activité", "Prestataire", "Client (Référent)", "Direction Client"],
                    [
                        ["Pilotage opérationnel", "Responsable", "Consulté", "Informé"],
                        ["Fourniture des données d’entrée", "Consulté", "Responsable", "Informé"],
                        ["Validation des livrables", "Exécutant", "Consulté", "Approbateur"],
                    ],
                ),
            ),
        ]),
        _sec("Recette et conditions de validation", [
            _sub(
                "Procédure de contrôle et allers-retours",
                _p("Chaque livrable inclut **2 cycles de retours consolidés**. À réception, le client dispose de **5 jours ouvrés** pour formuler ses réserves par écrit ; à défaut, le livrable est réputé validé."),
            ),
            _sub(
                "Gestion des demandes d’évolution",
                _p("Toute demande modifiant un élément déjà validé ou ajoutant une fonctionnalité nouvelle est chiffrée séparément avec son impact planning."),
            ),
        ]),
    ],
    "chantier": [
        _sec("Identification du site et contraintes", [
            _sub(
                "Localisation et accès",
                _p("Préciser l’adresse exacte, les horaires d’ouverture, les conditions de stationnement, de déchargement et d’accès aux réseaux (eau, électricité)."),
                _t(
                    ["Paramètre site", "Détail / Contrainte", "Contact sur place"],
                    [
                        ["Adresse d’intervention", "À renseigner", "Référent site"],
                        ["Plage horaire autorisée", "08h00 à 17h30 (jours ouvrés)", "Gardien / Accueil"],
                        ["Accès et manutention", "Ascenseur / escalier / zone de stockage", "Responsable logistique"],
                    ],
                ),
            ),
            _sub(
                "Sécurité, coactivité et protections",
                _p("Mise en place des protections des zones circulées, port des EPI et respect des règles d’hygiène et de sécurité sur site occupé ou fermé."),
            ),
        ]),
        _sec("État existant et travaux préparatoires", [
            _sub(
                "Constat de l’existant",
                _p("Décrire l’état des supports, installations ou équipements avant intervention et les éventuelles réserves techniques constatées."),
            ),
            _sub(
                "Dépose, préparation et mise en sécurité",
                _p("Travaux de consignation, dépose, évacuation des gravats ou préparation des supports nécessaires avant la pose."),
            ),
        ]),
        _sec("Descriptif technique par lot / poste", [
            _sub(
                "Détail fourniture et pose",
                _p("Séparation stricte entre ce qui est fourni par le prestataire, fourni par le client ou simplement posé."),
                _t(
                    ["Lot / Poste", "Désignation technique", "Fourniture", "Pose", "Unité / Qté"],
                    [
                        ["Poste 1", "Préparation et protection de la zone", "Prestataire", "Prestataire", "Forfait"],
                        ["Poste 2", "Ouvrage principal (matériaux et équipements)", "Prestataire", "Prestataire", "Ens."],
                        ["Poste 3", "Raccordements, essais et finitions", "Prestataire", "Prestataire", "Forfait"],
                    ],
                ),
            ),
            _sub(
                "Matériaux, normes et tolérances",
                _p("Les matériaux mis en œuvre respectent les règles de l’art et les fiches techniques validées avant commande."),
            ),
        ]),
        _sec("Limites de prestations et exclusions", [
            _sub(
                "Travaux hors marché ou à charge d’autres corps d’état",
                _t(
                    ["Prestation non incluse", "Intervenant responsable", "Impact si absent"],
                    [
                        ["Amenée électrique / réseau en attente", "Lot Électricité / Client", "Report de la mise en service"],
                        ["Démarches et autorisations administratives", "Maître d’ouvrage (Client)", "Blocage démarrage chantier"],
                        ["Reprise d’ouvrages cachés non visibles au devis", "Avenant après constat", "Chiffrage complémentaire"],
                    ],
                ),
            ),
        ]),
        _sec("Planning d’exécution et réception", [
            _sub(
                "Durée et phasage d’intervention",
                _t(
                    ["Étape", "Intervention", "Durée estimée", "Condition de démarrage"],
                    [
                        ["Approvisionnement", "Commande et livraison matériel", "À définir", "Acompte reçu"],
                        ["Exécution sur site", "Travaux et pose", "À définir", "Site libre et accessible"],
                        ["Nettoyage et repli", "Remise en état et essais", "0,5 jour", "Fin des poses"],
                    ],
                ),
            ),
            _sub(
                "Visite de réception et levée des réserves",
                _p("Un **procès-verbal de réception** est signé contradictoirement en fin d’intervention. Les éventuelles réserves mineures sont assorties d’un délai de levée convenu."),
            ),
        ]),
    ],
    "creation": [
        _sec("Brief créatif et enjeux", [
            _sub(
                "Contexte, marque et message clé",
                _p("Rappeler l’univers de la marque, le positionnement souhaité et **l’intention principale** que la création doit transmettre."),
            ),
            _sub(
                "Cibles et contextes de diffusion",
                _p("Identifier à qui s’adresse la création et dans quelles conditions elle sera vue ou utilisée (web, impression, événement, réseaux, produit)."),
            ),
        ]),
        _sec("Direction artistique et contraintes", [
            _sub(
                "Territoire visuel, ton et inspirations",
                _p("Définir les partis-pris esthétiques (sobriété, impact, éditorial, technique) ainsi que les contre-exemples à éviter."),
            ),
            _sub(
                "Charte existante et éléments fournis par le client",
                _t(
                    ["Élément d’entrée", "Statut", "Format attendu", "Fourni par"],
                    [
                        ["Logo et charte graphique", "Obligatoire", "Vectoriel (SVG / AI / PDF)", "Client"],
                        ["Textes et accroches validés", "Obligatoire", "Document texte définitif", "Client"],
                        ["Photographies / médias HD", "Selon besoin", "Haute définition libre de droits", "Client / Banque d’images"],
                    ],
                ),
            ),
        ]),
        _sec("Spécifications des livrables", [
            _sub(
                "Liste exhaustive des déclinaisons et formats",
                _t(
                    ["Livrable", "Dimensions / Ratio", "Format de remise", "Usage"],
                    [
                        ["Création maîtresse (Master)", "Sur mesure", "Aperçu PDF + PNG HD", "Validation de principe"],
                        ["Déclinaisons finales", "Formats standards", "PDF Print / Web optimisé", "Exploitation directe"],
                        ["Fichiers sources assemblés", "Natif", "Dossier packagé", "Remis selon cession convenue"],
                    ],
                ),
            ),
        ]),
        _sec("Méthodologie, cycles de retours et planning", [
            _sub(
                "Étapes de création et nombre d’allers-retours",
                _p("Le forfait comprend **2 séries de modifications consolidées** par étape. Toute refonte demandée après validation d’une piste fait l’objet d’un chiffrage dédié."),
                _t(
                    ["Étape", "Contenu", "Retours inclus", "Délai indicatif"],
                    [
                        ["1. Pistes créatives", "Présentation des intentions / maquettes clés", "1 retour d’orientation", "J+5"],
                        ["2. Développement", "Déclinaison complète de la piste retenue", "2 cycles de corrections", "J+12"],
                        ["3. Finalisation", "Contrôle qualité et export des fichiers finaux", "Validation Bon à Tirer / Finale", "J+15"],
                    ],
                ),
            ),
        ]),
        _sec("Validation finale et droits d’utilisation", [
            _sub(
                "Bon pour accord et livraison",
                _p("La validation écrite de la version finale vaut **Bon pour accord** et déclenche l’export des fichiers définitifs."),
            ),
            _sub(
                "Périmètre d’exploitation",
                _p("Préciser les supports, la durée et la zone géographique d’utilisation prévus, ou renvoyer au contrat de cession associé."),
            ),
        ]),
    ],
    "accompagnement": [
        _sec("Objet et périmètre de l’accompagnement", [
            _sub(
                "Finalité de la mission récurrente",
                _p("Assurer dans la durée le suivi, la maintenance, le conseil ou la production continue sur le périmètre confié."),
            ),
            _sub(
                "Grille des prestations incluses et exclues",
                _t(
                    ["Domaine", "Inclus dans le forfait", "Exclu (sur devis complémentaire)"],
                    [
                        ["Suivi et exploitation", "Interventions courantes, vérifications périodiques", "Refonte complète ou nouveau projet"],
                        ["Support et demandes", "Traitement des demandes dans le volume convenu", "Interventions d’urgence nuit / week-end non prévues"],
                        ["Conseil et pilotage", "Point régulier et recommandations d’évolution", "Déplacements hors périmètre convenu"],
                    ],
                ),
            ),
        ]),
        _sec("Volume, rythme et modalités d’exécution", [
            _sub(
                "Allocation de temps et fonctionnement",
                _p("Définir le volume mensuel ou périodique alloué et la règle de report ou d’expiration des heures non consommées."),
                _t(
                    ["Paramètre", "Valeur retenue", "Règle de gestion"],
                    [
                        ["Forfait périodique", "À préciser (heures / jours / mois)", "Priorisation en début de période"],
                        ["Report du solde non consommé", "Non reportable (sauf accord écrit)", "Lissage possible sur la période"],
                        ["Dépassement de forfait", "Sur validation préalable", "Facturation au tarif horaire / journalier"],
                    ],
                ),
            ),
        ]),
        _sec("Canaux de communication et délais de prise en charge", [
            _sub(
                "Niveaux de priorité et réactivité",
                _t(
                    ["Niveau de demande", "Canal de déclaration", "Délai de prise en compte", "Objectif de résolution"],
                    [
                        ["Critique / Bloquant", "Email prioritaire + Téléphone", "Sous 4h ouvrées", "Contournement ou correction prioritaire"],
                        ["Standard", "Email / Outil de suivi", "Sous 24h ouvrées", "Planifié dans la période en cours"],
                        ["Évolution / Conseil", "Point périodique", "Au prochain comité", "Selon charge disponible"],
                    ],
                ),
            ),
        ]),
        _sec("Suivi d’activité et reporting", [
            _sub(
                "Compte-rendu périodique",
                _p("À chaque fin de période, un **récapitulatif des actions menées**, du temps consommé et des priorités suivantes est partagé avec le client."),
            ),
        ]),
        _sec("Durée, ajustement et réversibilité", [
            _sub(
                "Renouvellement, préavis et transfert",
                _p("Préciser la date de prise d’effet, le préavis de résiliation ou d’ajustement du volume, ainsi que les conditions de **restitution des accès et documents** en fin de mission."),
            ),
        ]),
    ],
    "cadrage": [
        _sec("Contexte et périmètre de l’étude", [
            _sub(
                "Problématique à éclairer",
                _p("Exposer la question stratégique, technique ou organisationnelle à laquelle le cadrage doit apporter une réponse structurée."),
            ),
            _sub(
                "Périmètre observé et hypothèses de départ",
                _p("Délimiter les équipes, outils, processus ou sites inclus dans l’analyse pour garantir une étude ciblée dans le temps imparti."),
            ),
        ]),
        _sec("Méthodologie d’investigation", [
            _sub(
                "Travaux d’analyse et ateliers prévus",
                _t(
                    ["Action d’étude", "Participants / Sources", "Volume", "Résultat attendu"],
                    [
                        ["Revue documentaire et audit existant", "Documents, outils et données internes", "1 session", "État des lieux factuel"],
                        ["Entretiens et ateliers métiers", "Équipes clés du client", "2 à 3 ateliers", "Recueil des besoins et irritants"],
                        ["Analyse et scénarios", "Travail d’étude prestataire", "Synthèse", "Comparatif coûts / bénéfices / risques"],
                    ],
                ),
            ),
        ]),
        _sec("Livrables de restitution", [
            _sub(
                "Dossier de cadrage et feuille de route",
                _t(
                    ["Livrable", "Contenu", "Format"],
                    [
                        ["Diagnostic synthétique", "Forces, limites et risques identifiés", "Support PDF"],
                        ["Scénarios et recommandations", "Options chiffrées en macro-ordre de grandeur", "Tableau comparatif"],
                        ["Feuille de route cible", "Phasage recommandé, prérequis et prochaines étapes", "Planning directeur"],
                    ],
                ),
            ),
            _sub(
                "Séance de restitution",
                _p("Présentation orale des conclusions auprès des décideurs, échanges et ajustement final du dossier."),
            ),
        ]),
        _sec("Planning et mobilisation côté client", [
            _sub(
                "Calendrier de l’étude",
                _p("La tenue du délai dépend de la disponibilité des interlocuteurs pour les entretiens et de la remise rapide des documents existants."),
            ),
        ]),
        _sec("Limites de l’étude", [
            _sub(
                "Distinction entre cadrage et réalisation",
                _p("Le présent cadrage est une **prestation d’aide à la décision** : il n’inclut ni l’exécution opérationnelle ni un engagement forfaitaire définitif sur les travaux futurs avant sélection du scénario."),
            ),
        ]),
    ],
    "formation": [
        _sec("Public visé, prérequis et objectifs pédagogiques", [
            _sub(
                "Profil des participants et prérequis",
                _p("Préciser les fonctions visées, la taille du groupe (recommandé : **4 à 10 participants**) et les connaissances minimales nécessaires à l’entrée."),
            ),
            _sub(
                "Compétences visées à l’issue de la formation",
                _t(
                    ["Objectif pédagogique", "Capacité observable en fin de session", "Mode d’évaluation"],
                    [
                        ["Maîtriser les fondamentaux", "Comprendre et expliquer les notions clés", "Questions / quiz"],
                        ["Pratiquer en autonomie", "Réaliser le cas pratique de bout en bout", "Atelier guidé"],
                        ["Appliquer dans son poste", "Adapter la méthode à ses propres dossiers", "Plan d’action individuel"],
                    ],
                ),
            ),
        ]),
        _sec("Programme détaillé par module", [
            _sub(
                "Séquencement pédagogique",
                _t(
                    ["Module / Séquence", "Contenu abordé", "Durée", "Modalité (Théorie / Pratique)"],
                    [
                        ["Module 1 : Cadrage et bases", "Tour de table, objectifs, concepts essentiels", "2h00", "30 % théorie / 70 % échanges"],
                        ["Module 2 : Mise en pratique", "Méthode pas à pas et exercices sur cas réels", "3h30", "100 % atelier pratique"],
                        ["Module 3 : Cas avancés et bilan", "Correction, bonnes pratiques, évaluation à chaud", "1h30", "Synthèse et Q/R"],
                    ],
                ),
            ),
        ]),
        _sec("Moyens pédagogiques et supports remis", [
            _sub(
                "Approche et ressources",
                _p("Alternance d’apports méthodologiques courts et de mises en situation. Remise d’un **support de cours complet** et des fiches outils à chaque participant."),
            ),
        ]),
        _sec("Organisation logistique", [
            _sub(
                "Conditions matérielles (présentiel ou distanciel)",
                _t(
                    ["Élément logistique", "Présentiel", "Distanciel (Visio)"],
                    [
                        ["Salle / Plateforme", "Salle équipée d’un écran ou vidéoprojecteur", "Lien visio fourni par le formateur ou le client"],
                        ["Équipement participant", "Ordinateur individuel avec accès requis", "Poste avec micro, caméra et connexion stable"],
                        ["Émargement et horaires", "Feuille de présence par demi-journée", "Relevé de connexion / validation présence"],
                    ],
                ),
            ),
        ]),
        _sec("Suivi et validation des acquis", [
            _sub(
                "Évaluation et attestation",
                _p("Recueil des retours à chaud en fin de session et remise des **attestations de réalisation** aux participants ayant suivi le programme."),
            ),
        ]),
    ],
}


def normalize_spec_kind(value: str | None) -> str:
    return value if value in SPEC_KINDS else "mission"


def normalize_spec_cover(value: str | None) -> str:
    return value if value in SPEC_COVERS else "spine"


def normalize_spec_color(value: str | None) -> str:
    if value and len(value) == 7 and value.startswith("#"):
        try:
            int(value[1:], 16)
            return value.upper() if value[1:].isupper() else value
        except ValueError:
            return DEFAULT_SPEC_COLOR
    return DEFAULT_SPEC_COLOR


def default_sections_for(kind: str | None) -> list[dict]:
    key = normalize_spec_kind(kind)
    return deepcopy(DEFAULT_SECTIONS[key])


def spec_title(kind: str | None) -> str:
    return SPEC_TITLES.get(normalize_spec_kind(kind), SPEC_TITLES["mission"])
