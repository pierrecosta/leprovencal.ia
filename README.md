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

### Frontend (`frontend/.env`)
- `REACT_APP_API_URL=http://localhost:8000` (optionnel, défaut: `http://localhost:8000`)

## URLs (dev)
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Healthcheck API: http://localhost:8000/health

## Revue backend (suggestions senior)
### 1) Contrats & cohérence DB ⇄ API
- Aligner **nullabilité DB** (SQLAlchemy/Alembic) et **schémas Pydantic** (ex: DB nullable mais champ requis → erreurs/UX).
- Normaliser les noms (ex: `titre`/`title`, `image_url`/`src`) et documenter les payloads.
- Ajouter des contraintes utiles (NOT NULL si métier, index sur champs de recherche).

### 2) Auth & sécurité
- Vérifier que l’auth “optionnelle” est réellement optionnelle (pas de 401 automatique).
- Ne pas “default” un `SECRET_KEY` en prod (fail-fast hors dev).
- JWT : `sub` + `exp` obligatoires, valider issuer/audience si besoin.

### 3) Migrations & seeds
- Éviter les migrations vides (supprimer ou compléter).
- Seeds idempotents (upsert/détection de doublons) pour pouvoir relancer `init_app.py`.

### 4) Structure & qualité
- Séparer routes → services → CRUD/DB → schemas.
- Outillage: `ruff`/`black` (+ `mypy` si pertinent), typing + docstrings utiles.
- Tests (pytest): auth, endpoints clés, cas d’erreur.

### 5) Observabilité
- Remplacer `print` par `logging` (niveaux + format).
- Healthcheck: enrichir si nécessaire (DB ok, version, etc.).