# AI Coding Agent Instructions for leprovencal.ia

## Architecture Overview
- **Backend**: FastAPI (Python) with SQLAlchemy ORM, PostgreSQL database, JWT authentication via PyJWT/bcrypt. Routes in `backend/app/routes/` for articles, auth, dictionnaire, histoires. CORS enabled for localhost:3000.
- **Frontend**: React (CRA) with Tailwind CSS, Axios for API calls, React Router for navigation. Components in `frontend/src/components/`, pages in `frontend/src/pages/`, hooks in `frontend/src/hooks/`.
- **Data Flow**: Frontend fetches public data (articles, dictionary, stories) via GET endpoints. Authenticated users can CRUD articles/dictionary via PUT/POST/DELETE with Bearer tokens stored in localStorage.
- **Styling**: Provence-themed color palette in `frontend/src/theme.css` using CSS custom properties (e.g., `--color-lavender`, `--color-terra`). Use Tailwind classes with these vars.

## Key Workflows
- **Backend Setup**: `cd backend/ && source venv/bin/activate && python init_app.py` (checks DB, runs migrations, seeds data). Run `uvicorn app.main:app --reload` for dev server.
- **Frontend Setup**: `cd frontend/ && npm start` (runs on localhost:3000).
- **Database**: Use `psql -U myuser -d provencal_db` for direct DB access. Migrations: `alembic revision --autogenerate -m "msg" && alembic upgrade head`.
- **Auth**: Login via `/auth/login` (OAuth2 form), stores token in localStorage. Use `useAuth` hook for user state. Protect routes with `require_authenticated` dependency.

## Project Conventions
- **API Responses**: Use Pydantic schemas in `backend/app/schemas.py` for validation/serialization. Models in `backend/app/models.py` with SQLAlchemy.
- **Frontend Components**: Edit-in-place pattern (e.g., `ArticleCard.jsx`): view state, form state, hasChanges check, validation before save. Use `useMemo` for change detection.
- **Error Handling**: Backend raises HTTPException with status/details. Frontend catches in try/catch, shows user-friendly messages.
- **Imports**: Backend uses relative imports (`from app.database import`). Frontend uses relative from src (e.g., `../hooks/useAuth`).
- **Environment**: Load from `.env` (DATABASE_URL, SECRET_KEY, etc.). Default API_BASE is localhost:8000.

## Integration Points
- **CORS**: Configured in `backend/app/main.py` for frontend dev.
- **Seeds**: Initial data from CSV (`backend/seeds/src_dict.csv`) loaded via `seeds/seed_all.py`.
- **Pagination**: Backend supports skip/limit on GET endpoints; frontend uses `usePagination` hook.

Reference: `backend/app/main.py`, `frontend/src/App.jsx`, `frontend/src/services/api.js`, `frontend/src/components/ArticleCard.jsx`.