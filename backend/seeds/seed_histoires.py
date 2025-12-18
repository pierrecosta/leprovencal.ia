
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
        ),
        Histoire(
            titre="Ma 2ème histoire",
            typologie="Histoire",
            periode="1ère ère : Jusqu'à l'an 1000",
            description_courte="Les fondations en Provence",
            description_longue="Lorem ipsum dolor sit amet...",
            source_url="https://example.com/histoire2"
        ),
        Histoire(
            titre="Ma 3ème histoire",
            typologie="Histoire",
            periode="2ème ère : Jusqu'à l'an 2000",
            description_courte="La solidification en Provence",
            description_longue="Lorem ipsum dolor sit amet...",
            source_url="https://example.com/histoire3"
        ),
        Histoire(
            titre="Ma 1ère légende",
            typologie="Légende",
            periode="Avant JC",
            description_courte="Le borgne à 2 yeux",
            description_longue="Lorem ipsum dolor sit amet...",
            source_url="https://example.com/legende1"
        ),
        Histoire(
            titre="Ma 2ème légende",
            typologie="Légende",
            periode="2ème ère : Jusqu'à l'an 2000",
            description_courte="Les héros de Provence",
            description_longue="Lorem ipsum dolor sit amet...",
            source_url="https://example.com/legende2"
        )
    ]
    db.add_all(histoires)
    db.commit()
    db.close()
    print("✅ Histoires ajoutées avec succès !")

if __name__ == "__main__":
    seed_histoires()
