# leprovencal.ia
Site internet à propos de la Provence

## Organisation
### Backend
- Gère la donnée (API FastAPI).
- Initialisation grâce à un CSV (seeds).
- Création/migrations de la base de données (PostgreSQL).

### Frontend
- Accueil : articles
- Langue & Dictionnaire : table de traduction
- Géographie : cartes
- Histoire : histoires et légendes

## Technologie
PostgreSQL + React

## Quickstart (dev)
### Backend
```bash
cd backend
source venv/bin/activate
python init_app.py
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Configuration (.env)
### Backend (`backend/.env`)
- `DATABASE_URL=postgresql+psycopg2://myuser:mypassword@localhost:5432/provencal_db`
- `SECRET_KEY=...` (obligatoire en prod)
- `ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000` (optionnel)
- `LOG_LEVEL=INFO` (optionnel: DEBUG/INFO/WARNING/ERROR)

### Frontend (`frontend/.env`)
- `REACT_APP_API_URL=http://localhost:8000` (optionnel, défaut: `http://localhost:8000`)

## URLs (dev)
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Healthcheck API: http://localhost:8000/health (inclut `db`, `uptime_seconds`, `version`)

## Revue backend (suggestions senior)
### 1) Contrats & cohérence DB ⇄ API (proposition améliorée)
**Objectif :** éviter les “surprises” entre DB, ORM, schémas Pydantic et payloads front (bugs, 422, UX dégradée).

**Règles de base (à appliquer partout)**
- **Nullabilité :** `DB nullable=True` ⇄ `Optional[...]` côté Pydantic.  
  Si le champ est requis métier → **NOT NULL** en DB + validation Pydantic (et idéalement valeurs par défaut).
- **Schémas par intention :**
  - `XCreate` : champs requis pour créer (minimaux, cohérents avec NOT NULL).
  - `XUpdate` : champs **tous optionnels** (PATCH-like), pour éviter d’exiger des champs non modifiés.
  - `XOut` : réponse API (inclut `id`, champs calculés/normalisés).
- **Conventions de nommage :** choisir et tenir une convention (ex: `snake_case` côté API/DB).  
  Si le front consomme du `camelCase`, documenter un mapping (ou activer alias Pydantic) et s’y tenir.
- **Normalisation de domaine :** éviter les doublons sémantiques (`titre` vs `title`, `image_url` vs `src`).  
  Décider *une* représentation canonique et migrer progressivement.

**Checklist actionnable**
- Modèles SQLAlchemy : `nullable`, `unique`, `index`, `ForeignKey` (si applicable) alignés avec le métier.
- Migrations Alembic : ajouter contraintes (NOT NULL, UNIQUE), defaults, indexes de recherche.
- Schémas Pydantic : validations (longueurs, regex simples, trimming), `from_attributes=True` pour `Out`.
- Réponses API : toujours retourner un `response_model` cohérent (éviter dict ad-hoc).
- Erreurs : messages HTTPException stables + exploitables côté front (ex: “title is required” vs “Invalid payload”).
- OpenAPI : documenter exemples de payloads (create/update) + réponses (out).

**Exemples de pièges fréquents**
- DB accepte `NULL` mais Pydantic exige `str` → 422 à l’update ou lors de sérialisation.
- DB `String(100)` mais pas de validation → erreurs tardives / truncation / incohérences.
- Champs “front-only” (`src`) vs “API/DB” (`image_url`) → confusion et bugs de mapping.

### 2) Auth & sécurité (actions concrètes pour junior)
Objectif : éviter les 401 “surprises”, sécuriser la config JWT, et rendre le comportement testable.

#### 2.1 Vérifier l’auth “optionnelle” (pas de 401 automatique)
Dans le code :
- Le schéma OAuth2 doit être configuré en **optionnel** (`auto_error=False`) pour les routes publiques.
  - Voir : `backend/app/utils/security.py` (`oauth2_scheme = OAuth2PasswordBearer(..., auto_error=False)`).
- Pour les routes **privées**, on doit utiliser la dépendance qui **force** l’auth :
  - Voir : `backend/app/utils/security.py` → `require_authenticated(...)`
  - Exemple : `backend/app/routes/auth.py` → `GET /auth/me`

