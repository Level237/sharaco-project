# 🗺️ Roadmap & État des Lieux — Sharaco

> **Projet** : Sharaco (SaaS de facturation et gestion commerciale Next.js 16 / TypeScript / Tailwind CSS 4)  
> **Dernière mise à jour** : Septembre 2026

---

## 📌 Synthèse Globale

Sharaco est une application moderne de gestion de devis, factures, projets, clients et paiements échelonnés destinée aux indépendants, agences et PME. Ce document récapitule les fonctionnalités déjà implémentées, les améliorations récentes et les chantiers restants à réaliser.

---

## ✅ 1. Ce qui a déjà été réalisé

### 🎨 1.1 Page d'Accueil & Vitrine (Landing Page)
- [x] **Hero Section** moderne avec effet d'animation ripple et typographie soignée.
- [x] **Section "Comment ça marche" (`HowItWorksSection`)** sous forme de carrousel horizontal interactif (défilement pas à pas, 4 cartes visibles simultanément sur grand écran, séparateurs visuels centrés).
- [x] **Section Vidéo (`VideoShowcaseSection`)** équilibrée 50/50 avec lecteur vidéo local (`/video/video.mp4`) à gauche et bénéfices clés à droite.
- [x] **Bannière CTA Cosmique (`CosmicCtaSection`)** en pleine hauteur avec background visuel dédié (`/img/bg.png`) et redirection vers l'inscription.
- [x] **Footer moderne** intégrant le logo officiel (`/img/logo.png`), la signature « *Powered by Martin Dev* », et les liens sociaux (WhatsApp, GitHub, LinkedIn, Facebook).
- [x] **Gestion des thèmes** : Dark / Light mode via `next-themes` avec dégradés bleu-violet et style glassmorphism.

---

### 📝 1.2 Moteur de Devis (Quote Builder & Devis)
- [x] **Création & Édition de devis en temps réel** :
  - Sélection de template visuel initial et association de projet.
  - Autosave automatique en arrière-plan (`useAutoSave`) et mise à jour explicite (`useDocumentUpdate`).
  - Prévisualisation live synchrone avec rendu PDF / HTML.
- [x] **Gestion de la TVA (`TabItems`)** :
  - **TVA désactivée par défaut** lors de la création d'un nouveau devis.
  - Taux de TVA fixé à 0% lorsque désactivé, empêchant l'envoi de taux résiduels (20%) à l'API.
  - Masquage automatique des champs de TVA par article (`LineItem`) et du pourcentage global lorsque la TVA est inactive.
  - Calcul dynamique instantané des totaux HT / TVA / TTC (`useQuoteTotal`).
- [x] **Formatage Monétaire (`formatCurrency`)** :
  - Prise en charge des montants en unités directes (correction du bug de division par 100).
  - Gestion des devises (EUR, XOF, USD) avec symboles adaptés.
- [x] **Échéanciers de Paiement (`PaymentScheduleEditor`)** :
  - Modèles d'échéanciers prédéfinis (Acompte 30/70, 50/50, etc.).
  - Date d'échéance obligatoire avec valeur par défaut calculée à **J+30**.
  - Affichage direct de l'échéancier si déjà configuré (sans réimposer l'écran de sélection).
- [x] **Profil Utilisateur / Émetteur (`TabDetails`)** :
  - Champs dédiés pour personnaliser l'émetteur (nom, email, téléphone, adresse) directement dans les détails du devis.
