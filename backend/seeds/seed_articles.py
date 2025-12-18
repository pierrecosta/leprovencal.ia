
from app.database import SessionLocal
from app.models import Article

def seed_articles():
    db = SessionLocal()
    articles = [
        Article(
            titre="Découverte de la Provence",
            description="Un voyage au cœur des paysages provençaux.",
            image_url="https://via.placeholder.com/150",
            source_url="https://example.com/article1"
        ),
        Article(
            titre="Cuisine Provençale",
            description="Les saveurs authentiques de la région.",
            image_url="https://via.placeholder.com/150",
            source_url="https://example.com/article2"
        )
    ]
    db.add_all(articles)
    db.commit()
    db.close()
    print("✅ Articles ajoutés avec succès !")

if __name__ == "__main__":
    seed_articles()
