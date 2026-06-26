# AI Coding Agent Instructions for leprovencal.ia

## Architecture Overview
- **Backend**: FastAPI (Python 3.11) with SQLAlchemy ORM, PostgreSQL, JWT authentication via PyJWT, password hashing via bcrypt (direct). Routes in `backend/app/routes/` for articles, auth, dictionnaire, histoires, cartes.
- **Frontend**: React 18 with Vite 5 + TypeScript, Tailwind CSS, Axios for API calls, React Router v6 for navigation. Components in `frontend/src/components/`, pages in `frontend/src/pages/`, hooks in `frontend/src/hooks/`, types in `frontend/src/types/`.
- **Data Flow**: Frontend fetches public data via GET endpoints. Authenticated users can CRUD via PUT/POST/DELETE with ****** (HttpOnly cookies). CORS enabled for localhost:5173, 4173, 8000.

## Key Workflows
- **Backend dev**: `cd backend/ && source venv/bin/activate && uvicorn app.main:app --reload` (port 8000).
- **Frontend dev**: `cd frontend/ && npm run dev` (port 5173).
- **Docker dev**: `docker compose up` (starts both services + PostgreSQL).
- **Database migrations**: `cd backend/ && alembic revision --autogenerate -m "msg" && alembic upgrade head`.
- **Backend tests**: `cd backend/ && PYTHONPATH=. pytest -q`
- **Frontend lint**: `cd frontend/ && npm run lint`
- **Frontend type-check**: `cd frontend/ && npm run type-check`
- **Frontend build**: `cd frontend/ && npm run build`

## Project Conventions
- **API Responses**: Pydantic schemas in `backend/app/schemas.py`. Models in `backend/app/models.py`.
- **Error format**: `HTTPException.detail` = `{"code": "...", "message": "...", "field": "optional"}`. Stable codes: `validation_error`, `not_found`, `unauthorized`, `conflict`, `auth_required`, `auth_invalid`.
- **Frontend Components**: Edit-in-place pattern using `useEditInPlace` hook. Validation centralized in `frontend/src/utils/validation.ts`.
- **Error Handling**: Backend raises HTTPException. Frontend catches with ErrorBoundary, shows messages via react-hot-toast.
- **Imports**: Backend uses relative imports (`from app.database import`). Frontend uses TypeScript path aliases (`@/hooks/useAuth`).
- **Environment**: Backend uses `.env` (DATABASE_URL, SECRET_KEY). Frontend uses `.env` with VITE_ prefix.
- **Security**: PyJWT for token creation/validation. bcrypt (direct, no passlib) for password hashing. No `python-jose`.
- **Styling**: Provence-themed palette in `frontend/src/theme.css` using CSS custom properties (`--color-lavender`, `--color-terra`).

## CI/CD
- Two independent CI pipelines: `ci-backend.yml` and `ci-frontend.yml` (no dependency between them).
- Each CI builds a Docker container and pushes to ghcr.io on main.
- Dependency updates via Renovate (monthly schedule, grouped by ecosystem).
- API contract tests validate OpenAPI schema compatibility between front and back.

## Integration Points
- **CORS**: Configured in `backend/app/core/config.py`. Dev: localhost only. Prod: explicit domain(s).
- **Seeds**: CSV data (`backend/seeds/src_dict.csv`) loaded via `seeds/seed_all.py`.
- **Pagination**: Backend supports skip/limit; frontend uses `usePagination` hook.
- **Image Uploads**: Base64 encoding in frontend, stored in DB via `stored_image` fields.
- **Auth cookie**: HttpOnly `access_token` cookie set on login, cleared on logout.
