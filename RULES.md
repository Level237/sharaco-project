
---

## 2️⃣ `RULES.md` (le contrat sacré)

```markdown
# 📏 RULES.md — Contrat API ↔ Frontend

> ⚠️ **Ce fichier fait loi.** Toute modification d'un côté doit être répercutée de l'autre.
> En cas de doute, **l'API est la source de vérité**.

---

## 1. Conventions de nommage

| Couche | Convention | Exemple |
|--------|-----------|---------|
| **API (Python)** | `snake_case` | `unit_price_cents`, `grand_total_cents`, `payment_schedule` |
| **Frontend (TS)** | `camelCase` en interne, `snake_case` vers l'API | `unitPrice` (local) ↔ `unit_price_cents` (API) |

🔑 **Règle** : le frontend fait le mapping dans les `*Api.ts` et les types. **Ne jamais envoyer de camelCase à l'API.**

---

## 2. Format des montants (CRITIQUE)

- Tous les montants sont stockés/transmis en **centimes (entier)**, suffixe `_cents`
- **Aucune division par 100** dans l'API (sauf affichage PDF via Jinja)
- Exemple : `1 500 000 F CFA` = `1500000` (entier)

```json
{ "unit_price_cents": 1500000, "grand_total_cents": 4500000 }


## 3. Devise
Stockée dans user.currency (code ISO : XOF, EUR, USD...)
Symbole via get_currency_symbol() (backend) / CURRENCY_DISPLAY (frontend)
Toujours utiliser format_amount(cents, currency) pour les emails/notifications
Détection auto au 1er chargement via navigator.language (frontend)

4. TVA
Désactivée par défaut (hasVat = false, tax_rate = 0)
tax_rate est par ligne (chaque DocumentItem a son propre taux)
Si hasVat = false → tous les tax_rate doivent être 0

5. Statuts des documents

DRAFT → SENT → VIEWED → PAID
                  ↘ ACCEPTED (devis) → génère facture
                  ↘ REFUSED

Transitions validées côté API (update_status)
Le frontend ne décide jamais d'une transition : il appelle l'endpoint

6. Endpoints publics (sans auth)
Ces routes ne doivent JAMAIS exiger de Bearer token :
GET /api/v1/documents/client/{token} + /preview
GET /api/v1/documents/shared/{token} + /preview
GET /api/v1/documents/invoices/public/{token}
POST /api/v1/documents/client/{token}/accept
POST /api/v1/documents/client/{token}/refuse
🔐 Sécurité = le token dans l'URL (pas de JWT).


7. Authentification
JWT stocké dans localStorage sous la clé sharaco_token
Header : Authorization: Bearer <token>
401 → le frontend redirige vers /login
L'API ne renvoie jamais de données d'un autre user (toujours filtrer par user_id)
8. Cache des previews
Les PNG de preview sont cachés côté API (clé = doc_id + hash(contenu))
Le frontend peut ajouter ?_t=timestamp pour forcer le refetch HTTP
Ne jamais désactiver le cache serveur sans raison
9. Échéanciers de paiement
Un échéancier = liste de PaymentSchedule (sequence, title, percent, amount_cents, status)
Status : PENDING → INVOICED → PAID
Une facture = 1 milestone (milestone.invoice_id)
Affiché uniquement si ≥ 2 tranches (sinon masqué)
10. Règles d'or du développement
✅ Tester l'API seule d'abord (Swagger /docs) avant de toucher le frontend
✅ Toute nouvelle route → ajouter le type TS correspondant dans frontend/features/*/types
✅ Toute modif de schéma → migration Alembic + mettre à jour les types frontend
❌ Jamais de logique métier dans le frontend (calculs, statuts, numérotation)
❌ Jamais de console.log de token / données sensibles
✅ Commit message : feat(api): ... ou feat(web): ... ou feat(fullstack): ...


🔄 Processus de modification


1. Je change un champ dans le modèle SQLModel (Api/)
        ↓
2. Je crée une migration Alembic
        ↓
3. Je mets à jour le schéma Pydantic (Api/app/schemas/)
        ↓
4. Je teste l'endpoint dans Swagger
        ↓
5. Je mets à jour le type TypeScript (frontend/features/*/types)
        ↓
6. Je mets à jour le *Api.ts si la route change
        ↓
7. Je teste dans le navigateur


Si une étape est sautée → bug garanti. 🐛

