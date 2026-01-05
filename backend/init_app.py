import subprocess
import sys
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

from app.core.config import get_settings

settings = get_settings()

def check_db_connection():
    print("🔍 Vérification de la connexion à la base...")
    try:
        engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
        with engine.connect():
            print("✅ Connexion à la base réussie !")
    except OperationalError as e:
        print("❌ Impossible de se connecter à la base :", e)
        sys.exit(1)

def run_alembic_migrations():
    print("⚙️ Application des migrations Alembic...")
    result = subprocess.run(["alembic", "upgrade", "head"])
    if result.returncode == 0:
        print("✅ Migrations appliquées avec succès !")
    else:
        print("❌ Erreur lors des migrations.")
        sys.exit(1)

def run_seeds():
    print("🌱 Insertion des données initiales...")
    result = subprocess.run([sys.executable, "-m", "seeds.seed_all"])
    if result.returncode == 0:
        print("✅ Seeds exécutés avec succès !")
    else:
        print("❌ Erreur lors de l'exécution des seeds.")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 Initialisation complète du projet...")
    check_db_connection()
    run_alembic_migrations()
    run_seeds()
