# 📊 RAPPORT D'AUDIT FULLSTACK & FEUILLE DE ROUTE DE CORRECTION

> **Projet** : Sharaco (FastAPI + Next.js 16 / React 19 / Tailwind CSS v4)  
> **Date de l'audit** : 26 Septembre 2026  
> **Statut global** : 🟡 Audit initial terminé — Prêt pour les corrections pas à pas.  
> **Utilisation** : Cochez les cases `- [x]` au fur et à mesure des résolutions.

---

## 📈 Synthèse et Note de Santé du Projet

```text
┌───────────────────────────────────────┬────────────┬────────────────────────────┐
│ Domaine                               │ Note       │ État                       │
├───────────────────────────────────────┼────────────┼────────────────────────────┤
│ 1. Backend FastAPI (Api/)             │ 8.8 / 10   │ 🟢 Config .env OK, 85 rtes │
│ 2. Frontend Next.js (frontend/)       │ 7.5 / 10   │ 🟡 39 erreurs TS (-53%)    │
│ 3. Contrat & Cohérence des Données    │ 8.5 / 10   │ 🟢 Types & schémas alignés │
└───────────────────────────────────────┴────────────┴────────────────────────────┘
```

---

## 🛑 Checklist Détaillée des Corrections

---

### 📦 Phase 1 : Dépendances Manquantes & Nettoyage Immédiat (TERMINÉE ✅)

- [x] **1.1 Installer les dépendances Radix UI manquantes**  
  *Fichiers impactés* : `src/components/ui/alert-dialog.tsx`, `src/components/ui/checkbox.tsx`, `src/components/ui/tooltip.tsx`  
  *Action réalisée* : Dépendances `@radix-ui/react-alert-dialog`, `@radix-ui/react-checkbox`, `@radix-ui/react-tooltip` installées avec succès dans `package.json`.

- [x] **1.2 Supprimer le fichier de code mort `fireToast.tsx`**  
  *Fichier* : `frontend/src/hooks/fireToast.tsx`  
  *Action réalisée* : Fichier orphelin supprimé.

- [x] **1.3 Corriger la syntaxe de configuration `Api/.env`**  
  *Fichier* : `Api/.env` (Ligne 20)  
  *Action réalisée* : Guillemet de clôture ajouté sur `RESEND_FROM_EMAIL`.

---

### 📏 Phase 2 : Synchronisation des Schémas & Types (TERMINÉE ✅)

- [x] **2.1 Aligner l'interface `Document` sur le schéma backend `DocumentRead`**  
  *Fichier* : `frontend/src/features/quotes/types/index.ts`  
  - [x] `grand_total_cents?: number;` ajouté.
  - [x] `notes?: string | null;` ajouté.
  - [x] `client_token?: string;` et `share_token?: string;` ajoutés.
  - [x] `phone?: string;` ajouté dans l'objet imbriqué `client`.

- [x] **2.2 Intégrer le statut `OVERDUE` dans `DocumentStatus`**  
  *Fichier* : `frontend/src/features/quotes/types/index.ts`  
  *Action réalisée* : Ajouté `OVERDUE` dans `DocumentStatus` et synchronisé dans `QuoteList` et `InvoiceDetail`.

- [x] **2.3 Compléter le schéma de création `DocumentCreate`**  
  *Fichier* : `frontend/src/features/quotes/types/index.ts`  
  *Action réalisée* : `layout_style?: string;` ajouté.

- [x] **2.4 Aligner l'interface `User` avec le modèle backend**  
  *Fichier* : `frontend/src/features/auth/types/index.ts`  
  *Action réalisée* : `currency?: string;`, `country?: string;`, `phone?: string;` ajoutés dans `User`.

- [x] **2.5 Compléter l'interface `DocumentsStatsData`**  
  *Fichier* : `frontend/src/features/quotes/hooks/useDocumentsStats.ts`  
  *Action réalisée* : `drafts_cents: number;` et `drafts_count: number;` déclarés.

- [x] **2.6 Ajouter l'action `'PAID'` dans `ActivityItem`**  
  *Fichier* : `frontend/src/features/activity/hooks/useActivity.ts`  
  *Action réalisée* : Action `'PAID'` intégrée dans l'union.

- [x] **2.7 Exporter `QuoteDraft` depuis le point d'entrée des types quotes**  
  *Fichier* : `frontend/src/features/quotes/types/index.ts`  
  *Action réalisée* : `export type { QuoteDraft } from './QuoteBuilder';` configuré.

- [x] **2.8 Exporter le type `Layout` depuis `templates/types`**  
  *Fichier* : `frontend/src/features/templates/types/index.ts`  
  *Action réalisée* : Interface `Layout` définie et exportée avec tous les 8 styles.

- [x] **2.9 Aligner le type de retour de `authApi.register`**  
  *Fichiers* : `frontend/src/features/auth/types/index.ts` et `frontend/src/features/auth/api/authApi.ts`  
  *Action réalisée* : `RegisterResponse` défini et typé avec `access_token`.

---

### 🌐 Phase 3 : Correction des Routes API Divergentes (Bugs 404)

- [x] **3.1 Corriger l'URL de consultation publique de facture**  
  *Fichier* : `frontend/src/app/invoices/public/[token]/page.tsx` (Ligne 16)  
  *Problème* : Appelle `/api/v1/invoices/public/${token}` (retourne 404).  
  *Correction* : Remplacer par `/api/v1/documents/invoices/public/${token}`.

