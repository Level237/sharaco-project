# 📏 RULES — Contrat d'Interface & Règles d'Or API ↔ Frontend

> ⚠️ **Ce document constitue le contrat d'interface officiel entre `Api/` et `frontend/`.**  
> Toute modification de contrat doit être concertée et répercutée des deux côtés.  
> En cas de divergence, **l'API est la source unique de vérité**.

---

## 1. Conventions de Nommage

| Couche | Convention | Exemples |
|---|---|---|
| **API (Python / FastAPI)** | `snake_case` | `unit_price_cents`, `grand_total_cents`, `payment_schedule`, `tax_rate`, `client_id` |
| **Frontend (TypeScript / Next.js)** | `camelCase` en interne, **`snake_case` vers l'API** | `unitPrice` (interne UI) ↔ `unit_price_cents` (payload API) |

> [!CAUTION]
> **Règle absolue** : Le frontend doit systématiquement convertir les payloads en `snake_case` avant d'appeler l'API. **Ne jamais envoyer de clés en camelCase à l'API.** Le mapping doit être centralisé dans les fichiers `*Api.ts` et les convertisseurs de types.

---

## 2. Format des Montants (CRITIQUE)

- 💰 **Toujours en centimes entiers** : Tous les montants financiers sont stockés et échangés sous forme d'**entiers** avec le suffixe `_cents`.
- 🚫 **Zéro nombre flottant (`float`)** : Les `float` sont rigoureusement interdits dans les schémas de base de données et les payloads JSON pour éviter les erreurs d'arrondi binaire.
- 🚫 **Aucune division par 100 dans la logique métier de l'API** : Les calculs (totaux, pourcentages d'acomptes, TVA) sont réalisés en centimes entiers. La division par 100 n'intervient qu'au moment du rendu visuel (templates Jinja2 HTML et formateurs UI frontend).

```json
{
  "unit_price_cents": 1500000,
  "tax_amount_cents": 0,
  "grand_total_cents": 1500000
}
```

*Exemples :*
- `1 500 000 FCFA` ➔ `1500000` (entier)
- `45,50 €` ➔ `4550` (entier)

---

## 3. Gestion des Devises

- **Source de vérité** : Définie dans le profil utilisateur (`user.currency`) ou les paramètres de facturation (`billing_settings.currency`).
- **Codes standardisés** : Codes ISO à 3 lettres (`XOF`, `EUR`, `USD`, etc.).
- **Symboles & Formats** :
  - Côté API : résolu dynamiquement via `get_currency_symbol(currency)`.
  - Côté Frontend : formateur centralisé `formatAmount(cents, currency)` ou `CURRENCY_DISPLAY`.
- **Règle d'or** : Ne jamais hardcoder de devise ("€" ou "FCFA") en dur dans le code frontend ou les notifications par email.

---

## 4. TVA (Taxe sur la Valeur Ajoutée)

- **Désactivée par défaut** : Pour tout nouveau devis ou facture, la TVA est inactive (`has_vat = false`, `tax_rate = 0`).
- **Calcul par ligne** : Chaque article de document (`DocumentItem`) porte son propre taux de taxe (`tax_rate`).
- **Cohérence** : Si `has_vat = false` sur le document, tous les `tax_rate` des lignes doivent impérativement valoir `0`.

---

## 5. Machine d'État et Cycle de Vie des Documents

```text
               ┌─────────┐
               │  DRAFT  │
               └────┬────┘
                    │
                    ▼
               ┌─────────┐
      ┌─────── │  SENT   │ ◄──────────────────────────────┐
      │        └────┬────┘                                │
      │             │                                     │
      │             ▼                                     │
      │        ┌─────────┐                                │
      │        │ VIEWED  │ ──────────────────────┐        │
      │        └────┬────┘                       │        │
      │             │                            │        │
      │             ├───────────────┐            │        │
      │             ▼               ▼            │        │
      │       ┌──────────┐    ┌──────────┐       ▼        │
      │       │ ACCEPTED │    │ REFUSED  │   ┌─────────┐  │
      │       └─────┬────┘    └──────────┘   │ OVERDUE │ ─┘
      │             │                        └─────────┘
      │             ▼ (Génération Facture / Échéancier)
      │       ┌──────────┐
      └─────▶ │   PAID   │
              └──────────┘
```

- **Transitions validées côté API** : Les transitions de statut sont strictement orchestrées par les endpoints d'action (`POST /accept`, `POST /refuse`, `POST /invoices/{id}/mark-paid`, `PATCH /{id}/status`).
- **Le frontend ne décide jamais unilatéralement d'un statut** : Il affiche l'état retourné par l'API et propose les actions autorisées.

---

## 6. Endpoints Publics (Accès Client sans Authentification)

