import subprocess
import sys
import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

from app.core.config import get_settings

settings = get_settings()

def _is_production(env: str) -> bool:
    return env.lower() in {"prod", "production"}

ENV = str(getattr(settings, "env", os.getenv("ENV", "development") or "development")).lower()
_requested_level = (os.getenv("LOG_LEVEL", getattr(settings, "log_level", "INFO")) or "INFO").upper()
_effective_level = "INFO" if (_is_production(ENV) and _requested_level == "DEBUG") else _requested_level

logging.basicConfig(
    level=_effective_level,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger("init_app")

def check_db_connection():
    logger.info("Vérification de la connexion à la base...")
    try:
        engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
        with engine.connect():
            logger.info("Connexion à la base réussie.")
    except OperationalError:
        # En prod, éviter les traces qui peuvent contenir des détails sensibles
        if _is_production(ENV):
            logger.error("Impossible de se connecter à la base.")
        else:
            logger.exception("Impossible de se connecter à la base.")
        sys.exit(1)

def run_alembic_migrations():
    logger.info("Application des migrations Alembic...")
    result = subprocess.run(["alembic", "upgrade", "head"])
    if result.returncode == 0:
        logger.info("Migrations appliquées avec succès.")
    else:
        logger.error("Erreur lors des migrations (code=%s).", result.returncode)
        sys.exit(1)

def run_seeds():
    logger.info("Insertion des données initiales (seeds)...")
    result = subprocess.run([sys.executable, "-m", "seeds.seed_all"])
    if result.returncode == 0:
        logger.info("Seeds exécutés avec succès.")
    else:
        logger.error("Erreur lors de l'exécution des seeds (code=%s).", result.returncode)
        sys.exit(1)

if __name__ == "__main__":
    logger.info("Initialisation complète du projet...")
    check_db_connection()
    run_alembic_migrations()
    run_seeds()
