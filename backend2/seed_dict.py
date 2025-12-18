
import csv
from app import db, Dictionnaire, app

# Créer le contexte de l'application
with app.app_context():
    # Supprimer les données existantes
    db.session.query(Dictionnaire).delete()
    db.session.commit()

    # Créer la table si elle n'existe pas
    db.create_all()

    # Charger les données depuis le CSV
    csv_file = "src_dict.csv"
    with open(csv_file, mode="r", encoding="latin-1") as file:
        reader = csv.DictReader(file, delimiter=";")
        for row in reader:
            print (row)
            # Créer un objet Dictionnaire pour chaque ligne
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
            db.session.add(mot)

    # Valider les insertions
    db.session.commit()
    print("Import terminé avec succès !")
