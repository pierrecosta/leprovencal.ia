
from app.database import SessionLocal
from app.models import Histoire

def seed_histoires():
    db = SessionLocal()
    histoires = [
        Histoire(
            titre="Ma 1ère histoire",
            typologie="Histoire",
            periode="Avant JC",
            description_courte="Les commencements en Provence",
            description_longue="Lorem ipsum dolor sit amet...",
            source_url="https://example.com/histoire1"
        )
    ]
    db.add_all(histoires)
    db.commit()
    db.close()
    print("✅ Histoires ajoutées avec succès !")

if __name__ == "__main__":
    seed_histoires()
