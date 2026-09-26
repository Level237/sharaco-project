
---

## 3️⃣ `ARCHITECTURE.md` (les flux)

```markdown
# 🏗️ ARCHITECTURE.md — Comment Api/ et frontend/ travaillent ensemble

## Vue d'ensemble
                ┌──────────────────────────────────────┐
                │            sharaco-fullstack         │
                │                                      │

                Utilisateur ───▶ │ frontend/ (Next.js) │
│ │ │
│ │ fetch() + Bearer token │
│ ▼ │
│ Api/ (FastAPI) │
│ │ │
│ ├─▶ PostgreSQL (données) │
│ ├─▶ Resend (emails) │
│ └─▶ Playwright (PDF/PNG) │
└──────────────────────────────────────┘



---

## Flux 1 : Création d'un devis


[frontend] [Api] [DB]
│ │ │
│ 1. POST /documents │ │
│ {items, layout_style, │ │
│ payment_schedule} │ │
│ ──────────────────────────────▶ │ │
│ │ 2. create_document() │
│ │ + set_schedule() │
│ │ ────────────────────────────▶ │
│ │ ◀──────────────────────────── │
│ 3. DocumentRead (JSON) │ │
│ ◀────────────────────────────── │ │
│ │ │
│ 4. GET /{id}/preview.png │ │
│ ──────────────────────────────▶ │ 5. get_or_render_document_png│
│ │ (cache hit/miss) │
│ 6. PNG (bytes) │ │
│ ◀────────────────────────────── │ │



## Flux 2 : Envoi + acceptation client


[Pro/frontend] [Api] [Resend] [Client/frontend]
│ │ │ │
│ POST /send-email │ │ │
│ ───────────────▶ │ │ │
│ │ send_devis() │ │
│ │ ────────────────▶ │ │
│ │ │ email + lien │
│ │ │ ─────────────────▶ │
│ │ │ │
│ │ │ GET /client/{tk} │
│ │ ◀───────────────────────────────────── │
│ │ (pas de JWT, token dans URL) │
│ │ │ │
│ │ ◀── POST /client/{tk}/accept ───────── │
│ │ handle_quote_acceptance() │
│ │ → facture auto créée │
│ │ → notification au pro │
│ ◀── notif email ─│ │ │


## Flux 3 : Échéancier multi-tranches


Devis accepté (3 tranches : 30/40/30)
│
▼
Facture tranche 1 (30%) créée auto ──▶ milestone 1 = INVOICED
│
[pro marque payée] POST /invoices/{id}/mark-paid
│ → milestone 1 = PAID
▼
[pro clique "Facturer la suite"] POST /{id}/next-invoice
│ → Facture tranche 2 (40%) créée
│ → milestone 2 = INVOICED
▼
... jusqu'à tranche 3 (solde)



---

## Responsabilités strictes

### `Api/` (Backend) — FAIT :
- ✅ Validation des données (Pydantic)
- ✅ Logique métier (TVA, totaux, numérotation, statuts)
- ✅ Persistance (PostgreSQL)
- ✅ Génération PDF/PNG (Playwright + Jinja)
- ✅ Envoi d'emails (Resend)
- ✅ Autorisations (un user ne voit que ses données)
- ✅ Cache des previews

### `Api/` — NE FAIT PAS :
- ❌ Rendu UI
- ❌ État de l'interface (onglet actif, zoom, drawer ouvert)

### `frontend/` (Frontend) — FAIT :
- ✅ Rendu UI (React + Tailwind)
- ✅ État interface (Zustand, useState)
- ✅ Cache serveur-side data (TanStack Query)
- ✅ Mapping snake_case ↔ camelCase
- ✅ Gestion du token JWT
- ✅ Détection devise (navigator.language)

### `frontend/` — NE FAIT PAS :
- ❌ Calculs métier (TVA, totaux → toujours depuis l'API)
- ❌ Décision de statut
- ❌ Stockage de données métier en local (sauf cache Query)

---

## Variables d'environnement clés

### `Api/.env`
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/sharaco
RESEND_API_KEY=re_xxx
EMAIL_FROM=Sharaco <no-reply@sharaco.akevas.com>
FRONTEND_URL=http://localhost:3000
SECRET_KEY=xxx


frontend/.env.local

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000


Points de vigilance (lessons learned)
🐛 Endpoints publics : ne jamais y mettre Depends(get_current_user)
🐛 Devise : ne jamais hardcoder FCFA / € — toujours lire user.currency
🐛 TVA : défaut = 0, pas 20
🐛 Cache PNG : invalider automatiquement via hash, pas manuellement
🐛 CORS : autoriser http://localhost:3000 en dev
🐛 Montants : toujours en centimes entiers, jamais de float

