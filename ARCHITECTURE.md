# 🏗️ ARCHITECTURE — Flux et Organisation du Système

> Ce document décrit les flux techniques de Sharaco, la séparation stricte des responsabilités entre `Api/` (FastAPI) et `frontend/` (Next.js), ainsi que les mécanismes clés (moteur de rendu, sécurité, échéanciers).

---

## 1. Vue d'Ensemble du Système

```text
                                  ┌────────────────────────────────────────────────────────┐
                                  │                   sharaco-fullstack                    │
                                  │                                                        │
         Utilisateur Pro ───────▶ │ frontend/ (Next.js 16 - App Router)                   │
         Client Final    ───────▶ │                                                        │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                                              │ HTTP REST (fetch)
                                                              │ - Privé : Authorization: Bearer <JWT>
                                                              │ - Public : /client/{token}, /shared/{token}
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │ Api/ (FastAPI)                                         │
                                  │                                                        │
                                  │ ├─▶ PostgreSQL (SQLModel asyncpg : données & users)    │
                                  │ ├─▶ Playwright (Chromium headless : rendu PDF / PNG)   │
                                  │ ├─▶ Resend (Envoi d'emails transactionnels)            │
                                  │ └─▶ APScheduler (Tâches planifiées : overdue, rappels) │
                                  └────────────────────────────────────────────────────────┘
```

---

## 2. Flux Métier Détaillés

### Flux 1 : Création d'un devis et prévisualisation instantanée

```text
[Frontend (Éditeur)]                  [Api/ (FastAPI)]                     [DB / Cache]
        │                                    │                                  │
        │ 1. POST /api/v1/documents          │                                  │
        │    {items, layout_style,           │                                  │
        │     payment_schedule, client_id...}│                                  │
        │ ─────────────────────────────────▶ │ 2. Valide données Pydantic       │
        │                                    │    Calcul totaux & TVA           │
        │                                    │    create_document()             │
        │                                    │ ───────────────────────────────▶ │
        │                                    │ ◀─────────────────────────────── │
        │ 3. 201 Created (DocumentRead JSON) │                                  │
        │ ◀───────────────────────────────── │                                  │
        │                                    │                                  │
        │ 4. GET /api/v1/documents/{id}/     │                                  │
        │    preview.png?_t=timestamp       │                                  │
        │ ─────────────────────────────────▶ │ 5. Calcule sha256(contenu)       │
        │                                    │    - Cache hit ➔ renvoie bytes   │
        │                                    │    - Cache miss ➔ Playwright     │
        │                                    │      injecte Jinja template      │
        │                                    │      capture screenshot PNG      │
        │                                    │      sauvegarde cache            │
        │ 6. Image PNG (image/png)           │                                  │
        │ ◀───────────────────────────────── │                                  │
```

---

### Flux 2 : Envoi, consultation publique et acceptation client

```text
[Pro (Frontend)]        [Api/ (FastAPI)]          [Resend]         [Client Final (Navigateur)]
       │                       │                     │                          │
       │ POST /{id}/send-email │                     │                          │
       │ ────────────────────▶ │ 1. Crée token       │                          │
       │                       │    public unique    │                          │
       │                       │ 2. Envoie email     │                          │
       │                       │ ──────────────────▶ │ 3. Réception email       │
       │                       │                     │    avec lien magique     │
       │                       │                     │ ───────────────────────▶ │
       │                       │                     │                          │
       │                       │ 4. GET /api/v1/documents/client/{token}        │
       │                       │ ◀───────────────────────────────────────────── │
       │                       │    (Accès direct SANS authentification JWT)    │
       │                       │ 5. Renvoie DocumentRead (lecture seule)        │
       │                       │ ─────────────────────────────────────────────▶ │
       │                       │                                                │
       │                       │ 6. POST /api/v1/documents/client/{token}/accept│
       │                       │ ◀───────────────────────────────────────────── │
       │                       │    Signature / Acceptation                     │
       │                       │ 7. Met à jour statut ➔ ACCEPTED               │
       │                       │    Génère facture auto (ou tranche 1)          │
       │                       │ 8. Notifie le Pro par email                    │
       │ ◀──────────────────── │ ◀───────────────────│                          │
```

---

### Flux 3 : Échéancier de paiement multi-tranches (Milestones)

Pour les projets importants, un devis peut être découpé en plusieurs tranches (ex. 30% acompte, 40% jalon intermédiaire, 30% solde) :

```text
Devis accepté avec échéancier (3 tranches : 30% / 40% / 30%)
  │
  ├─▶ 1. Tranche 1 (30%) : Facture générée automatiquement
  │      - Statut milestone 1 : INVOICED
  │      - Facture liée : invoice_id_1
  │
  ├─▶ 2. Paiement reçu : Le pro clique "Marquer payée"
  │      - POST /api/v1/documents/invoices/{invoice_id_1}/mark-paid
  │      - Statut milestone 1 ➔ PAID
  │
  ├─▶ 3. Facturation de la suite : Le pro clique "Facturer la tranche suivante"
  │      - POST /api/v1/documents/{devis_id}/next-invoice
  │      - Tranche 2 (40%) : Génération de la facture `invoice_id_2`
  │      - Statut milestone 2 ➔ INVOICED
  │
  └─▶ 4. Répétition jusqu'au solde final (Tranche 3 ➔ PAID).
```

---

### Flux 4 : Détection automatique des retards (Overdue) et Relances