Ces endpoints sont accessibles par les clients finaux sans compte ni Bearer token. La sécurité est garantie par le **token cryptographique opaque** inclus dans le chemin d'URL :

- `GET /api/v1/documents/client/{token}` — Lecture du devis par le client
- `GET /api/v1/documents/client/{token}/preview` — Rendu HTML de prévisualisation client
- `POST /api/v1/documents/client/{token}/accept` — Acceptation / signature du devis
- `POST /api/v1/documents/client/{token}/refuse` — Refus motivé du devis
- `GET /api/v1/documents/shared/{token}` — Lecture d'un document partagé en direct
- `GET /api/v1/documents/shared/{token}/preview` — Rendu HTML du document partagé
- `POST /api/v1/documents/shared/{token}/refuse` — Refus d'un document partagé
- `GET /api/v1/documents/invoices/public/{token}` — Consultation d'une facture publique

> [!WARNING]
> Ces routes ne doivent **JAMAIS** déclarer de dépendance `Depends(get_current_user)`.

---

## 7. Authentification et Isolation des Données (Multi-Tenancy)

- **Stockage du Token** : JWT conservé dans le `localStorage` du navigateur sous la clé `sharaco_token`.
- **En-tête HTTP** : `Authorization: Bearer <token>` requis sur toutes les routes privées (`/api/v1/...`).
- **Gestion du 401** : En cas de token expiré ou invalide, le client HTTP frontend intercepte l'erreur 401, purge le cache et redirige l'utilisateur vers `/login`.
- **Cloisonnement strict** : L'API garantit qu'aucune donnée n'est accessible hors de l'organisation ou de l'utilisateur authentifié (clause obligatoire `WHERE user_id = current_user.id`).

---

## 8. Moteur de Rendu & Cache des Previews

- **Rendu côté API** : Généré par Playwright (Chromium headless) sur base des templates HTML Jinja2 (`app/templates/`).
- **Clé de cache** : Empreinte SHA-256 calculée à partir des données structurées du document.
- **Rafraîchissement HTTP** : Le frontend transmet un paramètre `?_t=<timestamp>` lors des mutations pour contourner le cache navigateur et obtenir immédiatement le rendu visuel à jour.
- **Règle** : Ne pas désactiver le cache serveur sans justification d'architecture.

---

## 9. Échéanciers de Paiement Multi-Tranches

- Un échéancier se compose d'une liste de jalons (`PaymentSchedule`) :
  - `sequence` : Ordre chronologique (1, 2, 3...)
  - `title` : Libellé du jalon (ex. "Acompte à la signature", "Livraison V1", "Solde")
  - `percent` : Pourcentage du montant total (la somme des tranches doit valoir 100%)
  - `amount_cents` : Montant exact en centimes du jalon
  - `status` : `PENDING` ➔ `INVOICED` ➔ `PAID`
- Chaque facture émise pour une tranche est rattachée à son jalon via `milestone.invoice_id`.
- L'échéancier n'est affiché sur le document que s'il comporte au moins **2 tranches**.

---

## 10. Processus de Développement et Règles d'Or

### Les Règles d'Or

- ✅ **API d'abord** : Tester et valider chaque nouvel endpoint via Swagger (`http://localhost:8000/docs`) avant d'entamer son intégration dans le frontend.
- ✅ **Typage systématique** : Toute nouvelle entité ou modification de champ backend doit faire l'objet d'un type TypeScript mis à jour dans `frontend/src/features/*/types`.
- ✅ **Migrations rigoureuses** : Toute modification de modèle `SQLModel` exige la création et l'application d'une migration Alembic (`alembic revision --autogenerate -m "..." && alembic upgrade head`).
- ❌ **Aucune fuite de sécurité** : Ne jamais afficher de tokens, clés API ou données sensibles dans les logs (`console.log`, `print`).
- ✅ **Conventions de commits claires** :
  - `feat(api): ...`
  - `feat(web): ...`
  - `feat(fullstack): ...`
  - `fix(...)`, `docs(...)`, `refactor(...)`

---

### Processus pas à pas lors d'une modification de contrat

```text
1. Modification du modèle SQLModel (Api/app/models/...)
      ↓
2. Création et exécution de la migration Alembic (alembic upgrade head)
      ↓
3. Mise à jour des schémas Pydantic d'entrée et de sortie (Api/app/schemas/...)
      ↓
4. Test unitaire ou vérification dans la documentation Swagger (/docs)
      ↓
5. Mise à jour des interfaces TypeScript (frontend/src/features/*/types/...)
      ↓
6. Mise à jour des fonctions d'appel HTTP (frontend/src/features/*/api/*Api.ts)
      ↓
7. Vérification de l'interface et du bon affichage dans le navigateur
```