- [x] **Règles de suppression & sécurité** :
  - **Seuls les devis en statut `DRAFT` (Brouillon) peuvent être supprimés.**
  - Suppression bloquée et masquée pour les devis `ACCEPTED` (Accepté) et `REFUSED` (Refusé), tant sur la liste ([`QuoteList`](file:///home/level/dev/web/frontend/nextjs/sharaco/src/features/quotes/components/QuoteList.tsx)) que sur la page de détail ([`QuoteDetail`](file:///home/level/dev/web/frontend/nextjs/sharaco/src/app/(dashboard)/dashboard/quotes/[id]/page.tsx)).
  - Dissociation et association aux projets avec confirmation.

---

### 💳 1.3 Factures & Paiements
- [x] **Génération séquentielle de factures depuis un devis accepté** :
  - Bouton intelligent « *Générer la facture suivante* » sur le détail d'un devis accepté pour chaque échéance de paiement.
- [x] **Visualisation du statut des échéances** (Payé, En attente, etc.) via [`PaymentTimeline`](file:///home/level/dev/web/frontend/nextjs/sharaco/src/features/quotes/components/PaymentTimeline.tsx).
- [x] **Badges de retard et relances** : indicateurs visuels pour factures en retard et alertes imminentes.
- [x] **Envoi par email** : modal d'envoi de devis et factures par email aux clients (`SendEmailModal`).

---

### 🌐 1.4 Espace Client & Signature en Ligne (`/client/[token]`)
- [x] **Consultation sécurisée** du document par le client sans besoin de compte.
- [x] **Signature électronique** pour les devis (`DEVIS`) avec enregistrement du nom du signataire et horodatage.
- [x] **Motif de refus** optionnel en cas de refus d'un devis.
- [x] **Protection des factures (`FACTURE`)** :
  - Impossibilité de signer ou refuser une facture.
  - Remplacement des boutons de signature par un badge de statut de facture et une section d'incitation : **« Essayez Sharaco »**.

---

### 👥 1.5 Clients, Projets & Paramètres
- [x] **Gestion des clients** : création rapide à la volée pendant la confection du devis ou gestion dédiée.
- [x] **Gestion des projets** : arborescence projets avec devis/factures rattachés et statistiques financières.
- [x] **Paramètres utilisateur** : profil entreprise, coordonnées, mot de passe, sélection de la devise par défaut.

---

## 🚀 2. Ce qui reste à faire (Backlog & Prochaines Étapes)

### 🔴 Priorité Haute (Essentiel pour la production)

1. **Paiement en ligne direct pour les clients** :
   - [ ] Intégration d'une passerelle de paiement sur la page `/client/[token]` pour les factures (Stripe pour CB, Wave / Orange Money / Moov Money pour l'Afrique de l'Ouest / XOF).
   - [ ] Mise à jour automatique du statut de la facture à `PAID` dès validation du webhook de paiement.

2. **Éditeur de facture direct (Facture libre)** :
   - [ ] Pouvoir créer une facture de zéro sans devoir obligatoirement passer par la création préalable d'un devis.

3. **Module de Relances Automatiques (`/dashboard/reminders`)** :
   - [ ] Automatisation des emails de relance avant échéance (J-3), le jour même (J-J) et après retard (J+7, J+15).
   - [ ] Personnalisation des modèles d'emails de relance selon le niveau de retard.

---

### 🟡 Priorité Moyenne (Confort & Expérience Utilisateur)

4. **Export Comptable & Rapports Financiers** :
   - [ ] Export des écritures de ventes au format CSV / Excel / FEC (Fichier des Écritures Comptables).
   - [ ] Dashboard analytique avancé : prévisions de trésorerie basées sur les échéances futures des devis acceptés.

5. **Gestion Avancée des Acomptes & Avoirs** :
   - [ ] Génération automatique de factures d'acompte et factures de solde dédiées.
   - [ ] Émission d'avoirs (factures rectificatives) en cas d'annulation ou remboursement partiel.

6. **Personnalisation & Templates de Documents** :
   - [ ] Éditeur visuel de templates (logo personnalisé en drag & drop, choix des polices, disposition des blocs, mentions légales et coordonnées bancaires RIB/IBAN).
   - [ ] Prévisualisation multi-formats (A4, orientation, marges d'impression).

7. **Multi-devises & Taux de Change** :
   - [ ] Conversion et affichage dynamique des devises secondaires sur les factures émises pour des clients internationaux.

---

### 🟢 Priorité Basse / Évolutions Futures

8. **Application Mobile / PWA** :
   - [ ] Configuration PWA complète avec support hors-ligne pour la consultation des devis et clients.
   - [ ] Notifications push pour alerter le prestataire dès qu'un devis est consulté ou signé.

9. **Intégrations Tiers & API Publique** :
   - [ ] Système de clés d'API utilisateur pour connecter Sharaco à des outils no-code (Make, Zapier) ou des CRM externes.
   - [ ] Webhooks sortants sur événements clés (`quote.accepted`, `invoice.paid`, etc.).

10. **Tests Automatisés & Audit** :
    - [ ] Mise en place de tests end-to-end (Playwright) sur les parcours critiques : création de devis ➔ signature client ➔ génération facture.
    - [ ] Audit d'accessibilité (a11y) et performance Core Web Vitals sur mobile.

---

## 📊 Matrice d'Avancement Global

| Domaine | État d'avancement | Note de maturité |
| :--- | :---: | :---: |
| **Landing Page & Vitrine** | 95% | Prêt pour mise en avant |
| **Création & Édition de Devis** | 90% | Très robuste, TVA & échéances calées |
| **Consultation & Signature Client** | 95% | Sécurisé & fonctionnel |
| **Factures & Échéanciers** | 80% | Manque le paiement en ligne direct |
| **Gestion Clients & Projets** | 85% | Fonctionnel |
| **Relances Automatisées** | 40% | Interface présente, automatisation backend à parfaire |
| **Comptabilité & Exports** | 30% | À développer |
