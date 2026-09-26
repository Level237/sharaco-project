# Sharaco — Fullstack

> **Plateforme SaaS moderne de devis, facturation et gestion financière** pour freelances, agences, auto-écoles et PME.
> Architecture **monorepo** : Backend haute performance en **Python (FastAPI)** + Frontend réactif en **Next.js (React 19 & TypeScript)**.

---

## 📁 Structure du Monorepo

```text
sharaco-fullstack/
├── Api/                 # Backend FastAPI (Python 3.11+)
│   ├── alembic/         # Scripts de migration de la base de données
│   ├── app/
│   │   ├── api/v1/      # Routers FastAPI (auth, document, client, project, reminder, etc.)
│   │   ├── core/        # Configuration, sécurité JWT, devises
│   │   ├── crud/        # Opérations base de données
│   │   ├── db/          # Connexion async SQLModel / SQLAlchemy
│   │   ├── models/      # Entités SQLModel (User, Document, Client, Project...)
│   │   ├── schemas/     # Schémas de validation Pydantic (In/Out)
│   │   ├── services/    # Moteur de rendu PDF/PNG (Playwright), emails (Resend), overdue
│   │   └── templates/   # Templates HTML/Jinja2 pour devis & factures
│   ├── storage/         # Cache disque des previews générées
│   └── requirements.txt # Dépendances backend
│
├── frontend/            # Frontend Next.js (TypeScript, Tailwind CSS v4)
│   ├── src/
│   │   ├── app/         # App Router Next.js (pages publiques et protégées)
│   │   ├── components/  # Composants UI partagés (Radix UI, Dialog, Dropdown...)
│   │   ├── features/    # Modules fonctionnels (auth, quotes, invoices, clients, projects...)
│   │   ├── hooks/       # Hooks personnalisés
│   │   ├── lib/         # Client API HTTP, utilitaires de formatage
│   │   └── store/       # Stores d'état global Zustand
│   └── package.json     # Dépendances frontend
│
├── README.md            # Ce fichier — Présentation générale et guide de démarrage
├── RULES.md             # Contrat d'interface strict API ↔ Frontend
└── ARCHITECTURE.md      # Documentation technique des flux et de l'architecture
```

---

## 🧩 Complémentarité des deux projets

| Couche | Projet | Rôle | Technologies Clés |
|---|---|---|---|
| **Backend** | `Api/` | **Source unique de vérité** : persistance des données, logique métier (TVA, statuts, échéanciers), génération haute fidélité PDF/PNG, envoi d'emails transactionnels, cron jobs. | FastAPI, SQLModel, PostgreSQL (asyncpg), Playwright (Chromium), Jinja2, Resend, APScheduler |
| **Frontend** | `frontend/` | **Interface utilisateur réactive** : éditeur de devis/factures en temps réel, dashboard analytics, portail client public sans friction, gestion des projets et relances. | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Query v5, Zustand v5, Lucide React, Framer Motion |

> [!IMPORTANT]
> **Principe fondamental** : Le frontend **ne contient aucune logique métier**. Les calculs de montants, TVA, remises, échéanciers, numérotation et transitions de statuts sont strictement validés et calculés par `Api/`.

---

## ⚡ Fonctionnalités Clés

- 📄 **Éditeur de devis & factures** : Personnalisation en direct avec 8 layouts élégants (*classic*, *modern*, *minimal*, *bold*, *elegant*, *premium*, *bento*, *studio*).
- 🖼️ **Previews instantanées** : Moteur Playwright avec préchauffage Chromium et mise en cache mémoire/disque basée sur le hash du contenu.
- 📆 **Échéanciers multi-tranches** : Gestion d'acomptes et paiements échelonnés avec génération séquentielle des factures par jalon (*Milestones*).
- 🔗 **Portails clients publics** : Consultation, signature / acceptation ou refus en ligne via URLs sécurisées par jeton unique, sans mot de passe requis pour le client final.
- ⏰ **Relances & Détection de retard** : Cron automatique (APScheduler) vérifiant les factures échues et envoi d'emails de relance ciblés via Resend.
- 💱 **Multi-devises** : Prise en charge native de toutes devises (FCFA / XOF, EUR, USD...) avec stockage entier strict en centimes.