Actions à mener :
1) **Lister** les endpoints :
   - Publics : lecture (GET articles/dictionnaire/histoires)
   - Privés : création/modif/suppression (POST/PUT/DELETE)
2) Sur chaque endpoint privé, ajouter `Depends(require_authenticated)` (ou vérifier qu’il est déjà présent).
3) Sur les endpoints publics, si on a besoin de connaître l’utilisateur *sans obliger le login* :
   - utiliser `get_current_user_optional(...)` (retourne `None` si pas de token).

Critère de validation (manuel) :
- Appeler un endpoint public **sans** header `Authorization` → doit répondre `200`.
- Appeler un endpoint privé **sans** token → doit répondre `401` avec `WWW-Authenticate: Bearer`.
- Appeler un endpoint privé **avec** token valide → doit répondre `200/201`.

#### 2.2 SECRET_KEY : fail-fast en prod (interdire un défaut)
Problème à éviter :
- Un `SECRET_KEY` “par défaut” (ex: `"change-me"`) rend les tokens prévisibles et compromet la sécurité.

Dans le code :
- Le JWT est géré dans `backend/app/utils/security.py` (variables `SECRET_KEY`, `ALGORITHM`).

Actions à mener :
1) Ajouter une règle “prod” : si `ENV=production` (ou équivalent) et `SECRET_KEY` est manquant/valeur par défaut → **crash au démarrage**.
2) Documenter une commande/recette pour générer une clé forte :
   - Windows PowerShell :
     - `python -c "import secrets; print(secrets.token_urlsafe(64))"`
3) Vérifier que `backend/.env` contient bien `SECRET_KEY=...` en prod (jamais commité).

Critère de validation :
- En prod : démarrage sans SECRET_KEY → l’app refuse de démarrer avec un message clair.
- En dev : un SECRET_KEY de dev est autorisé (mais explicite).

#### 2.3 JWT : claims minimaux + expiration
À garantir :
- `sub` (username) + `exp` obligatoires (déjà attendu par `require_authenticated`).
- L’expiration doit être courte (ex: 30 min) et configurable via env.

Dans le code :
- `backend/app/routes/auth.py` crée le token avec `sub`.
- `backend/app/utils/security.py` ajoute `exp` via `create_access_token(...)`.

Actions à mener :
1) Confirmer que `ACCESS_TOKEN_EXPIRE_MINUTES` est configurable via env (et utilisé partout).
2) Ajouter (optionnel) `issuer/audience` si besoin métier (sinon ne pas complexifier).

Critère de validation :
- Token expiré → endpoints privés répondent `401`.
- Token sans `sub`/`exp` → endpoints privés répondent `401`.

#### 2.4 Tests minimum à écrire (pytest)
À ajouter côté backend :
1) `POST /auth/login` :
   - mauvais password → `401`
   - bon password → `200` + `access_token`
2) `GET /auth/me` :
   - sans token → `401`
   - avec token → `200` + `{ "username": ... }`
3) 1 endpoint public :
   - sans token → `200`


### 3) Migrations & seeds
- Éviter les migrations vides (supprimer ou compléter).
- Seeds idempotents (upsert/détection de doublons) pour pouvoir relancer `init_app.py`.

### 4) Structure & qualité
#### 4.1 Séparer routes → services → CRUD/DB → schemas (guide junior, pas à pas)
**Objectif :** rendre le backend lisible, testable et éviter que les routes “fassent tout” (validation métier, SQL, mapping, etc.).

##### 4.1.1 Rôles (qui fait quoi ?)
- **Routes (`backend/app/routes/*.py`)**
  - Déclarent les endpoints (path, méthodes HTTP).
  - Dépendances FastAPI (DB session, auth).
  - Ne contiennent que de la glue : appels vers `services`, gestion des codes HTTP.
- **Schemas (`backend/app/schemas.py` ou `backend/app/schemas/*.py`)**
  - Contrats d’entrée/sortie API (Pydantic) : `XCreate`, `XUpdate`, `XOut`.
  - Validation simple (types, longueurs, optionalité), aliases si besoin.
