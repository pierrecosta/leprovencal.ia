# leprovencal.ia

Site internet à propos de la Provence — React + FastAPI

## Architecture

| Couche | Stack | Dossier |
|--------|-------|---------|
| **Frontend** | React 18 · TypeScript · Vite 5 · Tailwind CSS | `frontend/` |
| **Backend** | FastAPI · SQLAlchemy · PostgreSQL · PyJWT · bcrypt | `backend/` |

### Pages
- **Accueil** : articles avec CRUD
- **Langue & Dictionnaire** : table de traduction français/provençal
- **Géographie** : cartes interactives
- **Histoire** : histoires et légendes de Provence

---

## Quickstart (dev)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python init_app.py          # Check DB, run migrations, seed data
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker (dev)
```bash
docker compose up
```

---

## Configuration

### Backend (`backend/.env`)
```env
ENV=development
DATABASE_URL=******localhost:5432/provencal_db
SECRET_KEY=change-me
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173,http://localhost:8000
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

---

## URLs (dev)

| Service | URL |
|---------|-----|
| Frontend (Vite dev) | http://localhost:5173 |
| Frontend (preview) | http://localhost:4173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| Healthcheck | http://localhost:8000/health |

---

## Auth

- Login via `POST /auth/login` (OAuth2 form) → retourne JSON + cookie HttpOnly `access_token`
- Frontend utilise `withCredentials: true` (Axios) pour envoyer le cookie
- Logout via `POST /auth/logout` (efface le cookie)
- Protection routes : dépendance `require_authenticated`

---

## CI/CD

- **Backend CI** : `.github/workflows/ci-backend.yml` — lint, tests, build container
- **Frontend CI** : `.github/workflows/ci-frontend.yml` — lint, type-check, build, build container
- Containers publiés sur `ghcr.io` à chaque push sur `main`
- Mise à jour des dépendances automatisée via Renovate (mensuelle)

---

## Production Checklist

- [ ] `SECRET_KEY` forte via secret manager (fail-fast si absente)
- [ ] `ALLOWED_ORIGINS` = domaine(s) front uniquement (pas de `*`, pas de localhost)
- [ ] Reverse proxy (Nginx/Caddy/Traefik) avec TLS + HSTS
- [ ] User DB dédié avec droits minimum
- [ ] Containers exécutés en user non-root
- [ ] Rate limiting sur `/auth/login`
- [ ] Headers sécurité : CSP, X-Content-Type-Options, Referrer-Policy