---

## 🚀 Démarrage Rapide

### Prérequis
- **Python 3.11+**
- **Node.js 20+** et **pnpm** (ou npm)
- **PostgreSQL 15+**
- Clé d'API **Resend** (pour l'envoi d'emails)

---

### 1. Démarrer le Backend (`Api/`)

```bash
cd Api

# 1. Créer et activer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate    # Sur Windows: venv\Scripts\activate

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Installer les navigateurs pour Playwright (génération PDF/PNG)
playwright install chromium

# 4. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env (DATABASE_URL, SECRET_KEY, RESEND_API_KEY, FRONTEND_URL...)

# 5. Exécuter les migrations de base de données
alembic upgrade head

# 6. Lancer le serveur de développement
uvicorn app.main:app --reload --port 8000
```

- **API URL** : [http://localhost:8000](http://localhost:8000)
- **Documentation interactive Swagger** : [http://localhost:8000/docs](http://localhost:8000/docs)
- **Documentation ReDoc** : [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Démarrer le Frontend (`frontend/`)

```bash
cd frontend

# 1. Installer les dépendances
pnpm install
# (ou npm install)

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# Vérifier que NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Lancer le serveur Next.js en développement
pnpm dev
# (ou npm run dev)
```

- **Application Web** : [http://localhost:3000](http://localhost:3000)

---

## 🔄 Schéma de Communication

```text
┌───────────────────────────┐                    ┌───────────────────────────┐
│         frontend/         │                    │           Api/            │
│       Next.js 16          │  HTTP / REST JSON  │          FastAPI          │
│   (React 19, Zustand)     │ ─────────────────▶ │ (SQLModel, Pydantic, Auth)│
│                           │ ◀───────────────── │                           │
│  http://localhost:3000    │   JSON / PNG / PDF │   http://localhost:8000   │
└───────────────────────────┘                    └─────────────┬─────────────┘
              │                                                │
   localStorage (JWT)                                          │
   URL Tokens (/client/{token})                                ├──▶ PostgreSQL (asyncpg)
                                                               ├──▶ Playwright (Rendu PDF & PNG)
                                                               ├──▶ Resend (Envoi d'emails)
                                                               └──▶ APScheduler (Jobs quotidiens)
```

- **Requêtes privées** : Envoient l'en-tête `Authorization: Bearer <token>` (JWT stocké dans le localStorage sous la clé `sharaco_token`).
- **Requêtes publiques** : URLs du type `/api/v1/documents/client/{token}` ou `/api/v1/documents/invoices/public/{token}` accessibles sans JWT.
- **Rendu visuel** : Les aperçus PNG sont générés à chaud par Playwright et servis directement en bytes (`image/png`) avec invalidation par hash.

---

## 📚 Documentation & Bonnes Pratiques

- 📏 **[RULES.md](file:///home/level/dev/web/fullstack/sharaco-fullstack/RULES.md)** : **Le contrat sacré**. Nommage snake_case vs camelCase, gestion stricte des montants en centimes, règles de devises, transitions de statuts.
- 🏗️ **[ARCHITECTURE.md](file:///home/level/dev/web/fullstack/sharaco-fullstack/ARCHITECTURE.md)** : Description détaillée des flux (création de devis, acceptation client, factures multi-tranches, rappels automatiques).

---

## ✅ Checklist Avant Toute Livraison

Avant de committer ou déployer une modification, vérifier :

- [ ] **Pas de camelCase vers l'API** : Le mapping s'effectue dans `features/*/api` et `features/*/types`.
- [ ] **Montants en centimes entiers** : Aucun flottant (`100.50`), toujours `10050` avec suffixe `_cents`.
- [ ] **Endpoints publics vérifiés** : Aucune injection de dépendance `Depends(get_current_user)` sur les routes client/shared.
- [ ] **Migrations Alembic générées et appliquées** en cas de modification de modèle SQLModel.
- [ ] **Types TypeScript synchronisés** entre schémas Pydantic et types frontend.
- [ ] **CORS et URLs d'environnement** correctement paramétrés entre frontend et backend.