- **CRUD/DB (`backend/app/crud/*.py`)**
  - Requêtes SQLAlchemy “pures” : `get_by_id`, `list`, `create`, `update`, `delete`.
  - Pas de logique métier (pas de règles type “si article déjà publié alors…”).
  - Ne dépend pas de FastAPI (pas de `Request`, pas de `HTTPException`).
- **Services (`backend/app/services/*.py`)**
  - Logique métier et orchestration.
  - Appelle le CRUD, applique les règles métier, gère les cas “not found / conflict”.
  - C’est la couche la plus simple à tester (unit tests).

> Règle pratique : **une route ne doit pas avoir de `.query(...)`** (sauf exception justifiée).

##### 4.1.2 Checklist “refactor d’un endpoint” (méthode)
Pour un endpoint existant (ex: `POST /articles`) :
1) **Schéma** : créer/valider `ArticleCreate` + `ArticleOut`.
2) **CRUD** : extraire la requête DB dans `crud/articles.py` (create + get).
3) **Service** : créer `services/articles.py` qui :
   - valide les règles métier (ex: unicité, normalisation, defaults),
   - appelle `crud`,
   - décide quoi faire en cas d’absence/conflit.
4) **Route** : remplacer le code par un appel service :
   - dépendances (`db`, `current_user`),
   - `response_model=ArticleOut`,
   - mapping minimal (idéalement aucun mapping manuel).

##### 4.1.3 Convention de nommage (simple et constante)
- CRUD : `crud_<resource>.py` ou dossier `crud/<resource>.py`
  - Fonctions : `get_<resource>`, `list_<resources>`, `create_<resource>`, `update_<resource>`, `delete_<resource>`
- Services : `services/<resource>.py`
  - Fonctions : `create_<resource>_service`, `update_<resource>_service` (ou plus court si vous préférez, mais uniforme)
- Schemas : `schemas.py` ou `schemas/<resource>.py`
  - Classes : `<Resource>Create`, `<Resource>Update`, `<Resource>Out`

##### 4.1.4 “Done” (critères d’acceptation)
- Les routes font < ~30 lignes (hors docstring) et ne contiennent pas de requêtes SQLAlchemy directes.
- Le CRUD n’a **aucun** import FastAPI.
- Les erreurs “métier” sont traitées dans la couche service (ex: doublon → 409).
- Tests :
  - unit tests sur services (sans HTTP),
  - 1–2 tests d’intégration sur routes (client FastAPI) pour vérifier status codes + schémas.


- Tests (pytest): auth, endpoints clés, cas d’erreur.

### 5) Observabilité
- Remplacer `print` par `logging` (niveaux + format).
- Healthcheck: enrichir si nécessaire (DB ok, version, etc.).

## Conventions (frontend ⇄ backend)

### Nommage & mapping API
- **Backend / DB / ORM** : `snake_case` (ex: `image_url`, `mots_francais`).
- **Frontend (JS/React)** : `camelCase` (ex: `imageUrl`, `motsFrancais`).
- **API** : accepte et renvoie du `camelCase` via les aliases Pydantic, tout en conservant le `snake_case` en interne.

**Canonique à utiliser côté frontend (payloads & lecture)**
- Article : `id`, `titre`, `description`, `imageUrl`, `sourceUrl`
- Dictionnaire : `id`, `theme`, `categorie`, `motsFrancais`, `motsProvencal`, `synonymesFrancais`, `egProvencal`, `dProvencal`, `aProvencal`, `description`

### Thème / couleurs (source de vérité)
- **Source unique** : `frontend/src/theme.css` (variables CSS `--primary`, `--secondary`, `--accent`, etc.).
- **Aliases stables** : utiliser aussi `--color-*` (ex: `--color-lavender`, `--color-terra`) pour éviter toute duplication d’hex.
- **Tailwind** : les couleurs Tailwind pointent vers ces variables CSS (pas de valeurs hex dupliquées).

## Contrat d’erreurs API (stable)
Les endpoints renvoient des erreurs au format:
```json
{
  "detail": {
    "code": "validation_error|not_found|unauthorized|conflict|auth_required|auth_invalid",
    "message": "Message lisible",
    "field": "optionnel"
  }
}
```