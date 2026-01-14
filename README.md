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
- `ENV=development|production` (recommandé ; en `production`, durcissements activés)
- `DATABASE_URL=postgresql+psycopg2://myuser:mypassword@localhost:5432/provencal_db`
- `SECRET_KEY=...` (**obligatoire en prod** ; valeur `change-me` interdite, l'app fail-fast au démarrage)
- `ALLOWED_ORIGINS=https://votre-domaine-frontend.tld` (en prod : pas de `*`, pas de `localhost`)
- `LOG_LEVEL=INFO` (en prod : `DEBUG` est neutralisé)

### Frontend (`frontend/.env`)
- `REACT_APP_API_URL=http://localhost:8000` (optionnel, défaut: `http://localhost:8000`)

## URLs (dev)
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Healthcheck API: http://localhost:8000/health (inclut `db`, `uptime_seconds`, `version`)

## Auth (cookie HttpOnly) — notes importantes

- Le backend peut désormais émettre un cookie HttpOnly `access_token` lors de `/auth/login`.
- En développement, le cookie est posé pour l'origine backend (http://localhost:8000). Le frontend doit
  effectuer ses requêtes en incluant les credentials (cookies). Exemple Axios frontend :

```js
// axios instance
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000', withCredentials: true });
```

- CORS: `ALLOWED_ORIGINS` doit inclure explicitement `http://localhost:3000` (front) en dev. `allow_credentials` est activé côté backend.
- Le frontend `login` POST renvoie toujours la payload JSON existante et, en plus, le cookie est posé. Le frontend doit compter sur la présence du cookie (HttpOnly) pour les requêtes authentifiées. Un endpoint `/auth/logout` est exposé pour effacer le cookie.

Dev ports whitelist: dans ce dépôt, les ports de développement autorisés sont `localhost:3000` (frontend) et `localhost:8000` (backend).

## ToDo for PROD

### Topic A — Secrets & configuration
#### A.a — SECRET_KEY
- Action 2: Générer une clé forte et la stocker uniquement dans le secret manager (pas dans git).
  - `python -c "import secrets; print(secrets.token_urlsafe(64))"`

### Topic D — DB & migrations (PostgreSQL)
#### D.a — Compte DB & permissions
- Action 1: Utiliser un user DB dédié applicatif avec droits minimum (pas superuser).
- Action 2: Bloquer l’accès réseau DB (security group/firewall): DB accessible seulement depuis le backend.

#### D.b — Migrations/seeds
- Action 1: Éviter les migrations “dangereuses” sans backfill (NOT NULL/UNIQUE → corriger les données avant).
- Action 2: Rendre les seeds idempotents (relançables sans dupliquer).

### Topic E — Sécurité HTTP (reverse proxy recommandé)
#### E.a — HTTPS uniquement
- Action 1: Mettre le backend derrière un reverse proxy (Nginx/Caddy/Traefik) avec TLS.
- Action 2: Forcer la redirection HTTP→HTTPS et activer HSTS côté proxy.

#### E.b — Headers de sécurité (au proxy)
- Action 1: Ajouter `Content-Security-Policy` (CSP) adaptée au front.
- Action 2: Ajouter `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Action 3: Vérifier que `expose_headers=["*"]` n’est pas nécessaire en prod (réduire au strict besoin).

### Topic F — Rate limiting & anti-abus
- Action (frontend): en cas de `429` sur `/auth/login`, respecter `Retry-After` (bouton désactivé + message).

### Topic H — Dépendances & supply chain
#### Subtopic H.a — Audit & updates
- Action 1: Geler les versions (requirements) et faire un audit régulier (ex: `pip-audit`).
- Action 2: Mettre à jour rapidement `fastapi`, `sqlalchemy`, `python-jose`, `passlib`, `bcrypt` en cas de CVE.

---

### Topic I — Déploiement (hardening)
#### Subtopic I.a — Uvicorn/Gunicorn & workers
- Action 1: En prod, lancer via gunicorn/uvicorn workers, pas `--reload`.
- Action 2: Définir timeouts, limites de payload (proxy + app).

#### Subtopic I.b — Conteneurs / OS
- Action 1: Exécuter en user non-root.
- Action 2: Secrets via env/secret manager, pas baked-in image.
- Action 3: Activer logs/metrics au niveau infra (proxy + app).
## Revue backend (suggestions cyber)

### Topic A — Secrets & configuration
#### Subtopic A.a — SECRET_KEY (JWT) & variables d’environnement
- Action 1: En prod, **interdire** tout `SECRET_KEY` par défaut (`change-me`) et **fail-fast** au démarrage si absent.
- Action 3: Séparer clairement `ENV=development|production` et vérifier que les comportements “dev” (CORS large, logs verbeux) sont désactivés en prod.
- Action 4: Ne jamais logguer de secrets (token, mots de passe, URL DB complète).

#### Subtopic A.b — ALLOWED_ORIGINS / CORS
- Action 1:  **ne pas** autoriser `*`. Lister uniquement le(s) domaine(s) front. En dev autoriser uniquement localhost
- Action 2: Tester:
  - requête depuis un origin non autorisé → doit être bloquée par le navigateur (CORS).
  - requête depuis le front prod → doit passer.

### Topic B — Authentification & JWT
#### Subtopic B.a — Expiration & validation
- Action 1: Garder `ACCESS_TOKEN_EXPIRE_MINUTES` court (ex: 30) et configurable via env.
- Action 2: Vérifier que `require_authenticated` renvoie `401` avec `WWW-Authenticate: Bearer` si token absent/invalide/expiré.
- Action 3: Ajouter un test manuel: token expiré → endpoints privés → `401`.

#### Subtopic B.b — Surface d’attaque endpoints
- Action 1: Vérifier que **toutes** les routes POST/PUT/DELETE utilisent `Depends(require_authenticated)`.
- Action 2: Vérifier que les routes GET publiques ne forcent pas l’auth (pas de 401 surprise).

#### Subtopic B.c — Stockage du token côté front (rappel)
- Action 1: Préférer cookie `HttpOnly; Secure; SameSite`.

### Topic C — Erreurs API stables (contrat exploitable)
#### Subtopic C.a — Format de réponse d’erreur
- Action 1: Standardiser `HTTPException.detail` au format:
  - `{"code": "...", "message": "...", "field": "optionnel"}`
- Action 2: Utiliser des codes stables (`validation_error`, `not_found`, `unauthorized`, `conflict`, `auth_required`, `auth_invalid`) pour faciliter le traitement côté front.
- Action 3: Tester côté front que les messages affichés ne deviennent jamais `[object Object]`.

### Topic F — Rate limiting & anti-abus
#### Subtopic F.a — Protection brute force login
- Action 1: Ajouter un rate limit sur `/auth/login` (par IP + par username).
- Action 2: Ajouter un délai progressif / verrouillage temporaire après N échecs.

#### Subtopic F.b — Protection endpoints publics
- Action 2: Définir des limites `limit` raisonnables (déjà partiellement fait) et tester l’impact.

### Topic G — Observabilité & logs (sans fuite de données)
#### Subtopic G.a — Logging structuré
- Action 1: Remplacer `print` par `logging` partout.
- Action 2: Utiliser un format log stable (timestamp, level, module, request_id si possible).
- Action 3: Filtrer/masquer données sensibles (Authorization header, passwords).

#### Subtopic G.b — Healthcheck
- Action 1: `/health` doit inclure au minimum DB ok + version + uptime (déjà fait).
- Action 2: En prod, exposer `/health` uniquement au réseau interne (ou le protéger).

## Tests manuels (auth/JWT)
- Token expiré :
  1. Se connecter et récupérer `access_token` (frontend ou réponse `/auth/login`).
  2. Attendre l’expiration (ou réduire `ACCESS_TOKEN_EXPIRE_MINUTES=1`).
  3. Appeler un endpoint privé (ex: `GET /auth/me` ou `PUT /articles/{id}`) avec `Authorization: Bearer <token>`.
  4. Attendu : `401` + header `WWW-Authenticate: Bearer`.

## Tests manuels (anti-abus)
- Brute-force login :
  1. Faire plusieurs tentatives de login avec un mauvais mot de passe (même username).
  2. Attendu : `429 Too Many Requests` + header `Retry-After`.
  3. Attendre le délai puis retenter.