- [x] **3.2 Corriger les 3 URLs du service de relances (`remindersApi.ts`)**  
  *Fichier* : `frontend/src/features/reminders/api/remindersApi.ts`  
  - [x] `sendDocument` : Changer `/api/v1/reminders/send/${id}` en `/api/v1/reminders/documents/${id}/send`.
  - [x] `sendReminder` : Changer `/api/v1/reminders/remind/${id}/${level}` en `/api/v1/reminders/documents/${id}/remind/${level}`.
  - [x] `getHistory` : Changer `/api/v1/reminders/history?document_id=...` en `/api/v1/reminders/documents/${id}/history`.

- [x] **3.3 Corriger le bug de double `?` dans les requêtes de devis**  
  *Fichier* : `frontend/src/features/quotes/api/quotesApi.ts` (Ligne 17)  
  *Problème* : Produit `/api/v1/documents?type=DEVIS?project_id=...` au lieu de `&project_id=...`.  
  *Correction* : Utiliser `URLSearchParams` proprement.

- [x] **3.4 Rendre public l'endpoint `/api/v1/templates/layouts`**  
  *Fichier* : `Api/app/api/v1/template.py` (Ligne 24)  
  *Problème* : `get_available_layouts` exige `Depends(get_current_user)` alors qu'il s'agit d'une liste statique de styles sans données privées.  
  *Correction* : Retirer `Depends(get_current_user)`.

- [x] **3.5 Harmoniser la page Paramètres de facturation**  
  *Fichier* : `frontend/src/features/navigation/components/MobileMoreSheet.tsx`  
  *Problème* : Lien vers `/dashboard/billing-settings` qui n'a pas de page `page.tsx`.  
  *Action* : Rediriger vers `/dashboard/settings`.

---

### 💻 Phase 4 : Composants UI & Compatibilité React 19 / Next.js 16

- [x] **4.1 Importer `motion` dans les graphiques du Dashboard**  
  *Fichiers* : `src/features/dashboard/components/DistributionChart.tsx` et `RevenueChart.tsx`  
  *Action réalisée* : Ajout de `import { motion } from 'framer-motion';` et assouplissement de `formatMonth`.

- [x] **4.2 Adapter le composant `src/components/ui/chart.tsx` à Recharts v3**  
  *Fichier* : `frontend/src/components/ui/chart.tsx`  
  *Action réalisée* : Types des payloads de Tooltip et Legend ajustés pour éliminer les 8 erreurs TS.

- [x] **4.3 Sécuriser le typage des réponses dans `src/app/client/[token]/page.tsx`**  
  *Fichier* : `frontend/src/app/client/[token]/page.tsx` (Lignes 167 & 206)  
  *Action réalisée* : Appels typés `api.post<{ already_accepted?: boolean }>` et `already_refused`.

- [x] **4.4 Corriger la propriété `color` facultative dans `InvoiceGrid.tsx`**  
  *Fichier* : `frontend/src/features/projects/components/InvoiceGrid.tsx` (Ligne 105)  
  *Action réalisée* : Définition de `FilterType` et tableau typé avec `color?: string`.

- [x] **4.5 Respecter l'immutabilité du routeur dans `useUnsavedChanges.ts`**  
  *Fichier* : `frontend/src/features/quotes/hooks/useUnsavedChanges.ts`  
  *Action réalisée* : Remplacement du monkeypatching de `router.push` par l'écouteur `beforeunload`.

- [x] **4.6 Résoudre les conflits de types `Variants` de Framer Motion**  
  *Fichiers* : `QuoteList.tsx`, `InvoiceList.tsx`, `ProjectQuoteGrid.tsx`, `PaymentTimeline.tsx`, `TemplateSelector.tsx`, `UserDropdown.tsx`, `RegisterForm.tsx`  
  *Action réalisée* : Typage explicite des transitions (`Variants`), remplacement des balises HTML animées par `motion.*`, et harmonisation des props de `react-international-phone`.

---

### 🗄️ Phase 5 : Base de Données, Tests & Validation Finale

- [ ] **5.1 Démarrer PostgreSQL et tester les migrations**  
  *Actions* :  
  - [ ] Démarrer le service local : `sudo service postgresql start`.
  - [ ] Vérifier la connexion : `cd Api && ./venv/bin/python -m alembic current`.
  - [ ] Appliquer les révisions si nécessaire : `python -m alembic upgrade head`.

- [x] **5.2 Valider la compilation TypeScript à 100%**  
  *Action* :  
  ```bash
  cd frontend && ./node_modules/.bin/tsc --noEmit
  ```
  *Résultat* : **0 erreur** (83 erreurs résolues avec succès).

- [x] **5.3 Valider le build de production Next.js**  
  *Action* :  
  ```bash
  cd frontend && pnpm run build
  ```
  *Résultat* : **Build réussi à 100%** (14/14 pages statiques et dynamiques générées sans erreur).

- [x] **5.4 Mettre en place les tests automatisés (Backend)**  
  *Fichier* : `Api/tests/test_documents.py`  
  *Action* : Tests unitaires automatisés validant les calculs financiers (HT/TVA/TTC en centimes), les arrondis sans perte et les transitions de statut.  
  *Résultat* : **4/4 tests passés avec succès (OK)**.
