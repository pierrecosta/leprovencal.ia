from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.models import Carte

settings = get_settings()


def seed_cartes() -> None:
    engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    default_cartes = [
        {
            "titre": "Carte historique 1",
            "iframe_url": "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f1.item.mini",
            "legende": "Provence historique",
        },
        {
            "titre": "Carte historique 2",
            "iframe_url": "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f2.item.mini",
            "legende": "Provence historique",
        },
        {
            "titre": "Carte historique 3",
            "iframe_url": "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f3.item.mini",
            "legende": "Provence historique",
        },
        {
            "titre": "Carte historique 4",
            "iframe_url": "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f4.item.mini",
            "legende": "Provence historique",
        },
        {
            "titre": "Carte historique 5",
            "iframe_url": "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f5.item.mini",
            "legende": "Provence historique",
        },
    ]

    with SessionLocal() as db:
        existing = db.query(Carte).count()
        if existing > 0:
            return

        db.add_all([Carte(**row) for row in default_cartes])
        db.commit()
