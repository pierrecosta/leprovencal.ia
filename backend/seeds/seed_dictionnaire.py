
import csv, os
from app.database import SessionLocal
from app.models import Dictionnaire

def seed_dictionnaire():
    db = SessionLocal()
    csv_file = os.path.join(os.path.dirname(__file__), "src_dict.csv")
    with open(csv_file, mode="r", encoding="latin-1") as file:
        reader = csv.DictReader(file, delimiter=";")
        for row in reader:
            mot = Dictionnaire(
                mots_francais=row.get("Mot francais"),
                synonymes_francais=row.get("Synonyme francais"),
                mots_provencal=row.get("Traduction"),
                eg_provencal=row.get("TradEG"),
                d_provencal=row.get("TradD"),
                a_provencal=row.get("TradA"),
                h_provencal=row.get("TradH"),
                av_provencal=row.get("TradAv"),
                p_provencal=row.get("TradP"),
                x_provencal=row.get("TradX"),
                theme=row.get("Thème"),
                categorie=row.get("Catégorie"),
                description=row.get("Description")
            )
            db.add(mot)
    db.commit()
    db.close()
    print("✅ Dictionnaire importé avec succès !")

if __name__ == "__main__":
    seed_dictionnaire()
