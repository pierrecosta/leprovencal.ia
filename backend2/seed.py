
from app import db, Article, Histoire, app

# Créer le contexte de l'application
with app.app_context():
    # Supprimer les données existantes (optionnel)
    db.drop_all()
    db.create_all()

    # Ajouter des articles
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
        ),
        Article(
            titre="Découverte de la Provence 22",
            description="Deux voyages au cœur des paysages provençaux.",
            image_url="https://via.placeholder.com/150",
            source_url="https://example.com/article3"
        ),
        Article(
            titre="Cuisinez à la Provençale",
            description="Les saveurs touristiques de la région.",
            image_url="https://via.placeholder.com/150",
            source_url="https://example.com/article4"
        )
    ]
    db.session.add_all(articles)

    # Ajouter des histoires dans histoire et legendes
    histoires = [
        Histoire(
          titre="Ma 1ère histoire",
          periode="Avant JC",
          typologie="Histoire",
          description_courte="Les commencements en provence",
          description_longue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, \
            dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius \
              a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum \
                diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque\
                    congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede.\
                        Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in \
                          faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque \
                            fermentum. Maecenas adipiscing ante non diam sodales hendrerit. Ut velit mauris, egestas sed, gravida nec, \
                              ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin. Fusce varius, ligula non\
                                  tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus\
                                      nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae \
                                        elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat\
                                            non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus,\
                                                convallis id, congue eu, quam. Mauris ullamcorper felis vitae erat. Proin feugiat, \
                                                  augue non elementum posuere, metus purus iaculis lectus, et tristique ligula justo \
                                                    vitae magna.",
          source_url="https://example.com/histoire1"
        )
    ]
    db.session.add_all(histoires)

    # Valider les changements
    db.session.commit()
    print("Base de données initialisée avec succès !")
