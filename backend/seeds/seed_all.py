
from seeds.seed_articles import seed_articles
from seeds.seed_histoires import seed_histoires
from seeds.seed_dictionnaire import seed_dictionnaire

if __name__ == "__main__":
    print("🚀 Initialisation des données...")
    seed_articles()
    seed_histoires()
    seed_dictionnaire()
    print("✅ Toutes les données ont été ajoutées avec succès !")
