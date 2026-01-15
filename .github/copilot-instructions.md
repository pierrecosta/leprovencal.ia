# AI Coding Agent Instructions for leprovencal.ia

## Architecture Overview
- **Backend**: FastAPI (Python) with SQLAlchemy ORM, PostgreSQL database, JWT authentication via PyJWT/bcrypt. Routes in `backend/app/routes/` for articles, auth, dictionnaire, histoires, cartes. CORS enabled for localhost:3000, 5173, 4173, 8000.
- **Frontend**: React 18 with Vite 5 + TypeScript, Tailwind CSS, Axios for API calls, React Router v7 for navigation. Components in `frontend/src/components/`, pages in `frontend/src/pages/`, hooks in `frontend/src/hooks/`, types in `frontend/src/types/`.
- **Frontend Legacy**: `frontend-old/` contains deprecated CRA (JavaScript) version - DO NOT MODIFY.
- **Data Flow**: Frontend fetches public data (articles, dictionary, stories, cartes) via GET endpoints. Authenticated users can CRUD via PUT/POST/DELETE with Bearer tokens (in-memory + HttpOnly cookies).
- **Styling**: Provence-themed color palette in `frontend/src/theme.css` using CSS custom properties (e.g., `--color-lavender`, `--color-terra`). Use Tailwind classes with these vars.

## Key Workflows
- **Backend Setup**: `cd backend/ && source venv/bin/activate && python init_app.py` (checks DB, runs migrations, seeds data). Run `uvicorn app.main:app --reload` for dev server (port 8000).
- **Frontend Setup**: `cd frontend/ && npm run dev` (runs on localhost:5173). For preview: `npm run build && npm run preview` (port 4173).
- **Database**: Use `psql -U myuser -d provencal_db` for direct DB access. Migrations: `alembic revision --autogenerate -m "msg" && alembic upgrade head`.
- **Auth**: Login via `/auth/login` (OAuth2 form), stores token in-memory + HttpOnly cookies. Use `useAuth` hook for user state. Protect routes with `require_authenticated` dependency.

## Project Conventions
- **API Responses**: Use Pydantic schemas in `backend/app/schemas.py` for validation/serialization. Models in `backend/app/models.py` with SQLAlchemy.
- **Frontend Components**: Edit-in-place pattern using `useEditInPlace` hook (TypeScript): view state, form state, hasChanges check, validation before save. Centralized validation in `frontend/src/utils/validation.ts` and `frontend/src/utils/helpers.ts`.
- **Error Handling**: Backend raises HTTPException with status/details. Frontend catches in try/catch with ErrorBoundary fallback, shows user-friendly messages via react-hot-toast.
- **Imports**: Backend uses relative imports (`from app.database import`). Frontend uses TypeScript path aliases (`@/hooks/useAuth`, `@/utils/validation`) configured in tsconfig.json.
- **Environment**: Backend uses `.env` (DATABASE_URL, SECRET_KEY, etc.). Frontend uses `.env` with VITE_ prefix (VITE_API_URL defaults to http://localhost:8000).

## Integration Points
- **CORS**: Configured in `backend/app/core/config.py` with ALLOWED_ORIGINS supporting localhost:3000, 5173, 4173, 8000 (and 127.0.0.1 variants).
- **Seeds**: Initial data from CSV (`backend/seeds/src_dict.csv`) loaded via `seeds/seed_all.py`.
- **Pagination**: Backend supports skip/limit on GET endpoints; frontend uses `usePagination` hook.
- **Image Uploads**: Base64 encoding in frontend, stored in DB via `stored_image` fields on articles/cartes models.
- **Validation**: Centralized in `frontend/src/utils/validation.ts` with constants (MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES, ALLOWED_IFRAME_PORTS).

Reference: `backend/app/main.py`, `backend/app/core/config.py`, `frontend/src/App.tsx`, `frontend/src/services/api.ts`, `frontend/src/hooks/useEditInPlace.ts`, `frontend/src/utils/validation.ts`.