1. **Job Cron Quotidien (APScheduler)** : S'exécute chaque nuit à l'heure configurée.
2. **Détection** : Recherche les factures dont le statut est `SENT` ou `VIEWED` et dont la date d'échéance (`due_date`) est dépassée (`due_date < now()`).
3. **Mise à jour** : Passage automatique du statut à `OVERDUE`.
4. **Relances** : Enregistrement dans les tables de relance (`reminder`) et envoi des notifications automatiques par email selon les règles définies par l'utilisateur.

---

## 3. Séparation Stricte des Responsabilités

Pour maintenir la cohérence, la scalabilité et la robustesse de l'application, les rôles sont strictement délimités :

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                             Api/ (Backend)                                 │
├────────────────────────────────────────────────────────────────────────────┤
│  FAIT :                                                                    │
│  ✅ Source de vérité unique pour les règles métier et calculs             │
│  ✅ Calcul des montants, sous-totaux, TVA, remises, et totaux généraux     │
│  ✅ Numérotation séquentielle et chronologique des factures / devis        │
│  ✅ Gestion de la machine d'état et transitions de statut                  │
│  ✅ Isolation stricte des données par tenant (filtrage automatique user_id)│
│  ✅ Rendu des previews PNG & documents PDF via Playwright et Jinja2        │
│  ✅ Mise en cache haute performance des previews                           │
│  ✅ Gestion des jobs d'arrière-plan (overdue, reminders)                   │
│                                                                            │
│  NE FAIT PAS :                                                             │
│  ❌ Rendu d'interface utilisateur ou composants React                      │
│  ❌ Gestion de l'état de navigation ou de la mise en page côté client      │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                           frontend/ (Frontend)                             │
├────────────────────────────────────────────────────────────────────────────┤
│  FAIT :                                                                    │
│  ✅ Expérience utilisateur réactive, fluide et accessible                  │
│  ✅ Gestion de l'état local de l'interface (Zustand, React state)          │
│  ✅ Cache et invalidation des données serveur (TanStack React Query)       │
│  ✅ Mapping rigoureux camelCase (UI) ↔ snake_case (Payload API)            │
│  ✅ Gestion du cycle de vie du token JWT (stockage, redirection 401)       │
│  ✅ Formatage cosmétique d'affichage (devises, dates)                      │
│                                                                            │
│  NE FAIT PAS :                                                             │
│  ❌ Calcul de totaux ou de TVA (repose sur les montants retournés par l'API)│
│  ❌ Décision unilatérale de transition de statut d'un document             │
│  ❌ Stockage de logique métier critique ou modification directe en base    │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Sécurité & Modèle d'Accès

### Routes Privées (Authentifiées)
- **Identification** : En-tête HTTP `Authorization: Bearer <JWT_TOKEN>`.
- **Injection** : Dépendance FastAPI `Depends(get_current_user)`.
- **Cloisonnement** : Toutes les requêtes en base filtrent obligatoirement par `user_id == current_user.id`. Aucun utilisateur ne peut accéder ou modifier les données d'un autre utilisateur.

### Routes Publiques (Accès Client sans Compte)
- **Identification** : Jeton cryptographique opaque unique passé dans le chemin de l'URL (`token`).
- **Endpoints** :
  - `GET /api/v1/documents/client/{token}`
  - `GET /api/v1/documents/client/{token}/preview`
  - `POST /api/v1/documents/client/{token}/accept`
  - `POST /api/v1/documents/client/{token}/refuse`
  - `GET /api/v1/documents/shared/{token}`
  - `GET /api/v1/documents/shared/{token}/preview`
  - `POST /api/v1/documents/shared/{token}/refuse`
  - `GET /api/v1/documents/invoices/public/{token}`
- **Règle absolue** : Ces endpoints ne doivent **jamais** être protégés par `Depends(get_current_user)` sous peine de bloquer les clients finaux.

---

## 5. Configuration et Variables d'Environnement

### Backend : `Api/.env`
```env
# Base de données PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/sharaco

# Sécurité JWT
SECRET_KEY=votre_cle_secrete_ultra_securisee
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Service d'envoi d'emails
RESEND_API_KEY=re_xxxxxxxxxxxxxx
EMAIL_FROM=Sharaco <no-reply@sharaco.akevas.com>

# URLs applicatives
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000
```

### Frontend : `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Points de Vigilance et Retours d'Expérience (*Lessons Learned*)

- 🐛 **Endpoints publics** : Ne jamais ajouter de garde d'authentification sur les routes de consultation client. Le token d'URL fait office d'autorisation d'accès.
- 🐛 **Gestion des montants** : Toujours manipuler des entiers en centimes (`_cents`). Aucun nombre à virgule flottante (`float`) pour éviter toute dérive d'arrondi.
- 🐛 **Devises dynamiques** : Ne jamais présumer de l'euro ou du FCFA en dur dans le code ; toujours s'appuyer sur la configuration de l'utilisateur (`user.currency`).
- 🐛 **Taux de TVA** : La TVA est désactivée par défaut (`has_vat = False`, `tax_rate = 0`). Le calcul se fait ligne par ligne.
- 🐛 **Cache d'aperçu PNG** : Utiliser systématiquement l'empreinte sha256 des données pour invalider le cache serveur. Côté frontend, utiliser un timestamp de cache-busting `?_t=...` lors des mutations pour forcer le rafraîchissement visuel.
- 🐛 **Configuration CORS** : Maintenir une liste stricte d'origines autorisées dans `Api/main.py` (`FRONTEND_URL`, `http://localhost:3000`).
