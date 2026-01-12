from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
import logging
import time

from app.core.config import get_settings
from app.database import get_db
from app.routes import auth, articles, dictionnaire, histoires, cartes

settings = get_settings()

logger = logging.getLogger(__name__)
_app_start_ts = time.time()

def _is_production(env: str) -> bool:
    return env.lower() in {"prod", "production"}

app = FastAPI(title="API Provençale", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["*"] if not _is_production(settings.env) else ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"] if not _is_production(settings.env) else ["Authorization", "Content-Type"],
    expose_headers=["*"] if not _is_production(settings.env) else ["Retry-After"],
)

@app.get("/health", tags=["Health"])
def health(db: Session = Depends(get_db)):
    """
    Healthcheck enrichi:
    - status: ok/degraded
    - db: ok/error
    - uptime_seconds
    - version
    """
    db_ok = True
    db_error = None
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = False
        db_error = "db_unreachable"
        logger.exception("Healthcheck DB failed")

    status_value = "ok" if db_ok else "degraded"
    return {
        "status": status_value,
        "db": "ok" if db_ok else "error",
        "db_error": db_error,
        "uptime_seconds": int(time.time() - _app_start_ts),
        "version": app.version,
    }

# Monte tes routers (ne pas ajouter CORS dans les routers)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(articles.router, prefix="/articles", tags=["Articles"])
app.include_router(dictionnaire.router, prefix="/dictionnaire", tags=["Dictionnaire"])
app.include_router(histoires.router, prefix="/histoires", tags=["Histoires"])
app.include_router(cartes.router, prefix="/cartes", tags=["Cartes"])